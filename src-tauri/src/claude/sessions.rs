use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::path::PathBuf;

use super::paths::{find_claude_project_dir, get_claude_projects_dir};

/// A single message in a Claude session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeMessage {
    pub uuid: String,
    pub parent_uuid: Option<String>,
    pub session_id: String,
    pub msg_type: String,  // "user" or "assistant"
    pub content: String,
    pub model: Option<String>,
    pub input_tokens: Option<u64>,
    pub output_tokens: Option<u64>,
    pub timestamp: String,
}

/// Session summary for listing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeSession {
    pub id: String,
    pub project_path: String,
    pub project_name: String,
    pub first_message: String,
    pub message_count: u32,
    pub total_tokens: u64,
    pub model: Option<String>,
    pub started_at: String,
    pub last_activity: String,
}

/// Raw JSONL line structure (for parsing)
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawMessageLine {
    uuid: String,
    parent_uuid: Option<String>,
    session_id: Option<String>,
    #[serde(rename = "type")]
    msg_type: Option<String>,
    message: Option<Value>,
    timestamp: Option<String>,
    cwd: Option<String>,
}

/// Parse a single JSONL line into a ClaudeMessage
fn parse_message_line(line: &str) -> Option<ClaudeMessage> {
    let raw: RawMessageLine = serde_json::from_str(line).ok()?;

    let msg_type = raw.msg_type.unwrap_or_default();
    if msg_type != "user" && msg_type != "assistant" {
        return None;
    }

    let session_id = raw.session_id.unwrap_or_default();
    let timestamp = raw.timestamp.unwrap_or_default();

    // Extract content from message field
    let (content, model, input_tokens, output_tokens) = if let Some(msg) = raw.message {
        let content = extract_content(&msg);
        let model = msg.get("model").and_then(|v| v.as_str()).map(String::from);
        let (input, output) = extract_tokens(&msg);
        (content, model, input, output)
    } else {
        (String::new(), None, None, None)
    };

    Some(ClaudeMessage {
        uuid: raw.uuid,
        parent_uuid: raw.parent_uuid,
        session_id,
        msg_type,
        content,
        model,
        input_tokens,
        output_tokens,
        timestamp,
    })
}

/// Extract text content from message field
fn extract_content(msg: &Value) -> String {
    // Check if content is a string
    if let Some(content) = msg.get("content") {
        if let Some(text) = content.as_str() {
            return text.to_string();
        }
        // Content might be an array of content blocks
        if let Some(arr) = content.as_array() {
            let texts: Vec<String> = arr
                .iter()
                .filter_map(|item| {
                    if item.get("type")?.as_str()? == "text" {
                        item.get("text")?.as_str().map(String::from)
                    } else {
                        None
                    }
                })
                .collect();
            return texts.join("\n");
        }
    }
    String::new()
}

/// Extract token counts from message
fn extract_tokens(msg: &Value) -> (Option<u64>, Option<u64>) {
    if let Some(usage) = msg.get("usage") {
        let input = usage.get("input_tokens").and_then(|v| v.as_u64());
        let output = usage.get("output_tokens").and_then(|v| v.as_u64());
        (input, output)
    } else {
        (None, None)
    }
}

/// Parse a session JSONL file and return all messages
pub fn parse_session_file(path: &PathBuf) -> Result<Vec<ClaudeMessage>, String> {
    let file = File::open(path)
        .map_err(|e| format!("Failed to open session file: {}", e))?;

    let reader = BufReader::new(file);
    let mut messages = vec![];

    for line in reader.lines() {
        if let Ok(line_content) = line {
            if let Some(msg) = parse_message_line(&line_content) {
                messages.push(msg);
            }
        }
    }

    // Sort by timestamp
    messages.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));

    Ok(messages)
}

/// Get a session summary from its messages
fn summarize_session(session_id: &str, project_path: &str, messages: &[ClaudeMessage]) -> ClaudeSession {
    let first_user_message = messages
        .iter()
        .find(|m| m.msg_type == "user")
        .map(|m| truncate_string(&m.content, 100))
        .unwrap_or_else(|| "No messages".to_string());

    let total_tokens: u64 = messages
        .iter()
        .map(|m| m.input_tokens.unwrap_or(0) + m.output_tokens.unwrap_or(0))
        .sum();

    let model = messages
        .iter()
        .filter_map(|m| m.model.clone())
        .next();

    let started_at = messages
        .first()
        .map(|m| m.timestamp.clone())
        .unwrap_or_default();

    let last_activity = messages
        .last()
        .map(|m| m.timestamp.clone())
        .unwrap_or_default();

    let project_name = project_path
        .split('/')
        .last()
        .unwrap_or(project_path)
        .to_string();

    ClaudeSession {
        id: session_id.to_string(),
        project_path: project_path.to_string(),
        project_name,
        first_message: first_user_message,
        message_count: messages.len() as u32,
        total_tokens,
        model,
        started_at,
        last_activity,
    }
}

