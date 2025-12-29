import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Settings,
  FolderOpen,
  Plus,
  Save,
  Clock,
  Zap,
  BookOpen,
  Shield,
  Edit3,
  Trash2,
  ChevronRight,
  Sparkles,
  Send,
  Upload,
  Link2,
  FileImage,
  File,
  PanelRightClose,
  PanelRight,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";

// Mock project data
const projectData = {
  id: "stoxly-core",
  name: "stoxly-core",
  path: "/Users/kasun/work/stoxly/stoxly_core",
  description: "Main backend service for Stoxly",
  sessions: 45,
  totalTokens: 124500,
  lastActive: "2m ago",
  status: "active",
};

// Mock KB files
const kbFiles = [
  { id: 1, name: "CLAUDE.md", type: "claude", updated: "2h ago", size: "2.4 KB" },
  { id: 2, name: "api-spec.md", type: "spec", updated: "1d ago", size: "8.1 KB" },
  { id: 3, name: "auth-flow.md", type: "story", updated: "3d ago", size: "1.2 KB" },
  { id: 4, name: "architecture.md", type: "kb", updated: "1w ago", size: "4.5 KB" },
];

// Mock resources (uploaded files, links)
const resources = [
  { id: 1, name: "API Reference.pdf", type: "pdf", size: "2.1 MB", added: "1h ago" },
  { id: 2, name: "Phoenix LiveView Docs", type: "link", url: "https://hexdocs.pm/phoenix_live_view", added: "2d ago" },
  { id: 3, name: "architecture-diagram.png", type: "image", size: "340 KB", added: "3d ago" },
  { id: 4, name: "Ecto Docs", type: "link", url: "https://hexdocs.pm/ecto", added: "1w ago" },
];

// Mock AI chat messages
const mockAiMessages = [
  { id: 1, role: "user", content: "Help me structure a CLAUDE.md for this Phoenix project" },
  { id: 2, role: "assistant", content: "I'll help you create an effective CLAUDE.md. Based on your project structure, here's what I recommend:\n\n**Key Sections:**\n1. Project Overview\n2. Architecture Guidelines\n3. Coding Standards\n4. Module Documentation\n\nShall I draft each section?" },
  { id: 3, role: "user", content: "Yes, start with the architecture guidelines" },
];

// Mock rules/permissions
const projectRules = [
  { id: 1, rule: "WebFetch(domain:hexdocs.pm)", type: "allow" },
  { id: 2, rule: "Bash(mix format:*)", type: "allow" },
  { id: 3, rule: "Bash(mix test:*)", type: "allow" },
  { id: 4, rule: "Bash(rm -rf:*)", type: "deny" },
];

// Mock recent sessions
const recentSessions = [
  { id: "sess_1", preview: "Implementing auth middleware", time: "2m ago", messages: 24 },
  { id: "sess_2", preview: "Database migration fixes", time: "3h ago", messages: 45 },
  { id: "sess_3", preview: "API endpoint refactoring", time: "1d ago", messages: 67 },
];

type TabType = "overview" | "knowledge-base" | "sessions" | "settings";

