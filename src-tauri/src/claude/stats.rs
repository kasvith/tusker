use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;

use super::paths::get_stats_cache_path;

/// Daily activity entry from stats-cache.json
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyActivity {
    pub date: String,
    pub message_count: u32,
    pub session_count: u32,
    pub tool_call_count: u32,
}

/// Daily token usage by model
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyModelTokens {
    pub date: String,
    pub tokens_by_model: HashMap<String, u64>,
}

/// Model usage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelUsage {
    #[serde(default)]
    pub input_tokens: u64,
    #[serde(default)]
    pub output_tokens: u64,
    #[serde(default)]
    pub cache_read_input_tokens: u64,
    #[serde(default)]
    pub cache_creation_input_tokens: u64,
    #[serde(default)]
    pub web_search_requests: u32,
    #[serde(default)]
    pub cost_usd: f64,
}

/// Longest session info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LongestSession {
    pub session_id: String,
    pub duration: u64,
    pub message_count: u32,
    pub timestamp: String,
}

/// Raw stats-cache.json structure (for deserialization)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawStatsCache {
    #[serde(default)]
    version: u32,
    last_computed_date: Option<String>,
    #[serde(default)]
    daily_activity: Vec<DailyActivity>,
    #[serde(default)]
    daily_model_tokens: Vec<DailyModelTokens>,
    #[serde(default)]
    model_usage: HashMap<String, ModelUsage>,
    #[serde(default)]
    total_sessions: u32,
    #[serde(default)]
    total_messages: u32,
    longest_session: Option<LongestSession>,
    first_session_date: Option<String>,
    #[serde(default)]
    hour_counts: HashMap<String, u32>,
}

/// Cleaned up stats for frontend consumption
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeStats {
    pub total_sessions: u32,
    pub total_messages: u32,
    pub last_computed: String,
    pub first_session_date: Option<String>,
    pub daily_activity: Vec<DailyActivity>,
    pub model_usage: HashMap<String, ModelUsage>,
    pub longest_session: Option<LongestSession>,
    pub tokens_today: u64,
    pub messages_today: u32,
    pub sessions_today: u32,
}

/// Parse stats-cache.json and return structured stats
pub fn get_claude_stats() -> Result<ClaudeStats, String> {
    let stats_path = get_stats_cache_path()
        .ok_or_else(|| "Could not find Claude home directory".to_string())?;

    if !stats_path.exists() {
        return Err("stats-cache.json not found".to_string());
    }

    let content = fs::read_to_string(&stats_path)
        .map_err(|e| format!("Failed to read stats-cache.json: {}", e))?;

    let raw: RawStatsCache = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse stats-cache.json: {}", e))?;

    // Get today's date
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    // Find today's activity
    let today_activity = raw
        .daily_activity
        .iter()
        .find(|a| a.date == today);

    let (messages_today, sessions_today) = today_activity
        .map(|a| (a.message_count, a.session_count))
        .unwrap_or((0, 0));

    // Calculate today's tokens
    let tokens_today: u64 = raw
        .daily_model_tokens
        .iter()
        .find(|d| d.date == today)
        .map(|d| d.tokens_by_model.values().sum())
        .unwrap_or(0);

    Ok(ClaudeStats {
        total_sessions: raw.total_sessions,
        total_messages: raw.total_messages,
        last_computed: raw.last_computed_date.unwrap_or_else(|| today.clone()),
        first_session_date: raw.first_session_date,
        daily_activity: raw.daily_activity,
        model_usage: raw.model_usage,
        longest_session: raw.longest_session,
        tokens_today,
        messages_today,
        sessions_today,
    })
}

/// Get total token count across all models
pub fn get_total_tokens(stats: &ClaudeStats) -> u64 {
    stats
        .model_usage
        .values()
        .map(|m| m.input_tokens + m.output_tokens)
        .sum()
}

/// Get primary model (the one with most output tokens)
pub fn get_primary_model(stats: &ClaudeStats) -> Option<String> {
    stats
        .model_usage
        .iter()
        .max_by_key(|(_, usage)| usage.output_tokens)
        .map(|(model, _)| model.clone())
}
