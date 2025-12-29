use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub content: String,
    pub status: String, // "pending", "in_progress", "completed"
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    #[serde(default = "default_true")]
    pub launch_on_startup: bool,
    #[serde(default = "default_true")]
    pub session_notifications: bool,
    #[serde(default = "default_true")]
    pub error_alerts: bool,
    #[serde(default)]
    pub sound_enabled: bool,
    #[serde(default = "default_token_limit")]
    pub daily_token_limit: u32,
}

fn default_true() -> bool {
    true
}

fn default_token_limit() -> u32 {
    50000
}

impl Default for Config {
    fn default() -> Self {
        Config {
            launch_on_startup: true,
            session_notifications: true,
            error_alerts: true,
            sound_enabled: false,
            daily_token_limit: 50000,
        }
    }
}
