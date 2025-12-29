import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { StatusBar } from "./StatusBar";

interface AppShellProps {
  onCommandPalette?: () => void;
}

export function AppShell({ onCommandPalette }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden rounded-lg">
      {/* Top Navigation */}
      <NavBar onCommandPalette={onCommandPalette} />

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
