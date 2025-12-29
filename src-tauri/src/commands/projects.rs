use crate::db::Database;
use crate::models::Project;
use rusqlite::params;
use std::path::Path;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_projects(db: State<Database>) -> Result<Vec<Project>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, path, created_at, updated_at FROM projects ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let projects = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(projects)
}

#[tauri::command]
pub fn add_project(db: State<Database>, path: String) -> Result<Project, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Check if project already exists
    let exists: bool = conn
        .query_row(
            "SELECT 1 FROM projects WHERE path = ?1",
            params![&path],
            |_| Ok(true),
        )
        .unwrap_or(false);

    if exists {
        return Err("Project already exists".to_string());
    }

    // Extract project name from path
    let name = Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO projects (id, name, path, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![&id, &name, &path, &now, &now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Project {
        id,
        name,
        path,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_project(db: State<Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM projects WHERE id = ?1", params![&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_project(
    db: State<Database>,
    id: String,
    name: Option<String>,
) -> Result<Project, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    if let Some(new_name) = name {
        conn.execute(
            "UPDATE projects SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![&new_name, &now, &id],
        )
        .map_err(|e| e.to_string())?;
    }

    // Fetch and return updated project
    let project = conn
        .query_row(
            "SELECT id, name, path, created_at, updated_at FROM projects WHERE id = ?1",
            params![&id],
            |row| {
                Ok(Project {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    path: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(project)
}
