import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Circle,
  Clock,
  ArrowRight,
  Play,
  Zap,
  CheckCircle,
  Plus,
  X,
  ChevronDown,
  Check,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  getProjects,
  getTasks,
  addTask,
  updateTaskStatus,
  getRecentSessions,
  getClaudeStats,
  type Project,
  type Task,
  type ClaudeSession,
  type ClaudeStats,
} from "@/services/tauri";

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Format token count
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
}

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<ClaudeSession[]>([]);
  const [stats, setStats] = useState<ClaudeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, sessionsData, statsData] = await Promise.all([
        getProjects(),
        getTasks(),
        getRecentSessions(10).catch(() => []),
        getClaudeStats().catch(() => null),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
      setSessions(sessionsData);
      setStats(statsData);
      if (projectsData.length > 0 && !newTaskProjectId) {
        setNewTaskProjectId(projectsData[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim() || !newTaskProjectId) return;

    try {
      const newTask = await addTask(newTaskProjectId, newTaskContent.trim());
      setTasks([newTask, ...tasks]);
      setNewTaskContent("");
      setShowAddTask(false);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const updatedTask = await updateTaskStatus(task.id, newStatus);
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
    if (e.key === "Escape") {
      setShowAddTask(false);
      setNewTaskContent("");
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "Unknown";
  };

  const selectedProject = projects.find((p) => p.id === newTaskProjectId);

  // Get the first in-progress task as today's focus
  const todaysFocus = tasks.find((t) => t.status === "in_progress") || tasks.find((t) => t.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Project Quick Switch */}
      {projects.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          {projects.slice(0, 4).map((project) => (
            <button
              key={project.id}
              className="px-3 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-full transition-colors"
            >
              {project.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero - What to work on */}
      <div className="text-center py-6">
        <p className="text-xs text-text-muted mb-2">TODAY'S FOCUS</p>
        {todaysFocus ? (
          <>
            <h1 className="text-xl font-medium text-text-primary mb-1">
              {todaysFocus.content}
            </h1>
            <p className="text-sm text-text-muted">
              {getProjectName(todaysFocus.project_id)} · {todaysFocus.status === "in_progress" ? "In Progress" : "Pending"}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-medium text-text-primary mb-1">
              No tasks yet
            </h1>
            <p className="text-sm text-text-muted">
              Add a task to get started
            </p>
          </>
        )}
        <button className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded transition-colors inline-flex items-center gap-2">
          <Play size={14} />
          Continue Session
        </button>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-warning" />
          <span>{stats ? formatTokens(stats.tokens_today) : "0"} tokens today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={12} className="text-info" />
          <span>{stats?.messages_today || 0} messages</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={12} className="text-success" />
          <span>{tasks.filter((t) => t.status === "completed").length} tasks done</span>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6">

        {/* Recent Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              <span className="text-sm text-text-primary">Recent Sessions</span>
            </div>
            <span className="text-xs text-text-muted">{sessions.length} sessions</span>
          </div>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                No Claude sessions found
              </div>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <Card
                  key={session.id}
                  className="cursor-pointer transition-colors hover:border-border-default"
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-text-primary truncate">{session.project_name}</div>
                        <div className="text-xs text-text-muted truncate">{session.first_message}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted flex-shrink-0 ml-2">
                      <span>{formatRelativeTime(session.last_activity)}</span>
                      <ArrowRight size={12} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-primary">Tasks</span>
            <button
              onClick={() => setShowAddTask(true)}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
              disabled={projects.length === 0}
            >
              + Add
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTask && projects.length > 0 && (
            <div className="mb-3 p-3 bg-bg-elevated border border-border-subtle rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <button
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-bg-surface border border-border-subtle rounded hover:border-accent transition-colors"
                  >
                    <span className="text-text-secondary">{selectedProject?.name || "Select project"}</span>
                    <ChevronDown size={12} className="text-text-muted" />
                  </button>
                  {showProjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-bg-surface border border-border-subtle rounded shadow-lg z-10">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setNewTaskProjectId(project.id);
                            setShowProjectDropdown(false);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-left text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTaskContent("");
                  }}
                  className="ml-auto p-1 text-text-muted hover:text-text-secondary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What needs to be done?"
                  autoFocus
                  className="flex-1 px-2 py-1.5 text-sm bg-bg-surface border border-border-subtle rounded outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskContent.trim() || !newTaskProjectId}
                  className="px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="mt-2 text-[10px] text-text-muted">
                Press Enter to add · Esc to cancel
              </div>
            </div>
          )}

          {projects.length === 0 && (
            <div className="text-center py-6 text-xs text-text-muted">
              Add a project first to create tasks
            </div>
          )}

          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-2 rounded hover:bg-bg-hover/50 cursor-pointer transition-colors ${
                  task.status === "completed" ? "opacity-50" : ""
                }`}
              >
                <button
                  onClick={() => handleToggleTaskStatus(task)}
                  className="flex-shrink-0"
                >
                  {task.status === "completed" ? (
                    <Check size={14} className="text-success" />
                  ) : task.status === "in_progress" ? (
                    <Clock size={14} className="text-warning" />
                  ) : (
                    <Circle size={14} className="text-text-muted" />
                  )}
                </button>
                <div className="flex-1">
                  <div className={`text-sm ${
                    task.status === "completed"
                      ? "text-text-muted line-through"
                      : "text-text-primary"
                  }`}>
                    {task.content}
                  </div>
                  <div className="text-xs text-text-muted">{getProjectName(task.project_id)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="text-center text-xs text-text-muted">
        Press <kbd className="px-1.5 py-0.5 bg-bg-elevated rounded text-text-secondary">⌘K</kbd> to search
      </div>

    </div>
  );
}
