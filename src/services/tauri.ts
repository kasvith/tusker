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
