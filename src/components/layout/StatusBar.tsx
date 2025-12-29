import { Activity, Clock, Zap } from "lucide-react";

export function StatusBar() {
  return (
    <footer className="h-5 bg-bg-base border-t border-border-subtle flex items-center justify-between px-3 text-[10px] text-text-muted select-none">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Activity size={10} className="text-success" />
          <span>3 sessions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>synced</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-warning" />
          <span>12.4k tokens</span>
        </div>
        <span className="text-text-muted/50">v0.1.0</span>
      </div>
    </footer>
  );
}
