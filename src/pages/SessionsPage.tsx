import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Zap, ArrowUpRight, Search, X, Loader2 } from "lucide-react";
import {
  getRecentSessions,
  type ClaudeSession,
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

// Determine session "status" based on recency
function getSessionStatus(session: ClaudeSession): "recent" | "today" | "older" {
  const lastActivity = new Date(session.last_activity);
  const now = new Date();
  const diffHours = (now.getTime() - lastActivity.getTime()) / 3600000;

  if (diffHours < 1) return "recent";
  if (diffHours < 24) return "today";
  return "older";
}

const statusColors: Record<string, string> = {
  recent: "bg-success",
  today: "bg-warning",
  older: "bg-text-muted",
};

const statusVariants: Record<string, "success" | "warning" | "secondary"> = {
  recent: "success",
  today: "warning",
  older: "secondary",
};

type FilterType = "all" | "recent" | "today" | "older";

export function SessionsPage() {
  const [sessions, setSessions] = useState<ClaudeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getRecentSessions(100);
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const status = getSessionStatus(session);

    // Apply status filter
    const matchesFilter =
      filter === "all" ||
      filter === status;

    // Apply search
    const matchesSearch =
      searchQuery === "" ||
      session.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.first_message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const recentCount = sessions.filter((s) => getSessionStatus(s) === "recent").length;
  const todayCount = sessions.filter((s) => getSessionStatus(s) === "today").length;
  const olderCount = sessions.filter((s) => getSessionStatus(s) === "older").length;

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: "all", label: "All", count: sessions.length },
    { id: "recent", label: "Recent", count: recentCount },
    { id: "today", label: "Today", count: todayCount },
    { id: "older", label: "Older", count: olderCount },
  ];

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
          <h1 className="text-sm font-medium text-text-primary">Sessions</h1>
          <p className="text-[10px] text-text-muted mt-0.5">
            {recentCount} recent · {sessions.length} total
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
            {searchQuery ? "No sessions match your search" : "No Claude sessions found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSessions.map((session) => {
            const status = getSessionStatus(session);
            return (
              <Card key={session.id} className="hover:border-border-default transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${statusColors[status]}`} />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-primary truncate">
                            {session.project_name}
                          </span>
                          <Badge variant={statusVariants[status]} className="flex-shrink-0">
                            {status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-text-muted line-clamp-1">
                          {session.first_message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={10} />
                            {session.message_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap size={10} />
                            {formatTokens(session.total_tokens)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatRelativeTime(session.last_activity)}
                          </span>
                          {session.model && (
                            <span className="text-text-muted truncate">
                              {session.model.split("-").slice(0, 2).join("-")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="p-1 hover:bg-bg-hover transition-colors rounded flex-shrink-0">
                      <ArrowUpRight size={14} className="text-text-muted" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
