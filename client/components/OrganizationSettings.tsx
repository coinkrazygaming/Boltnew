import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { fetchOrganizations, deleteOrganization, removeOrganizationMember } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Trash2, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";

export function OrganizationSettings() {
  const organizations = useAppStore((state) => state.organizations);
  const currentUser = useAppStore((state) => state.currentUser);
  const setOrganizations = useAppStore((state) => state.setOrganizations);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const selectedOrg = selectedOrgId
    ? organizations.find((org) => org.id === selectedOrgId)
    : organizations[0];

  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  const isOwner = selectedOrg?.owner_id === currentUser?.id;

  const handleDeleteOrganization = async () => {
    if (!selectedOrg) return;

    setIsLoading(true);
    try {
      await deleteOrganization(selectedOrg.id);
      const updated = await fetchOrganizations();
      setOrganizations(updated);
      if (updated.length > 0) {
        setSelectedOrgId(updated[0].id);
      } else {
        setSelectedOrgId(null);
      }
      toast.success("Organization deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete organization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedOrg) return;

    setIsLoading(true);
    try {
      await removeOrganizationMember(selectedOrg.id, userId);
      const updated = await fetchOrganizations();
      setOrganizations(updated);
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  if (organizations.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No organizations yet</h3>
        <p className="text-muted-foreground mb-4">
          Create an organization to get started
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Organization
        </Button>
        <CreateOrganizationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Your Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  selectedOrg?.id === org.id
                    ? "border-accent bg-accent/10"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <p className="font-medium">{org.name}</p>
                <p className="text-xs text-muted-foreground">{org.slug}</p>
              </button>
            ))}
          </div>
          <Button
            className="w-full mt-4"
            onClick={() => setShowCreateDialog(true)}
          >
            Create Organization
          </Button>
          <CreateOrganizationDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
          />
        </CardContent>
      </Card>

      {/* Organization Details */}
      {selectedOrg && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedOrg.name}</span>
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All projects and data will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteOrganization}
                          disabled={isLoading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardTitle>
              <CardDescription>{selectedOrg.slug}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedOrg.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{selectedOrg.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedOrg.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Members Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Members
              </CardTitle>
              <CardDescription>
                Manage organization members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <p>Members management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
