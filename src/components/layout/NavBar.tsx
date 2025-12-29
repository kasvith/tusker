import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Search,
  X,
  Minus,
  Maximize2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState } from "react";

interface TabProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function Tab({ to, icon, label, badge }: TabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all border-b-2",
          isActive
            ? "text-text-primary border-accent"
            : "text-text-muted hover:text-text-secondary border-transparent"
        )
      }
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-bg-elevated rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

interface NavBarProps {
  onCommandPalette?: () => void;
}

export function NavBar({ onCommandPalette }: NavBarProps) {
  const appWindow = getCurrentWindow();
  const [controlsHovered, setControlsHovered] = useState(false);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    appWindow.startDragging();
  };

  return (
    <nav className="h-10 bg-bg-surface border-b border-border-subtle flex items-center justify-between select-none">
      {/* Left: Window controls + App title + tabs */}
      <div className="flex items-center">
        {/* macOS-style window controls */}
        <div
          className="flex items-center gap-2 px-3"
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
        >
          <button
            onClick={() => appWindow.close()}
            className="group w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57] active:bg-[#bf4942] transition-all flex items-center justify-center"
          >
            {controlsHovered && (
              <X size={8} strokeWidth={2.5} className="text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          <button
            onClick={() => appWindow.minimize()}
            className="group w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e] active:bg-[#bf8d22] transition-all flex items-center justify-center"
          >
            {controlsHovered && (
              <Minus size={8} strokeWidth={2.5} className="text-[#995700] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          <button
            onClick={() => appWindow.toggleMaximize()}
            className="group w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840] active:bg-[#1e9630] transition-all flex items-center justify-center"
          >
            {controlsHovered && (
              <Maximize2 size={6} strokeWidth={2.5} className="text-[#006500] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

        {/* Drag area */}
        <div
          onMouseDown={startDrag}
          className="h-10 w-8 cursor-default"
        />

        {/* Logo */}
        <span className="text-xs font-semibold text-accent tracking-wider">
          TUSKER
        </span>

        {/* Drag area */}
        <div
          onMouseDown={startDrag}
          className="h-10 w-4 cursor-default"
        />

        {/* Tabs */}
        <div className="flex items-center">
          <Tab
            to="/"
            icon={<LayoutDashboard size={13} />}
            label="Dashboard"
          />
          <Tab
            to="/projects"
            icon={<FolderKanban size={13} />}
            label="Projects"
            badge={8}
          />
          <Tab
            to="/sessions"
            icon={<MessageSquare size={13} />}
            label="Sessions"
            badge={3}
          />
          <Tab
            to="/notifications"
            icon={<Bell size={13} />}
            label="Notifications"
            badge={2}
          />
        </div>
      </div>

      {/* Center: Draggable spacer */}
      <div
        onMouseDown={startDrag}
        className="flex-1 h-10 cursor-default"
      />

      {/* Right: Actions */}
      <div className="flex items-center gap-2 pr-3">
        {/* Add Project */}
        <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors">
          <Plus size={12} />
          <span>Add</span>
        </button>

        {/* Command palette */}
        <button
          onClick={onCommandPalette}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-text-muted hover:text-text-secondary bg-bg-elevated border border-border-subtle transition-colors"
        >
          <Search size={10} />
          <span>Search</span>
          <kbd className="text-[9px]">⌘K</kbd>
        </button>

        {/* Settings */}
        <NavLink
          to="/settings"
          className="p-1.5 text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <Settings size={14} />
        </NavLink>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-border-subtle">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span className="text-[10px] text-text-muted">3</span>
        </div>
      </div>
    </nav>
  );
}