export function ProjectDetailPage() {
  const { projectId: _projectId } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [editingFile, setEditingFile] = useState<string | null>(null);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FolderOpen size={14} /> },
    { id: "knowledge-base", label: "Knowledge Base", icon: <BookOpen size={14} /> },
    { id: "sessions", label: "Sessions", icon: <MessageSquare size={14} /> },
    { id: "settings", label: "Settings", icon: <Settings size={14} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3 mb-3">
          <Link
            to="/projects"
            className="p-1 hover:bg-bg-hover rounded transition-colors"
          >
            <ArrowLeft size={16} className="text-text-muted" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-medium text-text-primary">
              {projectData.name}
            </h1>
            <Badge variant="success">Active</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                activeTab === tab.id
                  ? "text-text-primary bg-bg-elevated"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "knowledge-base" && (
          <KnowledgeBaseTab
            editingFile={editingFile}
            setEditingFile={setEditingFile}
          />
        )}
        {activeTab === "sessions" && <SessionsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <MessageSquare size={14} />
              <span className="text-xs">Sessions</span>
            </div>
            <span className="text-lg font-semibold">{projectData.sessions}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Zap size={14} />
              <span className="text-xs">Total Tokens</span>
            </div>
            <span className="text-lg font-semibold">124.5k</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <Clock size={14} />
              <span className="text-xs">Last Active</span>
            </div>
            <span className="text-lg font-semibold">{projectData.lastActive}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-text-muted mb-1">
              <FileText size={14} />
              <span className="text-xs">KB Files</span>
            </div>
            <span className="text-lg font-semibold">{kbFiles.length}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Project Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-text-muted">Path</div>
              <div className="text-sm text-text-primary font-mono">
                {projectData.path}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Description</div>
              <div className="text-sm text-text-secondary">
                {projectData.description || "No description"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Recent Sessions</span>
              <Link to={`/projects/${projectData.id}/sessions`} className="text-xs text-accent">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 px-2 hover:bg-bg-hover/50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">
                    {session.preview}
                  </div>
                  <div className="text-xs text-text-muted">{session.time}</div>
                </div>
                <ChevronRight size={14} className="text-text-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KnowledgeBaseTab({
  editingFile,
  setEditingFile,
}: {
  editingFile: string | null;
  setEditingFile: (file: string | null) => void;
}) {
  const [editorContent, setEditorContent] = useState(`# Project Guidelines

## Architecture
This project uses Phoenix/Elixir with a modular architecture.

## Coding Standards
- Use pattern matching where possible
- Keep functions small and focused
- Write tests for all public functions

## Key Modules
- \`Stoxly.Accounts\` - User management
- \`Stoxly.Trading\` - Core trading logic
- \`Stoxly.Analytics\` - Data analysis
`);

  const [showAiPanel, setShowAiPanel] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"files" | "resources">("files");
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In real app, handle file upload here
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    setIsProcessingUrl(true);
    // In real app: fetch URL, convert HTML to markdown using htmd, store in KB
    // Simulate processing
    setTimeout(() => {
      setIsProcessingUrl(false);
      setShowUrlModal(false);
      setUrlInput("");
      // Would add to resources list
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Editor view
  if (editingFile) {
    return (
      <div className="h-full flex">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingFile(null)}
                className="p-1 hover:bg-bg-hover rounded transition-colors"
              >
                <ArrowLeft size={16} className="text-text-muted" />
              </button>
              <span className="text-sm font-medium">{editingFile}</span>
              <Badge variant="outline">Markdown</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="gap-1.5"
              >
                {showAiPanel ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
                Claude
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingFile(null)}>
                Cancel
              </Button>
              <Button size="sm" className="gap-1.5">
                <Save size={14} />
                Save
              </Button>
            </div>
          </div>

          {/* Editor */}
          <Card className="flex-1">
            <CardContent className="p-0 h-full">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-sm font-mono text-text-primary resize-none outline-none"
                placeholder="Enter markdown content..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Claude Panel */}
        {showAiPanel && (
          <div className="w-80 ml-4 flex flex-col border-l border-border-subtle pl-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-sm font-medium">Claude</span>
                <Badge variant="outline" className="text-[10px]">Code</Badge>
              </div>
              <button
                onClick={() => setShowAiPanel(false)}
                className="p-1 hover:bg-bg-hover rounded transition-colors"
              >
                <X size={14} className="text-text-muted" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto space-y-3 mb-3">
              {mockAiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`text-xs p-2 rounded ${
                    msg.role === "user"
                      ? "bg-bg-elevated ml-4"
                      : "bg-accent/10 border border-accent/20"
                  }`}
                >
                  <div className="text-text-muted text-[10px] mb-1">
                    {msg.role === "user" ? "You" : "Claude"}
                  </div>
                  <div className="text-text-primary whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="relative">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask Claude..."
                className="w-full h-20 p-2 pr-10 text-xs bg-bg-elevated border border-border-subtle rounded resize-none outline-none focus:border-accent"
              />
              <button className="absolute right-2 bottom-2 p-1.5 bg-accent hover:bg-accent-hover rounded transition-colors">
                <Send size={12} className="text-white" />
              </button>
            </div>

            {/* Context */}
            <div className="mt-3 p-2 bg-bg-elevated rounded text-[10px] text-text-muted">
              <div className="flex items-center justify-between">
                <span>Project context loaded</span>
                <span className="text-accent">{kbFiles.length + resources.length} files</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main KB view with resources
  return (
    <div className="h-full flex">
      {/* Left Sidebar - Files & Resources */}
      <div className="w-64 flex flex-col pr-4 border-r border-border-subtle">
        {/* Tabs */}
        <div className="flex mb-3 border-b border-border-subtle">
          <button
            onClick={() => setSidebarTab("files")}
            className={`flex-1 pb-2 text-xs transition-colors ${
              sidebarTab === "files"
                ? "text-text-primary border-b-2 border-accent"
                : "text-text-muted"
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setSidebarTab("resources")}
            className={`flex-1 pb-2 text-xs transition-colors ${
              sidebarTab === "resources"
                ? "text-text-primary border-b-2 border-accent"
                : "text-text-muted"
            }`}
          >
            Resources
          </button>
        </div>

        {sidebarTab === "files" ? (
          <>
            {/* KB Files List */}
            <div className="flex-1 overflow-auto space-y-1">
              {kbFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setEditingFile(file.name)}
                  className="flex items-center gap-2 p-2 hover:bg-bg-hover rounded cursor-pointer transition-colors group"
                >
                  <FileIcon type={file.type} small />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text-primary truncate">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-text-muted">{file.updated}</div>
                  </div>
                  <Edit3
                    size={12}
                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>

            {/* New File Button */}
            <Button size="sm" className="mt-3 gap-1.5 w-full">
              <Plus size={14} />
              New File
            </Button>
          </>
        ) : (
          <>
            {/* Resources List */}
            <div className="flex-1 overflow-auto space-y-1">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-2 p-2 hover:bg-bg-hover rounded cursor-pointer transition-colors group"
                >
                  <ResourceIcon type={resource.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text-primary truncate">
                      {resource.name}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {resource.type === "link" ? "Link" : resource.size} · {resource.added}
                    </div>
                  </div>
                  {resource.type === "link" && (
                    <ExternalLink size={12} className="text-text-muted" />
                  )}
                </div>
              ))}
            </div>

            {/* Add Resource Buttons */}
            <div className="mt-3 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 w-full"
                onClick={() => setShowUrlModal(true)}
              >
                <Link2 size={14} />
                Add Link
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 w-full">
                <Upload size={14} />
                Upload File
              </Button>
            </div>
          </>
        )}

      </div>

      {/* Center - Drop Zone / Content */}
      <div
        className={`flex-1 mx-4 flex flex-col ${
          isDragging ? "ring-2 ring-accent ring-dashed" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Knowledge Base</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Drop PDFs, links, and files to add to your KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="gap-1.5"
          >
            <Sparkles size={14} className={showAiPanel ? "text-accent" : ""} />
            Claude
          </Button>
        </div>

        {/* Drop Zone */}
        <Card
          className={`flex-1 flex flex-col items-center justify-center border-dashed ${
            isDragging ? "border-accent bg-accent/5" : ""
          }`}
        >
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-elevated flex items-center justify-center">
              <Upload size={24} className="text-text-muted" />
            </div>
            <h3 className="text-sm font-medium text-text-primary mb-1">
              Drop resources here
            </h3>
            <p className="text-xs text-text-muted mb-4">
              PDFs, images, code files, or paste links
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload size={14} />
                Browse Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowUrlModal(true)}
              >
                <Link2 size={14} />
                Paste Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <div className="mt-4">
          <div className="text-xs text-text-muted mb-2">Quick templates</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditingFile("CLAUDE.md")}
            >
              <FileText size={14} />
              CLAUDE.md
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText size={14} />
              Spec Doc
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText size={14} />
              User Story
            </Button>
          </div>
        </div>
      </div>

      {/* Claude Panel */}
      {showAiPanel && (
        <div className="w-80 flex flex-col border-l border-border-subtle pl-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              <span className="text-sm font-medium">Claude</span>
              <Badge variant="outline" className="text-[10px]">Code</Badge>
            </div>
            <button
              onClick={() => setShowAiPanel(false)}
              className="p-1 hover:bg-bg-hover rounded transition-colors"
            >
              <X size={14} className="text-text-muted" />
            </button>
          </div>

          {/* Context Info */}
          <div className="p-2 bg-bg-elevated rounded mb-3">
            <div className="text-[10px] text-text-muted mb-1">Working on</div>
            <div className="text-xs text-text-primary font-medium">
              {projectData.name}
            </div>
            <div className="text-[10px] text-text-muted mt-1">
              {kbFiles.length} KB files · {resources.length} resources
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto space-y-3 mb-3">
            {mockAiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs p-2 rounded ${
                  msg.role === "user"
                    ? "bg-bg-elevated ml-4"
                    : "bg-accent/10 border border-accent/20"
                }`}
              >
                <div className="text-text-muted text-[10px] mb-1">
                  {msg.role === "user" ? "You" : "Claude"}
                </div>
                <div className="text-text-primary whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="relative">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask Claude to help with your project..."
              className="w-full h-20 p-2 pr-10 text-xs bg-bg-elevated border border-border-subtle rounded resize-none outline-none focus:border-accent"
            />
            <button className="absolute right-2 bottom-2 p-1.5 bg-accent hover:bg-accent-hover rounded transition-colors">
              <Send size={12} className="text-white" />
            </button>
          </div>

          {/* Capabilities */}
          <div className="mt-3 p-2 bg-bg-elevated/50 rounded">
            <div className="text-[10px] text-text-muted mb-2">Claude can:</div>
            <div className="space-y-1 text-[10px] text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Edit3 size={10} className="text-accent" />
                Edit KB files
              </div>
              <div className="flex items-center gap-1.5">
                <FileText size={10} className="text-accent" />
                Create new docs
              </div>
              <div className="flex items-center gap-1.5">
                <ExternalLink size={10} className="text-accent" />
                Read resources
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-bg-base/80 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm">Add URL Resource</span>
                <button
                  onClick={() => {
                    setShowUrlModal(false);
                    setUrlInput("");
                  }}
                  className="p-1 hover:bg-bg-hover rounded"
                >
                  <X size={14} className="text-text-muted" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-text-muted">
                Paste a URL to fetch and convert to markdown for your KB.
              </p>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://hexdocs.pm/phoenix/..."
                className="w-full px-3 py-2 text-sm bg-bg-elevated border border-border-subtle rounded outline-none focus:border-accent"
                autoFocus
              />
              <div className="p-2 bg-bg-elevated rounded text-[10px] text-text-muted">
                The URL will be fetched, converted to clean markdown using htmd,
                and saved to your resources for Claude to reference.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setShowUrlModal(false);
                    setUrlInput("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim() || isProcessingUrl}
                >
                  {isProcessingUrl ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Link2 size={14} />
                      Add to KB
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ResourceIcon({ type }: { type: string }) {
  const iconProps = { size: 14 };
  const icons: Record<string, React.ReactNode> = {
    pdf: <File {...iconProps} className="text-error" />,
    link: <Link2 {...iconProps} className="text-info" />,
    image: <FileImage {...iconProps} className="text-success" />,
  };

  return (
    <div className="p-1.5 bg-bg-elevated rounded">
      {icons[type] || <File {...iconProps} className="text-text-muted" />}
    </div>
  );
}

function SessionsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-primary">Sessions</h2>
        <div className="flex items-center gap-2 text-xs">
          <button className="px-2 py-1 bg-bg-elevated text-text-primary">All</button>
          <button className="px-2 py-1 text-text-muted hover:text-text-secondary">Active</button>
          <button className="px-2 py-1 text-text-muted hover:text-text-secondary">Completed</button>
        </div>
      </div>

      <div className="space-y-2">
        {recentSessions.map((session) => (
          <Card key={session.id} className="hover:border-border-default transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-text-primary">{session.preview}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{session.time}</span>
                    <span>{session.messages} messages</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-text-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-4 max-w-2xl">
      {/* Permissions / Rules */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield size={14} />
            Permissions & Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-text-muted">
            Configure what Claude can and cannot do in this project
          </p>

          {/* Current Rules */}
          <div className="space-y-2">
            {projectRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between py-2 px-3 bg-bg-elevated"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={rule.type === "allow" ? "success" : "error"}>
                    {rule.type}
                  </Badge>
                  <code className="text-xs text-text-primary">{rule.rule}</code>
                </div>
                <button className="p-1 hover:bg-bg-hover rounded transition-colors">
                  <Trash2 size={12} className="text-text-muted" />
                </button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus size={14} />
            Add Rule
          </Button>
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Settings size={14} />
            Project Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">Auto-sync sessions</div>
              <div className="text-xs text-text-muted">Automatically track new sessions</div>
            </div>
            <ToggleSwitch enabled={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">Notifications</div>
              <div className="text-xs text-text-muted">Get notified on session events</div>
            </div>
            <ToggleSwitch enabled={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">Token alerts</div>
              <div className="text-xs text-text-muted">Alert when usage exceeds threshold</div>
            </div>
            <ToggleSwitch enabled={false} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-error">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-primary">Remove project</div>
              <div className="text-xs text-text-muted">Remove from Tusker (doesn't delete files)</div>
            </div>
            <Button variant="destructive" size="sm">
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FileIcon({ type, small }: { type: string; small?: boolean }) {
  const colors: Record<string, string> = {
    claude: "text-accent",
    spec: "text-info",
    story: "text-success",
    kb: "text-warning",
  };

  const size = small ? 14 : 16;
  const padding = small ? "p-1.5" : "p-2";

  return (
    <div className={`${padding} bg-bg-elevated rounded ${colors[type] || "text-text-muted"}`}>
      <FileText size={size} />
    </div>
  );
}

function ToggleSwitch({ enabled }: { enabled: boolean }) {
  return (
    <button
      className={`w-9 h-5 rounded-full transition-colors ${
        enabled ? "bg-accent" : "bg-bg-elevated"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
