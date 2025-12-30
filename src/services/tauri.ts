import { invoke } from "@tauri-apps/api/core";

// Types matching Rust structs
export interface Project {
  id: string;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Config {
  launch_on_startup: boolean;
  session_notifications: boolean;
  error_alerts: boolean;
  sound_enabled: boolean;
  daily_token_limit: number;
}

// Project commands
export async function getProjects(): Promise<Project[]> {
  return invoke<Project[]>("get_projects");
}

export async function addProject(path: string): Promise<Project> {
  return invoke<Project>("add_project", { path });
}

export async function deleteProject(id: string): Promise<void> {
  return invoke("delete_project", { id });
}

export async function updateProject(
  id: string,
  name?: string
): Promise<Project> {
  return invoke<Project>("update_project", { id, name });
}

// Task commands
export async function getTasks(projectId?: string): Promise<Task[]> {
  return invoke<Task[]>("get_tasks", { projectId });
}

export async function addTask(
  projectId: string,
  content: string
): Promise<Task> {
  return invoke<Task>("add_task", { projectId, content });
}

export async function updateTaskStatus(
  id: string,
  status: Task["status"]
): Promise<Task> {
  return invoke<Task>("update_task_status", { id, status });
}

export async function deleteTask(id: string): Promise<void> {
  return invoke("delete_task", { id });
}

// Config commands
export async function getConfig(): Promise<Config> {
  return invoke<Config>("get_config");
}

export async function saveConfig(config: Config): Promise<void> {
  return invoke("save_config", { config });
}

// Claude types
export interface ClaudeSession {
  id: string;
  project_path: string;
  project_name: string;
  first_message: string;
  message_count: number;
  total_tokens: number;
  model: string | null;
  started_at: string;
  last_activity: string;
}

export interface ClaudeMessage {
  uuid: string;
  parent_uuid: string | null;
  session_id: string;
  msg_type: "user" | "assistant";
  content: string;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  timestamp: string;
}

export interface DailyActivity {
  date: string;
  message_count: number;
  session_count: number;
  tool_call_count: number;
}

export interface ModelUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
}

export interface ClaudeStats {
  total_sessions: number;
  total_messages: number;
  last_computed: string;
  first_session_date: string | null;
  daily_activity: DailyActivity[];
  model_usage: Record<string, ModelUsage>;
  longest_session: {
    session_id: string;
    duration: number;
    message_count: number;
    timestamp: string;
  } | null;
  tokens_today: number;
  messages_today: number;
  sessions_today: number;
}

// Claude commands
export async function getClaudeStats(): Promise<ClaudeStats> {
  return invoke<ClaudeStats>("get_claude_stats");
}

export async function getProjectSessions(projectPath: string): Promise<ClaudeSession[]> {
  return invoke<ClaudeSession[]>("get_project_sessions", { projectPath });
}

export async function getRecentSessions(limit: number): Promise<ClaudeSession[]> {
  return invoke<ClaudeSession[]>("get_recent_sessions", { limit });
}

export async function getSessionMessages(sessionId: string): Promise<ClaudeMessage[]> {
  return invoke<ClaudeMessage[]>("get_session_messages", { sessionId });
}
