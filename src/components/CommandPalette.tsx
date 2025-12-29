import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    // Navigation
    { id: "nav-dashboard", label: "Go to Dashboard", icon: <LayoutDashboard size={14} />, action: () => { navigate("/"); onClose(); }, category: "Navigation" },
    { id: "nav-projects", label: "Go to Projects", icon: <FolderKanban size={14} />, action: () => { navigate("/projects"); onClose(); }, category: "Navigation" },
    { id: "nav-sessions", label: "Go to Sessions", icon: <MessageSquare size={14} />, action: () => { navigate("/sessions"); onClose(); }, category: "Navigation" },
    { id: "nav-notifications", label: "Go to Notifications", icon: <Bell size={14} />, action: () => { navigate("/notifications"); onClose(); }, category: "Navigation" },
    { id: "nav-settings", label: "Go to Settings", icon: <Settings size={14} />, action: () => { navigate("/settings"); onClose(); }, category: "Navigation" },
    // Actions
    { id: "action-add-project", label: "Add Project", icon: <Plus size={14} />, action: () => { console.log("Add project"); onClose(); }, category: "Actions" },
    // Projects (mock)
    { id: "proj-stoxly", label: "stoxly-core", icon: <FolderKanban size={14} />, action: () => { console.log("Open stoxly"); onClose(); }, category: "Projects" },
    { id: "proj-wavezync", label: "wavezync", icon: <FolderKanban size={14} />, action: () => { console.log("Open wavezync"); onClose(); }, category: "Projects" },
    { id: "proj-crewzync", label: "crewzync", icon: <FolderKanban size={14} />, action: () => { console.log("Open crewzync"); onClose(); }, category: "Projects" },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-[500px] bg-bg-surface border border-border-subtle shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle">
          <Search size={14} className="text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, projects..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[9px] text-text-muted bg-bg-base border border-border-subtle">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-auto py-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-3 py-1 text-[10px] font-medium text-text-muted uppercase">
                {category}
              </div>
              {items.map((cmd) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                      globalIndex === selectedIndex
                        ? "bg-accent/20 text-text-primary"
                        : "text-text-secondary hover:bg-bg-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {cmd.icon}
                      <span>{cmd.label}</span>
                    </div>
                    {globalIndex === selectedIndex && (
                      <ArrowRight size={12} className="text-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-3 py-4 text-xs text-text-muted text-center">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
