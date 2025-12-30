use std::path::PathBuf;

/// Get the path to the ~/.claude directory
pub fn get_claude_home() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".claude"))
}

/// Encode a project path to Claude's format
/// /Users/kasun/work/foo -> -Users-kasun-work-foo
pub fn encode_project_path(path: &str) -> String {
    path.replace("/", "-")
}

/// Decode a Claude project directory name back to the original path
/// -Users-kasun-work-foo -> /Users/kasun/work/foo
pub fn decode_project_path(encoded: &str) -> String {
    if encoded.starts_with('-') {
        encoded.replacen("-", "/", 1).replace("-", "/")
    } else {
        encoded.replace("-", "/")
    }
}

/// Get the path to the Claude projects directory
pub fn get_claude_projects_dir() -> Option<PathBuf> {
    get_claude_home().map(|h| h.join("projects"))
}

/// Find the Claude project directory for a given project path
pub fn find_claude_project_dir(project_path: &str) -> Option<PathBuf> {
    let encoded = encode_project_path(project_path);
    let claude_dir = get_claude_projects_dir()?.join(&encoded);
    if claude_dir.exists() {
        Some(claude_dir)
    } else {
        None
    }
}

/// Get path to stats-cache.json
pub fn get_stats_cache_path() -> Option<PathBuf> {
    get_claude_home().map(|h| h.join("stats-cache.json"))
}

/// Get path to history.jsonl
pub fn get_history_path() -> Option<PathBuf> {
    get_claude_home().map(|h| h.join("history.jsonl"))
}

/// Get path to settings.json
pub fn get_settings_path() -> Option<PathBuf> {
    get_claude_home().map(|h| h.join("settings.json"))
}

/// List all Claude project directories
pub fn list_claude_projects() -> Vec<(String, PathBuf)> {
    let projects_dir = match get_claude_projects_dir() {
        Some(dir) if dir.exists() => dir,
        _ => return vec![],
    };

    let mut projects = vec![];

    if let Ok(entries) = std::fs::read_dir(&projects_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    let decoded_path = decode_project_path(name);
                    projects.push((decoded_path, path));
                }
            }
        }
    }

    projects
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_project_path() {
        assert_eq!(
            encode_project_path("/Users/kasun/work/foo"),
            "-Users-kasun-work-foo"
        );
    }

    #[test]
    fn test_decode_project_path() {
        assert_eq!(
            decode_project_path("-Users-kasun-work-foo"),
            "/Users/kasun/work/foo"
        );
    }
}
