use crate::claude::{ClaudeMessage, ClaudeSession, ClaudeStats};
use crate::claude::sessions;
use crate::claude::stats;
use crate::db::Database;
use tauri::State;

/// Get usage statistics from Claude's stats-cache.json
#[tauri::command]
pub fn get_claude_stats() -> Result<ClaudeStats, String> {
    stats::get_claude_stats()
}

/// Get sessions for a specific project
#[tauri::command]
pub fn get_project_sessions(project_path: String) -> Result<Vec<ClaudeSession>, String> {
    sessions::get_project_sessions(&project_path)
}

/// Get recent sessions for tracked projects only
#[tauri::command]
pub fn get_recent_sessions(db: State<Database>, limit: u32) -> Result<Vec<ClaudeSession>, String> {
    // Get tracked project paths from database
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT path FROM projects")
        .map_err(|e| e.to_string())?;

    let project_paths: Vec<String> = stmt
        .query_map([], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    drop(stmt);
    drop(conn);

    if project_paths.is_empty() {
        return Ok(vec![]);
    }

    // Get sessions only for tracked projects
    sessions::get_sessions_for_projects(&project_paths, limit)
}

/// Get messages for a specific session
#[tauri::command]
pub fn get_session_messages(session_id: String) -> Result<Vec<ClaudeMessage>, String> {
    sessions::get_session_messages(&session_id)
}
