import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { fetchOrganizations } from "@/lib/api-client";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateOrganizationDialog } from "@/components/CreateOrganizationDialog";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userId = useAppStore((state) => state.userId);
  const organizations = useAppStore((state) => state.organizations);
  const currentOrganization = useAppStore((state) => state.currentOrganization);

  const setOrganizations = useAppStore((state) => state.setOrganizations);
  const setCurrentOrganization = useAppStore((state) => state.setCurrentOrganization);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate("/auth");
      return;
    }
  }, [isAuthenticated, userId, navigate]);

  // Load organizations on mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await fetchOrganizations();
        setOrganizations(data);

        // Set first organization as current if none selected
        if (!currentOrganization && data.length > 0) {
          setCurrentOrganization(data[0]);
        } else if (data.length === 0) {
          // No organizations, show create dialog
          setShowCreateOrgDialog(true);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to load organizations");
      }
    };

    loadOrganizations();
  }, [currentOrganization, setOrganizations, setCurrentOrganization]);

  if (!isAuthenticated || !userId) {
    return null;
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
            <p className="text-muted-foreground mb-4">Create your first organization to begin</p>
          </div>

          <Button
            onClick={() => setShowCreateOrgDialog(true)}
            className="gap-2 w-full"
            size="lg"
          >
            <Plus size={18} />
            Create Organization
          </Button>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> In demo mode, organizations are stored locally. Use the Dashboard to manage your projects.
            </p>
          </div>

          <CreateOrganizationDialog
            open={showCreateOrgDialog}
            onOpenChange={setShowCreateOrgDialog}
          />
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return null;
  }

  return (
    <WorkspaceLayout>
      <ProjectGrid />
    </WorkspaceLayout>
  );
}
