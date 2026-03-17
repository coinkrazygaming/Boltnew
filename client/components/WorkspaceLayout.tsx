import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { fetchWorkspaces, fetchProjects } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { Plus, ChevronDown, FolderOpen, Settings, LogOut } from "lucide-react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { signOut } from "@/lib/supabase";
import { toast } from "sonner";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  const currentOrganization = useAppStore((state) => state.currentOrganization);
  const currentWorkspace = useAppStore((state) => state.currentWorkspace);
  const workspaces = useAppStore((state) => state.workspaces);
  const projects = useAppStore((state) => state.projects);
  const currentUser = useAppStore((state) => state.currentUser);

  const setWorkspaces = useAppStore((state) => state.setWorkspaces);
  const setCurrentWorkspace = useAppStore((state) => state.setCurrentWorkspace);
  const setProjects = useAppStore((state) => state.setProjects);
  const setIsAuthenticated = useAppStore((state) => state.setIsAuthenticated);
  const setUserId = useAppStore((state) => state.setUserId);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  // Load workspaces when organization changes
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!currentOrganization) return;

      setIsLoadingWorkspaces(true);
      try {
        const data = await fetchWorkspaces(currentOrganization.id);
        setWorkspaces(data);

        // Set first workspace as current if none selected
        if (!currentWorkspace && data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast.error("Failed to load workspaces");
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };

    loadWorkspaces();
  }, [currentOrganization, setWorkspaces, setCurrentWorkspace, currentWorkspace]);

  // Load projects when workspace changes
  useEffect(() => {
    const loadProjects = async () => {
      if (!currentWorkspace) return;

      try {
        const data = await fetchProjects(currentWorkspace.id);
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    };

    loadProjects();
  }, [currentWorkspace, setProjects]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUserId(null);
      setCurrentUser(null);
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="border-r border-border">
        <SidebarHeader className="border-b border-border p-4 space-y-4">
          {/* Organization */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">ORGANIZATION</p>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/settings")}
            >
              <span className="truncate text-sm">{currentOrganization?.name}</span>
              <ChevronDown size={16} />
            </Button>
          </div>

          {/* Workspace */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">WORKSPACE</p>
            {isLoadingWorkspaces ? (
              <Button variant="outline" disabled className="w-full">
                Loading...
              </Button>
            ) : (
              <Select
                value={currentWorkspace?.id || ""}
                onValueChange={(value) => {
                  const ws = workspaces.find((w) => w.id === value);
                  if (ws) setCurrentWorkspace(ws);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowCreateWorkspace(true)}
          >
            <Plus size={16} />
            New Workspace
          </Button>

          <CreateWorkspaceDialog
            open={showCreateWorkspace}
            onOpenChange={setShowCreateWorkspace}
            organizationId={currentOrganization?.id || ""}
          />
        </SidebarHeader>

        <SidebarContent className="p-4 space-y-2">
          {/* Projects List */}
          {currentWorkspace && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">PROJECTS</p>
              <div className="space-y-1">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-8 text-sm"
                    onClick={() => navigate(`/ide?project=${project.id}`)}
                  >
                    <FolderOpen size={14} />
                    <span className="truncate">{project.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SidebarContent>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-8 text-sm"
            onClick={() => navigate("/settings")}
          >
            <Settings size={14} />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-8 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Sign Out
          </Button>

          {/* User Info */}
          {currentUser && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">User</p>
              <p className="text-xs text-foreground truncate">{currentUser.email}</p>
            </div>
          )}
        </div>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
