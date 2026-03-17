import { create } from "zustand";

// ============ Type Definitions ============

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  github_id?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  organization_id: string;
  created_by: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectSettings {
  deployment_domain?: string;
  environment_variables: Record<string, string>;
  build_command?: string;
  start_command?: string;
  auto_sync_enabled: boolean;
  auto_deploy_enabled: boolean;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content?: string;
  language?: string;
  git_sha?: string;
  last_synced_at?: string;
}

export interface Project {
  id: string;
  name: string;
  workspace_id: string;
  description?: string;
  github_repo_url?: string;
  github_branch: string;
  status: "idle" | "running" | "error";
  created_by: string;
  settings: ProjectSettings;
  files?: ProjectFile[];
  created_at: string;
  updated_at: string;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
  language?: string;
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

// ============ Store Interface ============

interface AppStore {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  setUserId: (id: string | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setCurrentUser: (user: User | null) => void;

  // Organizations
  organizations: Organization[];
  currentOrganization: Organization | null;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
  deleteOrganization: (orgId: string) => void;

  // Workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (workspaceId: string) => void;

  // Projects
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Files
  currentProjectFiles: FileItem[];
  setCurrentProjectFiles: (files: FileItem[]) => void;
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

// ============ Store Implementation ============

export const useAppStore = create<AppStore>((set) => ({
  // Auth
  userId: null,
  isAuthenticated: false,
  currentUser: null,
  setUserId: (id) => set({ userId: id }),
  setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setCurrentUser: (user) => set({ currentUser: user }),

  // Organizations
  organizations: [],
  currentOrganization: null,
  setOrganizations: (orgs) => set({ organizations: orgs }),
  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  addOrganization: (org) =>
    set((state) => ({
      organizations: [...state.organizations, org],
    })),
  updateOrganization: (orgId, updates) =>
    set((state) => ({
      organizations: state.organizations.map((o) =>
        o.id === orgId ? { ...o, ...updates } : o
      ),
      currentOrganization:
        state.currentOrganization?.id === orgId
          ? { ...state.currentOrganization, ...updates }
          : state.currentOrganization,
    })),
  deleteOrganization: (orgId) =>
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== orgId),
      currentOrganization:
        state.currentOrganization?.id === orgId ? null : state.currentOrganization,
      workspaces: state.workspaces.filter(
        (w) => w.organization_id !== orgId
      ),
    })),

  // Workspaces
  workspaces: [],
  currentWorkspace: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
    })),
  updateWorkspace: (workspaceId, updates) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId ? { ...w, ...updates } : w
      ),
      currentWorkspace:
        state.currentWorkspace?.id === workspaceId
          ? { ...state.currentWorkspace, ...updates }
          : state.currentWorkspace,
    })),
  deleteWorkspace: (workspaceId) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
      currentWorkspace:
        state.currentWorkspace?.id === workspaceId ? null : state.currentWorkspace,
      projects: state.projects.filter((p) => p.workspace_id !== workspaceId),
    })),

  // Projects
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
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
      openTabs: state.openTabs.filter((t) =>
        state.currentProjectFiles?.some((f) => f.id === t.fileId)
      ),
    })),

  // Files
  currentProjectFiles: [],
  setCurrentProjectFiles: (files) => set({ currentProjectFiles: files }),
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

      const updatedFiles = addFileToTree(state.currentProjectFiles, parentPath, newFile);

      return {
        currentProjectFiles: updatedFiles,
      };
    }),

  updateFile: (projectId, filePath, content) =>
    set((state) => {
      if (!state.currentProject || state.currentProject.id !== projectId) {
        return state;
      }

      const updatedFiles = updateFileInTree(state.currentProjectFiles, filePath, content);

      return {
        currentProjectFiles: updatedFiles,
      };
    }),

  deleteFile: (projectId, filePath) =>
    set((state) => {
      if (!state.currentProject || state.currentProject.id !== projectId) {
        return state;
      }

      const updatedFiles = deleteFileFromTree(state.currentProjectFiles, filePath);

      return {
        currentProjectFiles: updatedFiles,
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

      const updatedFiles = addFileToTree(state.currentProjectFiles, parentPath, newFolder);

      return {
        currentProjectFiles: updatedFiles,
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

// ============ Helper Functions ============

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
