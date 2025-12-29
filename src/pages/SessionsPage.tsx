import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Zap, ArrowUpRight, Search, X } from "lucide-react";

interface Session {
  id: string;
  project: string;
  status: "active" | "idle" | "completed" | "error";
  messages: number;
  tokens: number;
  startedAt: string;
  preview: string;
}

const initialSessions: Session[] = [
  {
    id: "sess_abc123",
    project: "stoxly-core",
    status: "active",
    messages: 24,
    tokens: 3420,
    startedAt: "2m ago",
    preview: "Implementing authentication middleware...",
  },
  {
    id: "sess_def456",
    project: "wavezync",
    status: "active",
    messages: 12,
    tokens: 1890,
    startedAt: "15m ago",
    preview: "Adding WebSocket connection handling...",
  },
  {
    id: "sess_ghi789",
    project: "crewzync",
    status: "idle",
    messages: 45,
    tokens: 6230,
    startedAt: "1h ago",
    preview: "Fixed database migration issues...",
  },
  {
    id: "sess_jkl012",
    project: "stoxly-core",
    status: "completed",
    messages: 67,
    tokens: 8910,
    startedAt: "3h ago",
    preview: "Completed user dashboard implementation",
  },
  {
    id: "sess_mno345",
    project: "docs",
    status: "completed",
    messages: 23,
    tokens: 2100,
    startedAt: "1d ago",
    preview: "Updated API documentation",
  },
  {
    id: "sess_pqr678",
    project: "wavezync",
    status: "error",
    messages: 8,
    tokens: 950,
    startedAt: "2d ago",
    preview: "Build failed: TypeScript errors",
  },
];

const statusColors: Record<string, string> = {
  active: "bg-success",
  idle: "bg-warning",
  completed: "bg-info",
  error: "bg-error",
};

const statusVariants: Record<string, "success" | "warning" | "secondary" | "error"> = {
  active: "success",
  idle: "warning",
  completed: "secondary",
  error: "error",
};

type FilterType = "all" | "active" | "completed" | "error";

export function SessionsPage() {
  const [sessions] = useState<Session[]>(initialSessions);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((session) => {
    // Apply status filter
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && (session.status === "active" || session.status === "idle")) ||
      (filter === "completed" && session.status === "completed") ||
      (filter === "error" && session.status === "error");

    // Apply search
    const matchesSearch =
      searchQuery === "" ||
      session.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeCount = sessions.filter((s) => s.status === "active" || s.status === "idle").length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const errorCount = sessions.filter((s) => s.status === "error").length;

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: "all", label: "All", count: sessions.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "error", label: "Errors", count: errorCount },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium text-text-primary">Sessions</h1>
          <p className="text-[10px] text-text-muted mt-0.5">
            {activeCount} active · {sessions.length} total
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2 py-1 text-[10px] transition-colors rounded ${
                filter === f.id
                  ? "text-text-primary bg-bg-elevated border border-border-subtle"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className="ml-1 text-text-muted">({f.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sessions..."
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

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">
            {searchQuery ? "No sessions match your search" : "No sessions found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:border-border-default transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-1 rounded-full ${statusColors[session.status]}`} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">
                          {session.project}
                        </span>
                        <Badge variant={statusVariants[session.status]}>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-text-muted line-clamp-1">
                        {session.preview}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={10} />
                          {session.messages}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap size={10} />
                          {session.tokens.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {session.startedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="p-1 hover:bg-bg-hover transition-colors rounded">
                    <ArrowUpRight size={14} className="text-text-muted" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
