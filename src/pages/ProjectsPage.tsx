import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderPlus,
  Clock,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  X,
  Folder,
  Trash2,
  Loader2,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  getProjects,
  addProject,
  deleteProject,
  type Project,
} from "@/services/tauri";

type ViewMode = "list" | "grid";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Directory",
      });

      if (selected && typeof selected === "string") {
        const newProject = await addProject(selected);
        setProjects([newProject, ...projects]);
      }
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const formatPath = (path: string) => {
    // Replace home directory with ~
    return path.replace(/^\/Users\/[^/]+/, "~");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-medium text-text-primary">Projects</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
        <button
          onClick={handleAddProject}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-white rounded transition-colors"
        >
          <FolderPlus size={14} />
          Add Project
        </button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-bg-elevated border border-border-subtle rounded outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-border-subtle rounded overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">
            {searchQuery ? "No projects match your search" : "No projects yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddProject}
              className="mt-3 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Add your first project
            </button>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="space-y-2">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block group">
              <Card className="hover:border-border-default transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-text-muted" />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{project.name}</div>
                        <div className="text-xs text-text-muted">{formatPath(project.path)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={12} />
                        <span>{formatDate(project.updated_at)}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-text-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-3 gap-3">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block group">
              <Card className="hover:border-border-default transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-2 h-2 rounded-full mt-1 bg-text-muted" />
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="p-1 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-text-primary mb-1">
                      {project.name}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {formatPath(project.path)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(project.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
