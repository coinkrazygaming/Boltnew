import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  ChevronDown,
  File,
  Folder,
  Plus,
  Settings,
  Terminal,
  Zap,
  LogOut,
  Play,
  Save,
  X,
  Wand2,
  Menu,
  ExternalLink,
} from "lucide-react";
import { ResizableHandle, ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SettingsPanel } from "@/components/SettingsPanel";
import { DeploymentDialog } from "@/components/DeploymentDialog";
import { useAppStore, EditorTab, FileItem, Project } from "@/store/appStore";
import { generateCode } from "@/lib/openai";
import { initializeWebContainer, executeCommand, writeFile, createFileStructure } from "@/lib/webcontainer";
import { signOut } from "@/lib/supabase";
import { toast } from "sonner";

const DEFAULT_PROJECT: Project = {
  id: "default-project",
  name: "My First Project",
  description: "A sample React project",
  createdAt: new Date(),
  updatedAt: new Date(),
  files: [
    {
      id: "src",
      name: "src",
      path: "src",
      type: "folder",
      children: [
        {
          id: "app-tsx",
          name: "App.tsx",
          path: "src/App.tsx",
          type: "file",
          language: "typescript",
          content: `import React from 'react';

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome to Bolt
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            Build apps with AI in your browser
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Clicked {count} times
          </button>
        </div>
      </div>
    </div>
  );
}`,
        },
        {
          id: "index-tsx",
          name: "index.tsx",
          path: "src/index.tsx",
          type: "file",
          language: "typescript",
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
        },
      ],
    },
    {
      id: "package",
      name: "package.json",
      path: "package.json",
      type: "file",
      language: "json",
      content: JSON.stringify(
        {
          name: "bolt-project",
          version: "1.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.0.0",
            vite: "^4.4.0",
          },
        },
        null,
        2
      ),
    },
  ],
};

export default function IDEAdvanced() {
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store hooks
  const currentProject = useAppStore((state) => state.currentProject);
  const setCurrentProject = useAppStore((state) => state.setCurrentProject);
  const openTabs = useAppStore((state) => state.openTabs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const openTab = useAppStore((state) => state.openTab);
  const closeTab = useAppStore((state) => state.closeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const updateTabContent = useAppStore((state) => state.updateTabContent);
  const createFile = useAppStore((state) => state.createFile);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const setIsGenerating = useAppStore((state) => state.setIsGenerating);
  const userId = useAppStore((state) => state.userId);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const terminalLines = useAppStore((state) => state.terminalLines);
  const addTerminalLine = useAppStore((state) => state.addTerminalLine);

  // Local state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Initialize project on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!currentProject) {
      setCurrentProject(DEFAULT_PROJECT);
    }
    setIsInitialized(true);
  }, [isAuthenticated, currentProject, setCurrentProject, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error (expected in demo mode):", error);
    }
    navigate("/auth");
  };

  const handleOpenFile = (file: FileItem) => {
    if (file.type === "file" && file.content !== undefined) {
      const tab: EditorTab = {
        id: file.id,
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        language: file.language || "plaintext",
        content: file.content,
        isDirty: false,
      };
      openTab(tab);
      setActiveTab(tab.id);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value && activeTabId) {
      updateTabContent(activeTabId, value);
    }
  };

  const handleGenerateCode = async () => {
    if (!generatePrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    let generatedCode = "";

    try {
      await generateCode({
        prompt: generatePrompt,
        language: "typescript",
        framework: "React",
        onChunk: (chunk) => {
          generatedCode += chunk;
        },
      });

      // Create new file with generated code
      if (currentProject) {
        const fileName = `Generated-${Date.now()}.tsx`;
        createFile(currentProject.id, fileName, "src");

        // Find the newly created file and update its content
        const newFile = findFileInTree(currentProject.files, `src/${fileName}`);
        if (newFile && activeTabId) {
          updateTabContent(activeTabId, generatedCode);
        }
      }

      toast.success("Code generated successfully!");
      setShowGenerateModal(false);
      setGeneratePrompt("");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFile = async () => {
    if (activeTabId && currentProject) {
      const tab = openTabs.find((t) => t.id === activeTabId);
      if (tab) {
        // In a real app, this would save to backend
        toast.success("File saved");
      }
    }
  };

  const handleRunProject = async () => {
    if (!currentProject) return;

    setIsRunning(true);
    addTerminalLine({
      type: "input",
      content: "$ npm run dev",
      timestamp: new Date(),
    });

    try {
      const result = await executeCommand("npm --version");
      addTerminalLine({
        type: "output",
        content: result.output,
        timestamp: new Date(),
      });

      toast.success("Project started!");
      // In a real implementation, this would launch WebContainer dev server
      // For now, we just show a preview iframe
      setPreviewUrl("about:blank");
    } catch (error: any) {
      addTerminalLine({
        type: "error",
        content: error.message,
        timestamp: new Date(),
      });
      toast.error("Failed to run project");
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      // Deployment logic will be handled in the dialog
      toast.success("Deployment initiated!");
    } finally {
      setIsDeploying(false);
    }
  };

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  if (!isInitialized || !currentProject) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="mx-auto mb-4 text-accent animate-spin" size={32} />
          <p className="text-muted-foreground">Initializing IDE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-accent" size={20} />
            <h1 className="text-lg font-semibold text-foreground">{currentProject.name}</h1>
          </div>
          <span className="text-xs text-muted-foreground">|</span>
          <span className="text-xs text-muted-foreground">{userId}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowGenerateModal(true)}
            disabled={isGenerating}
          >
            <Wand2 size={16} className="mr-2" />
            Generate with AI
          </Button>
          <Button size="sm" onClick={handleRunProject} disabled={isRunning}>
            <Play size={16} className="mr-2" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setShowDeployment(true)}
            disabled={isDeploying}
          >
            {isDeploying ? "Deploying..." : "Deploy"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSignOut}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      {/* Main editor area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* File Explorer */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileExplorer
            files={currentProject.files}
            onFileSelect={handleOpenFile}
            onCreateFile={(name) => createFile(currentProject.id, name, "src")}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor and Preview */}
        <ResizablePanel defaultSize={80} minSize={50}>
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="border-b border-border bg-card">
              <div className="flex items-center overflow-x-auto">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer group",
                      activeTabId === tab.id
                        ? "bg-background text-foreground border-b-2 border-b-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <File size={14} />
                    <span>{tab.fileName}</span>
                    {tab.isDirty && <span className="text-accent">●</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="ml-1 rounded hover:bg-muted p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab ? (
                <div className="flex h-full">
                  {/* Editor */}
                  <div className="flex-1 overflow-hidden border-r border-border">
                    <Editor
                      ref={editorRef}
                      height="100%"
                      language={activeTab.language}
                      value={activeTab.content}
                      onChange={handleEditorChange}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "Fira Code",
                        wordWrap: "on",
                        tabSize: 2,
                        formatOnPaste: true,
                        formatOnType: true,
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                      }}
                    />
                  </div>

                  {/* Preview/Terminal */}
                  <Tabs defaultValue="preview" className="w-1/2 flex flex-col">
                    <TabsList className="rounded-none border-b border-border bg-background">
                      <TabsTrigger value="preview" className="rounded-none">
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="rounded-none flex items-center gap-2">
                        <Terminal size={14} />
                        Terminal
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="flex-1 overflow-hidden">
                      {previewUrl ? (
                        <iframe src={previewUrl} className="w-full h-full border-0" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                          <div className="text-center">
                            <Play size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Click "Run" to start the dev server</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="terminal" className="flex-1 overflow-auto p-4 font-mono text-xs bg-background">
                      <div className="space-y-1">
                        {terminalLines.length === 0 ? (
                          <div className="text-muted-foreground">Ready for commands...</div>
                        ) : (
                          terminalLines.map((line, idx) => (
                            <div
                              key={idx}
                              className={cn({
                                "text-red-400": line.type === "error",
                                "text-blue-400": line.type === "input",
                                "text-slate-400": line.type === "output",
                              })}
                            >
                              {line.content}
                            </div>
                          ))
                        )}
                        <div className="text-slate-500">$ _</div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground">
                  <p>Select a file to start editing</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateModal
          isOpen={showGenerateModal}
          isLoading={isGenerating}
          prompt={generatePrompt}
          onPromptChange={setGeneratePrompt}
          onGenerate={handleGenerateCode}
          onClose={() => setShowGenerateModal(false)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Deployment Dialog */}
      <DeploymentDialog
        isOpen={showDeployment}
        projectName={currentProject.name}
        onClose={() => setShowDeployment(false)}
        onDeploy={handleDeploy}
        isDeploying={isDeploying}
      />
    </div>
  );
}

