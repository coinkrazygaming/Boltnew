import { useState } from "react";
import { ChevronDown, File, Folder, Plus, Settings, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  expanded?: boolean;
  language?: string;
}

const mockProjectStructure: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    expanded: true,
    children: [
      {
        id: "src-components",
        name: "components",
        type: "folder",
        expanded: true,
        children: [
          { id: "button", name: "Button.tsx", type: "file", language: "typescript" },
          { id: "card", name: "Card.tsx", type: "file", language: "typescript" },
        ],
      },
      { id: "app-tsx", name: "App.tsx", type: "file", language: "typescript" },
      { id: "index-tsx", name: "index.tsx", type: "file", language: "typescript" },
    ],
  },
  { id: "package", name: "package.json", type: "file", language: "json" },
  { id: "tsconfig", name: "tsconfig.json", type: "file", language: "json" },
  { id: "vite", name: "vite.config.ts", type: "file", language: "typescript" },
];

const sampleCode = `import React from 'react';

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
}`;

export default function IDE() {
  const [openTabs, setOpenTabs] = useState([
    { id: "app-tsx", name: "App.tsx", language: "typescript" },
  ]);
  const [activeTab, setActiveTab] = useState("app-tsx");
  const [terminalOutput] = useState([
    "$ npm run dev",
    "Port 5173 ready in 234ms",
    "➜  Local:   http://localhost:5173/",
    "➜  press h to show help",
  ]);

  const openFile = (node: FileNode) => {
    if (node.type === "file") {
      const exists = openTabs.some((tab) => tab.id === node.id);
      if (!exists) {
        setOpenTabs([...openTabs, { id: node.id, name: node.name, language: node.language || "typescript" }]);
      }
      setActiveTab(node.id);
    }
  };

  const closeTab = (tabId: string) => {
    setOpenTabs(openTabs.filter((tab) => tab.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab(openTabs[0]?.id || "");
    }
  };

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes.map((node) => (
      <div key={node.id}>
        {node.type === "folder" ? (
          <>
            <div className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-sidebar-accent text-sm text-sidebar-foreground rounded">
              <ChevronDown size={16} className="transition-transform" />
              <Folder size={16} className="text-blue-400" />
              <span>{node.name}</span>
            </div>
            {node.expanded && node.children && (
              <div className="ml-4">{renderFileTree(node.children)}</div>
            )}
          </>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-sidebar-accent text-sm rounded",
              activeTab === node.id && "bg-sidebar-accent text-accent",
              activeTab !== node.id && "text-sidebar-foreground"
            )}
            onClick={() => openFile(node)}
          >
            <File size={16} className="text-slate-400" />
            <span>{node.name}</span>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="text-accent" size={20} />
            <h1 className="text-lg font-semibold text-foreground">Bolt</h1>
          </div>
          <span className="text-xs text-muted-foreground">Web Development Environment</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings size={18} />
          </Button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-64 border-r border-border bg-sidebar-background flex flex-col">
          {/* Explorer Header */}
          <div className="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
            <h2 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
              Explorer
            </h2>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus size={14} className="text-sidebar-foreground" />
            </Button>
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {renderFileTree(mockProjectStructure)}
          </div>
        </div>

        {/* Editor and Preview Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-border bg-card">
            <div className="flex items-center overflow-x-auto">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer group",
                    activeTab === tab.id
                      ? "bg-background text-foreground border-b-2 border-b-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <File size={14} />
                  <span>{tab.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="ml-1 rounded hover:bg-muted p-0.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Editor and Preview Grid */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 overflow-hidden bg-background border-r border-border">
              <div className="p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-auto h-full">
                <code>{sampleCode}</code>
              </div>
            </div>

            {/* Preview/Terminal Panel */}
            <div className="w-1/2 flex flex-col bg-card border-l border-border">
              <Tabs defaultValue="preview" className="flex flex-col h-full">
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
                  <iframe
                    srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-slate-900">
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-white mb-6">Welcome to Bolt</h1>
      <p class="text-lg text-slate-400 mb-8">Build apps with AI in your browser</p>
      <button onclick="this.textContent = 'Clicked: ' + (parseInt(this.getAttribute('data-count') || 0) + 1) + ' times'; this.setAttribute('data-count', parseInt(this.getAttribute('data-count') || 0) + 1)" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
        Clicked 0 times
      </button>
    </div>
  </div>
</body>
</html>`}
                    className="w-full h-full border-0"
                  />
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 overflow-auto p-4 font-mono text-xs">
                  <div className="space-y-1">
                    {terminalOutput.map((line, idx) => (
                      <div key={idx} className="text-slate-400">
                        <span>{line}</span>
                      </div>
                    ))}
                    <div className="text-slate-500">$ _</div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
