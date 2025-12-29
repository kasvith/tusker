import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info, X, Bell, Check } from "lucide-react";

interface Notification {
  id: number;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "success",
    title: "Session completed",
    message: "stoxly-core: Finished implementing auth middleware",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    type: "error",
    title: "Build failed",
    message: "crewzync: npm run build exited with code 1",
    time: "15m ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Session started",
    message: "wavezync: New session started",
    time: "30m ago",
    read: true,
  },
  {
    id: 4,
    type: "warning",
    title: "High token usage",
    message: "Daily token usage at 80% of limit",
    time: "1h ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    title: "Tasks completed",
    message: "stoxly-core: All 5 tasks completed",
    time: "2h ago",
    read: true,
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={14} className="text-success" />,
  error: <AlertCircle size={14} className="text-error" />,
  warning: <AlertCircle size={14} className="text-warning" />,
  info: <Info size={14} className="text-info" />,
};

type FilterType = "all" | "success" | "error" | "warning" | "info";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.type === filter
  );

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "success", label: "Success" },
    { id: "error", label: "Errors" },
    { id: "warning", label: "Warnings" },
    { id: "info", label: "Info" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} new</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors"
            >
              <Check size={12} />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[10px] text-text-muted hover:text-error transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
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
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm text-text-muted">
            {notifications.length === 0
              ? "No notifications"
              : "No notifications match this filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? "border-accent/30 bg-accent/5" : ""
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    {typeIcons[notification.type]}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted">{notification.message}</p>
                      <span className="text-[10px] text-text-muted/50">{notification.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className="p-1 hover:bg-bg-hover transition-colors rounded"
                  >
                    <X size={12} className="text-text-muted hover:text-text-secondary" />
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
