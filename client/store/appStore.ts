import { create } from "zustand";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
  language?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  files: FileItem[];
  userId?: string;
}

export interface EditorTab {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export interface EditorState {
  theme: "light" | "dark";
  fontSize: number;
  fontFamily: string;
  showMinimap: boolean;
  wordWrap: boolean;
}

export interface TerminalLine {
  type: "output" | "error" | "input";
  content: string;
  timestamp: Date;
}

interface AppStore {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;
  setUserId: (id: string | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;

  // Projects
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Files
  createFile: (projectId: string, name: string, parentPath: string) => void;
  updateFile: (projectId: string, filePath: string, content: string) => void;
  deleteFile: (projectId: string, filePath: string) => void;
  createFolder: (projectId: string, name: string, parentPath: string) => void;

  // Tabs
  openTabs: EditorTab[];
  activeTabId: string | null;
  openTab: (tab: EditorTab) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;

  // Editor Settings
  editorState: EditorState;
  setEditorState: (state: Partial<EditorState>) => void;
  setTheme: (theme: "light" | "dark") => void;
  setFontSize: (size: number) => void;

  // Terminal
  terminalLines: TerminalLine[];
  addTerminalLine: (line: TerminalLine) => void;
  clearTerminal: () => void;

  // UI State
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (show: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Auth
  userId: null,
  isAuthenticated: false,
  setUserId: (id) => set({ userId: id }),
  setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  // Projects
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),
  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      currentProject:
        state.currentProject?.id === projectId ? null : state.currentProject,
    })),

  // Files
  createFile: (projectId, name, parentPath) =>
    set((state) => {
      if (!state.currentProject || state.currentProject.id !== projectId) {
        return state;
      }

      const newFile: FileItem = {
        id: `file-${Date.now()}`,
        name,
        path: `${parentPath}/${name}`.replace(/^\//, ""),
        type: "file",
        content: "",
        language: getLanguageFromFileName(name),
      };

      const updatedFiles = addFileToTree(state.currentProject.files, parentPath, newFile);

      return {
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
        },
      };
    }),

  updateFile: (projectId, filePath, content) =>
    set((state) => {
      if (!state.currentProject || state.currentProject.id !== projectId) {
        return state;
      }

      const updatedFiles = updateFileInTree(state.currentProject.files, filePath, content);

      return {
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
        },
      };
    }),

  deleteFile: (projectId, filePath) =>
    set((state) => {
      if (!state.currentProject || state.currentProject.id !== projectId) {
        return state;
      }

      const updatedFiles = deleteFileFromTree(state.currentProject.files, filePath);

      return {
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
        },
      };
    }),

  createFolder: (projectId, name, parentPath) =>
    set((state) => {
      if (!state.currentProject || state.currentProject.id !== projectId) {
        return state;
      }

      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name,
        path: `${parentPath}/${name}`.replace(/^\//, ""),
        type: "folder",
        children: [],
      };

      const updatedFiles = addFileToTree(state.currentProject.files, parentPath, newFolder);

      return {
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
        },
      };
    }),

  // Tabs
  openTabs: [],
  activeTabId: null,
  openTab: (tab) =>
    set((state) => {
      const exists = state.openTabs.find((t) => t.id === tab.id);
      return {
        openTabs: exists ? state.openTabs : [...state.openTabs, tab],
        activeTabId: tab.id,
      };
    }),
  closeTab: (tabId) =>
    set((state) => {
      const newTabs = state.openTabs.filter((t) => t.id !== tabId);
      const newActiveTab = state.activeTabId === tabId ? newTabs[0]?.id || null : state.activeTabId;
      return {
        openTabs: newTabs,
        activeTabId: newActiveTab,
      };
    }),
  closeAllTabs: () =>
    set({
      openTabs: [],
      activeTabId: null,
    }),
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  updateTabContent: (tabId, content) =>
    set((state) => ({
      openTabs: state.openTabs.map((tab) =>
        tab.id === tabId ? { ...tab, content, isDirty: true } : tab
      ),
    })),

  // Editor Settings
  editorState: {
    theme: "dark",
    fontSize: 14,
    fontFamily: "Fira Code",
    showMinimap: true,
    wordWrap: true,
  },
  setEditorState: (state) =>
    set((current) => ({
      editorState: { ...current.editorState, ...state },
    })),
  setTheme: (theme) =>
    set((state) => ({
      editorState: { ...state.editorState, theme },
    })),
  setFontSize: (size) =>
    set((state) => ({
      editorState: { ...state.editorState, fontSize: size },
    })),

  // Terminal
  terminalLines: [],
  addTerminalLine: (line) =>
    set((state) => ({
      terminalLines: [...state.terminalLines, line],
    })),
  clearTerminal: () => set({ terminalLines: [] }),

  // UI State
  isGenerating: false,
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  showFileExplorer: true,
  setShowFileExplorer: (show) => set({ showFileExplorer: show }),
  showTerminal: true,
  setShowTerminal: (show) => set({ showTerminal: show }),
}));

// Helper functions for file tree operations
function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    rb: "ruby",
    go: "go",
    rs: "rust",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    htm: "html",
    md: "markdown",
    sql: "sql",
  };
  return languageMap[ext] || "plaintext";
}

function addFileToTree(tree: FileItem[], parentPath: string, newItem: FileItem): FileItem[] {
  if (parentPath === "" || parentPath === "/") {
    return [...tree, newItem];
  }

  return tree.map((item) => {
    if (item.path === parentPath && item.type === "folder") {
      return {
        ...item,
        children: [...(item.children || []), newItem],
      };
    }
    if (item.children) {
      return {
        ...item,
        children: addFileToTree(item.children, parentPath, newItem),
      };
    }
    return item;
  });
}

function updateFileInTree(tree: FileItem[], filePath: string, content: string): FileItem[] {
  return tree.map((item) => {
    if (item.path === filePath) {
      return { ...item, content };
    }
    if (item.children) {
      return {
        ...item,
        children: updateFileInTree(item.children, filePath, content),
      };
    }
    return item;
  });
}

function deleteFileFromTree(tree: FileItem[], filePath: string): FileItem[] {
  return tree
    .filter((item) => item.path !== filePath)
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: deleteFileFromTree(item.children, filePath),
        };
      }
      return item;
    });
}