/// Truncate a string to max length
fn truncate_string(s: &str, max_len: usize) -> String {
    let s = s.trim().replace('\n', " ");
    if s.len() <= max_len {
        s
    } else {
        format!("{}...", &s[..max_len])
    }
}

/// Get all sessions for a specific project
pub fn get_project_sessions(project_path: &str) -> Result<Vec<ClaudeSession>, String> {
    let claude_dir = find_claude_project_dir(project_path)
        .ok_or_else(|| format!("No Claude data found for project: {}", project_path))?;

    let mut sessions = vec![];
    let mut session_messages: HashMap<String, Vec<ClaudeMessage>> = HashMap::new();
    let mut session_latest_mtime: HashMap<String, std::time::SystemTime> = HashMap::new();

    // Read all JSONL files in the project directory
    if let Ok(entries) = fs::read_dir(&claude_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().map(|e| e == "jsonl").unwrap_or(false) {
                // Get file modification time
                let file_mtime = path.metadata()
                    .and_then(|m| m.modified())
                    .ok();

                if let Ok(messages) = parse_session_file(&path) {
                    // Group messages by session_id and track latest mtime
                    for msg in messages {
                        let session_id = msg.session_id.clone();

                        // Track the latest file mtime for this session
                        if let Some(mtime) = file_mtime {
                            session_latest_mtime
                                .entry(session_id.clone())
                                .and_modify(|existing| {
                                    if mtime > *existing {
                                        *existing = mtime;
                                    }
                                })
                                .or_insert(mtime);
                        }

                        session_messages
                            .entry(session_id)
                            .or_default()
                            .push(msg);
                    }
                }
            }
        }
    }

    // Create session summaries
    for (session_id, messages) in session_messages {
        if !messages.is_empty() {
            let mut session = summarize_session(&session_id, project_path, &messages);

            // Override last_activity with file mtime if available (more accurate for active sessions)
            if let Some(mtime) = session_latest_mtime.get(&session_id) {
                if let Ok(duration) = mtime.duration_since(std::time::UNIX_EPOCH) {
                    let datetime = chrono::DateTime::from_timestamp(duration.as_secs() as i64, 0)
                        .unwrap_or_default();
                    session.last_activity = datetime.to_rfc3339();
                }
            }

            sessions.push(session);
        }
    }

    // Sort by last activity (most recent first)
    sessions.sort_by(|a, b| b.last_activity.cmp(&a.last_activity));

    Ok(sessions)
}

/// Get sessions for a specific list of tracked projects only
pub fn get_sessions_for_projects(project_paths: &[String], limit: u32) -> Result<Vec<ClaudeSession>, String> {
    let mut all_sessions = vec![];

    for project_path in project_paths {
        if let Ok(sessions) = get_project_sessions(project_path) {
            all_sessions.extend(sessions);
        }
    }

    // Sort by last activity and take top N
    all_sessions.sort_by(|a, b| b.last_activity.cmp(&a.last_activity));
    all_sessions.truncate(limit as usize);

    Ok(all_sessions)
}

/// Get messages for a specific session
pub fn get_session_messages(session_id: &str) -> Result<Vec<ClaudeMessage>, String> {
    let projects_dir = get_claude_projects_dir()
        .ok_or_else(|| "Could not find Claude projects directory".to_string())?;

    if !projects_dir.exists() {
        return Err("Claude projects directory not found".to_string());
    }

    // Search all project directories for the session
    if let Ok(entries) = fs::read_dir(&projects_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let project_dir = entry.path();
            if project_dir.is_dir() {
                // Check all JSONL files in this project
                if let Ok(files) = fs::read_dir(&project_dir) {
                    for file_entry in files.filter_map(|e| e.ok()) {
                        let file_path = file_entry.path();
                        if file_path.extension().map(|e| e == "jsonl").unwrap_or(false) {
                            if let Ok(messages) = parse_session_file(&file_path) {
                                let session_messages: Vec<_> = messages
                                    .into_iter()
                                    .filter(|m| m.session_id == session_id)
                                    .collect();

                                if !session_messages.is_empty() {
                                    return Ok(session_messages);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Err(format!("Session not found: {}", session_id))
}
