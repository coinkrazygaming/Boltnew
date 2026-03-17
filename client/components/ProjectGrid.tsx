import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { deleteProject } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, ExternalLink, Github } from "lucide-react";
import { toast } from "sonner";
import { CreateProjectDialog } from "./CreateProjectDialog";

export function ProjectGrid() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentWorkspace = useAppStore((state) => state.currentWorkspace);
  const projects = useAppStore((state) => state.projects);
  const setProjects = useAppStore((state) => state.setProjects);

  const handleDeleteProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/ide?project=${projectId}`);
  };

  if (!currentWorkspace) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Select a workspace to view projects</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first project in <span className="font-medium">{currentWorkspace.name}</span>
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus size={18} />
          Create Project
        </Button>
        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          workspaceId={currentWorkspace.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground text-sm">
            {projects.length} {projects.length === 1 ? "project" : "projects"} in{" "}
            {currentWorkspace.name}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus size={18} />
          New Project
        </Button>
        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          workspaceId={currentWorkspace.id}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:border-accent/50 transition cursor-pointer group"
            onClick={() => handleOpenProject(project.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate group-hover:text-accent transition">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    project.status === "running"
                      ? "default"
                      : project.status === "error"
                        ? "destructive"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3" onClick={(e) => e.stopPropagation()}>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}

              {project.github_repo_url && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Github size={14} />
                  <span className="truncate">{project.github_repo_url}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <ExternalLink size={14} />
                  Open
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" disabled={isLoading}>
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All files and data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
