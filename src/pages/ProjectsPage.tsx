import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderPlus,
  MessageSquare,
  Clock,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  X,
  Folder,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

interface Project {
  id: string;
  name: string;
  path: string;
  sessions: number;
  lastActive: string;
  status: "active" | "idle";
}

const initialProjects: Project[] = [
  { id: "stoxly-core", name: "stoxly-core", path: "~/work/stoxly/stoxly_core", sessions: 45, lastActive: "2m ago", status: "active" },
  { id: "wavezync", name: "wavezync", path: "~/work/wavezync/durable", sessions: 28, lastActive: "15m ago", status: "active" },
  { id: "crewzync", name: "crewzync", path: "~/work/wavezync/crewzync", sessions: 67, lastActive: "1h ago", status: "idle" },
  { id: "stoxly-ai-mvp", name: "stoxly-ai-mvp", path: "~/work/stoxly/stoxly.ai.mvp", sessions: 23, lastActive: "3h ago", status: "idle" },
  { id: "docs", name: "docs", path: "~/work/docs", sessions: 12, lastActive: "1d ago", status: "idle" },
];

type ViewMode = "list" | "grid";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isAddingProject, setIsAddingProject] = useState(false);

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
        const pathParts = selected.split("/");
        const name = pathParts[pathParts.length - 1];

        // Check if project already exists
        if (projects.some((p) => p.path === selected)) {
          return;
        }

        const newProject: Project = {
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          path: selected.replace(/^\/Users\/[^/]+/, "~"),
          sessions: 0,
          lastActive: "Just added",
          status: "idle",
        };

        setProjects([newProject, ...projects]);
      }
    } catch (error) {
      console.error("Failed to open directory picker:", error);
    }
  };

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
            <Link key={project.id} to={`/projects/${project.id}`} className="block">
              <Card className="hover:border-border-default transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          project.status === "active" ? "bg-success" : "bg-text-muted"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{project.name}</div>
                        <div className="text-xs text-text-muted">{project.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <MessageSquare size={12} />
                        <span>{project.sessions}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={12} />
                        <span>{project.lastActive}</span>
                      </div>
                      {project.status === "active" && (
                        <Badge variant="success">Active</Badge>
                      )}
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
            <Link key={project.id} to={`/projects/${project.id}`} className="block">
              <Card className="hover:border-border-default transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-1 ${
                        project.status === "active" ? "bg-success" : "bg-text-muted"
                      }`}
                    />
                    {project.status === "active" && (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-text-primary mb-1">
                      {project.name}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {project.path}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{project.sessions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{project.lastActive}</span>
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
