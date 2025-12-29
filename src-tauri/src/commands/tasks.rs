use crate::db::Database;
use crate::models::Task;
use rusqlite::params;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_tasks(db: State<Database>, project_id: Option<String>) -> Result<Vec<Task>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let (query, params): (&str, Vec<String>) = if let Some(pid) = project_id {
        (
            "SELECT id, project_id, content, status, created_at, updated_at
             FROM tasks
             WHERE project_id = ?1
             ORDER BY created_at DESC",
            vec![pid],
        )
    } else {
        (
            "SELECT id, project_id, content, status, created_at, updated_at
             FROM tasks
             ORDER BY created_at DESC",
            vec![],
        )
    };

    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

    let params_refs: Vec<&dyn rusqlite::ToSql> = params
        .iter()
        .map(|s| s as &dyn rusqlite::ToSql)
        .collect();

    let tasks = stmt
        .query_map(params_refs.as_slice(), |row| {
            Ok(Task {
                id: row.get(0)?,
                project_id: row.get(1)?,
                content: row.get(2)?,
                status: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tasks)
}

#[tauri::command]
pub fn add_task(
    db: State<Database>,
    project_id: String,
    content: String,
) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let status = "pending".to_string();

    conn.execute(
        "INSERT INTO tasks (id, project_id, content, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![&id, &project_id, &content, &status, &now, &now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Task {
        id,
        project_id,
        content,
        status,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_task_status(
    db: State<Database>,
    id: String,
    status: String,
) -> Result<Task, String> {
    // Validate status
    if !["pending", "in_progress", "completed"].contains(&status.as_str()) {
        return Err("Invalid status. Must be 'pending', 'in_progress', or 'completed'".to_string());
    }

    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE tasks SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params![&status, &now, &id],
    )
    .map_err(|e| e.to_string())?;

    // Fetch and return updated task
    let task = conn
        .query_row(
            "SELECT id, project_id, content, status, created_at, updated_at FROM tasks WHERE id = ?1",
            params![&id],
            |row| {
                Ok(Task {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    content: row.get(2)?,
                    status: row.get(3)?,
                    created_at: row.get(4)?,
                    updated_at: row.get(5)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(task)
}

#[tauri::command]
pub fn delete_task(db: State<Database>, id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM tasks WHERE id = ?1", params![&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
