use directories::BaseDirs;
use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self, String> {
        let db_path = get_db_path().map_err(|e| e.to_string())?;
        let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])
            .map_err(|e| e.to_string())?;

        // Initialize schema
        init_schema(&conn).map_err(|e| e.to_string())?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }
}

fn get_tusker_dir() -> Result<PathBuf, String> {
    let base_dirs = BaseDirs::new().ok_or("Could not find home directory")?;
    let tusker_dir = base_dirs.home_dir().join(".tusker");

    // Create directory if it doesn't exist
    if !tusker_dir.exists() {
        fs::create_dir_all(&tusker_dir)
            .map_err(|e| format!("Failed to create ~/.tusker: {}", e))?;
    }

    Ok(tusker_dir)
}

fn get_db_path() -> Result<PathBuf, String> {
    let tusker_dir = get_tusker_dir()?;
    Ok(tusker_dir.join("tusker.db"))
}

pub fn get_config_path() -> Result<PathBuf, String> {
    let tusker_dir = get_tusker_dir()?;
    Ok(tusker_dir.join("config.json"))
}

fn init_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            path TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        "
    )?;

    Ok(())
}
