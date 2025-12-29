import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Bell, Zap, Info, Check } from "lucide-react";

interface Settings {
  launchOnStartup: boolean;
  sessionNotifications: boolean;
  errorAlerts: boolean;
  soundEnabled: boolean;
  dailyTokenLimit: number;
}

const defaultSettings: Settings = {
  launchOnStartup: true,
  sessionNotifications: true,
  errorAlerts: true,
  soundEnabled: false,
  dailyTokenLimit: 50000,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would persist to storage
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-medium text-text-primary">Settings</h1>
        <Button
          size="sm"
          onClick={handleSave}
          className="gap-1.5"
        >
          {saved ? (
            <>
              <Check size={14} />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Info size={14} />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-primary">Claude Directory</div>
              <div className="text-[10px] text-text-muted">~/.claude</div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FolderOpen size={12} />
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-primary">Launch on startup</div>
              <div className="text-[10px] text-text-muted">Start Tusker when you log in</div>
            </div>
            <ToggleSwitch
              enabled={settings.launchOnStartup}
              onChange={(v) => updateSetting("launchOnStartup", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell size={14} />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-primary">Session notifications</div>
              <div className="text-[10px] text-text-muted">Get notified when sessions start/end</div>
            </div>
            <ToggleSwitch
              enabled={settings.sessionNotifications}
              onChange={(v) => updateSetting("sessionNotifications", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-primary">Error alerts</div>
              <div className="text-[10px] text-text-muted">Alert on session errors</div>
            </div>
            <ToggleSwitch
              enabled={settings.errorAlerts}
              onChange={(v) => updateSetting("errorAlerts", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-primary">Sound</div>
              <div className="text-[10px] text-text-muted">Play sound on notifications</div>
            </div>
            <ToggleSwitch
              enabled={settings.soundEnabled}
              onChange={(v) => updateSetting("soundEnabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Zap size={14} />
            Usage Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-primary">Daily token limit</div>
              <div className="text-[10px] text-text-muted">Alert when reaching limit</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.dailyTokenLimit}
                onChange={(e) => updateSetting("dailyTokenLimit", parseInt(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-xs bg-bg-elevated border border-border-subtle text-text-primary rounded outline-none focus:border-accent"
              />
              <span className="text-[10px] text-text-muted">tokens</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-text-muted">
              Tusker v0.1.0 · Made for Claude Code users
            </div>
            <a href="#" className="text-[10px] text-accent hover:text-accent-hover">
              Check for updates
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-9 h-5 rounded-full transition-colors ${
        enabled ? "bg-accent" : "bg-bg-elevated border border-border-subtle"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
