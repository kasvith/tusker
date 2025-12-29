mod commands;
mod db;
mod models;

use db::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize database
    let database = Database::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(database)
        .invoke_handler(tauri::generate_handler![
            // Project commands
            commands::projects::get_projects,
            commands::projects::add_project,
            commands::projects::delete_project,
            commands::projects::update_project,
            // Task commands
            commands::tasks::get_tasks,
            commands::tasks::add_task,
            commands::tasks::update_task_status,
            commands::tasks::delete_task,
            // Config commands
            commands::config::get_config,
            commands::config::save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
