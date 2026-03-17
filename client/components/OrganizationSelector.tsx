import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Settings2 } from "lucide-react";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";

export function OrganizationSelector() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const currentOrganization = useAppStore((state) => state.currentOrganization);
  const organizations = useAppStore((state) => state.organizations);
  const setCurrentOrganization = useAppStore((state) => state.setCurrentOrganization);

  if (!organizations || organizations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">No organizations yet</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Plus size={16} />
          Create
        </Button>
        <CreateOrganizationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentOrganization?.id || organizations[0]?.id || ""}
        onValueChange={(value) => {
          const org = organizations.find((o) => o.id === value);
          if (org) {
            setCurrentOrganization(org);
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowCreateDialog(true)}
        title="Create new organization"
        className="gap-2"
      >
        <Plus size={16} />
      </Button>

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