// File Explorer Component
function FileExplorer({
  files,
  onFileSelect,
  onCreateFile,
}: {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onCreateFile: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["src"]));

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const renderFileTree = (nodes: FileItem[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        {node.type === "folder" ? (
          <>
            <div
              className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-sidebar-accent text-sm text-sidebar-foreground rounded"
              onClick={() => toggleFolder(node.id)}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <ChevronDown
                size={16}
                className={cn("transition-transform", !expanded.has(node.id) && "-rotate-90")}
              />
              <Folder size={16} className="text-blue-400" />
              <span>{node.name}</span>
            </div>
            {expanded.has(node.id) && node.children && renderFileTree(node.children, depth + 1)}
          </>
        ) : (
          <div
            className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-sidebar-accent text-sm text-sidebar-foreground rounded"
            onClick={() => onFileSelect(node)}
            style={{ paddingLeft: `${depth * 12 + 8 + 16 + 4}px` }}
          >
            <File size={16} className="text-slate-400" />
            <span>{node.name}</span>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-background border-r border-border">
      <div className="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
        <h2 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
          Explorer
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onCreateFile(`file-${Date.now()}.tsx`)}
        >
          <Plus size={14} className="text-sidebar-foreground" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">{renderFileTree(files)}</div>
    </div>
  );
}

// Generate Modal Component
function GenerateModal({
  isOpen,
  isLoading,
  prompt,
  onPromptChange,
  onGenerate,
  onClose,
}: {
  isOpen: boolean;
  isLoading: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Generate Code with AI</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the code you want to generate..."
          className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent mb-4 resize-none h-32"
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function
function findFileInTree(files: FileItem[], path: string): FileItem | null {
  for (const file of files) {
    if (file.path === path) return file;
    if (file.children) {
      const found = findFileInTree(file.children, path);
      if (found) return found;
    }
  }
  return null;
}
