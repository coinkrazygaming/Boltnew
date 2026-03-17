import { useAppStore } from "@/store/appStore";
import { signOut } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Github } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function ProfileSettings() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setIsAuthenticated = useAppStore((state) => state.setIsAuthenticated);
  const setUserId = useAppStore((state) => state.setUserId);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const navigate = useNavigate();

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

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No user profile loaded</p>
      </div>
    );
  }

  const initials = (currentUser.name || currentUser.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              {currentUser.github_id && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Github size={14} />
                  <span>GitHub connected</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={currentUser.name}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Controlled by your authentication provider
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                value={currentUser.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your verified email address
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Account ID</h4>
            <Input
              value={currentUser.id}
              disabled
              className="bg-muted font-mono text-xs"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Danger Zone</h4>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="gap-2 w-full sm:w-auto"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              You'll be redirected to the sign-in page
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
