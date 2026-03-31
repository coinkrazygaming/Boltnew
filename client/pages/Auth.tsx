import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { signUpWithEmail, signInWithEmail, signInWithGitHub, isConfigured, getCurrentUser } from "@/lib/supabase";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const setUserId = useAppStore((state) => state.setUserId);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const setIsAuthenticated = useAppStore((state) => state.setIsAuthenticated);
  const setOrganizations = useAppStore((state) => state.setOrganizations);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          setCurrentUser({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split("@")[0] || "",
            avatar_url: user.user_metadata?.avatar_url,
            github_id: user.user_metadata?.provider_id,
          });
          setIsAuthenticated(true);

          // Store in localStorage
          localStorage.setItem("bolt_auth", JSON.stringify({
            userId: user.id,
            isAuthenticated: true,
          }));

          // Fetch organizations
          try {
            const response = await fetch("/api/organizations", {
              headers: {
                Authorization: `Bearer ${user.id}`,
              },
            });
            if (response.ok) {
              const orgs = await response.json();
              setOrganizations(orgs);
            }
          } catch (error) {
            console.error("Error fetching organizations:", error);
          }

          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, setUserId, setCurrentUser, setIsAuthenticated, setOrganizations]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured.supabase) {
      toast.error("Authentication is not configured. Using demo mode.");
      setIsAuthenticated(true);
      setUserId("demo-user");
      localStorage.setItem("bolt_auth", JSON.stringify({
        userId: "demo-user",
        isAuthenticated: true,
      }));
      navigate("/ide");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        toast.success("Account created! Check your email for verification.");
        setMode("signin");
      } else {
        const { session } = await signInWithEmail(email, password);
        if (session?.user.id) {
          setUserId(session.user.id);
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || email.split("@")[0] || "",
            avatar_url: session.user.user_metadata?.avatar_url,
          });
          setIsAuthenticated(true);

          // Store in localStorage
          localStorage.setItem("bolt_auth", JSON.stringify({
            userId: session.user.id,
            isAuthenticated: true,
          }));

          // Fetch organizations
          try {
            const response = await fetch("/api/organizations", {
              headers: {
                Authorization: `Bearer ${session.user.id}`,
              },
            });
            if (response.ok) {
              const orgs = await response.json();
              setOrganizations(orgs);
            }
          } catch (error) {
            console.error("Error fetching organizations:", error);
          }

          toast.success("Signed in successfully!");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    if (!isConfigured.supabase) {
      toast.error("GitHub authentication is not configured.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error: any) {
      toast.error(error.message || "GitHub authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    setIsAuthenticated(true);
    setUserId("demo-user");
    setCurrentUser({
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User",
    });

    // Store in localStorage
    localStorage.setItem("bolt_auth", JSON.stringify({
      userId: "demo-user",
      isAuthenticated: true,
    }));

    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4">
        <div className="text-center">
          <Zap className="text-accent animate-spin mx-auto mb-4" size={32} />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="text-accent" size={32} />
            <h1 className="text-3xl font-bold text-foreground">Bolt</h1>
          </div>
          <p className="text-muted-foreground">Build apps with AI in your browser</p>
        </div>

        {/* Card */}
        <div className="border border-border rounded-lg p-8 bg-card shadow-lg">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                mode === "signin"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                mode === "signup"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                disabled={isLoading}
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social Auth */}
          <Button
            onClick={handleGitHubAuth}
            variant="outline"
            className="w-full border-border hover:bg-secondary mb-3"
            disabled={isLoading || !isConfigured.supabase}
          >
            <Github size={18} className="mr-2" />
            GitHub
          </Button>

          {/* Demo Mode */}
          <Button
            onClick={handleDemoMode}
            variant="outline"
            className="w-full border-border hover:bg-secondary"
            disabled={isLoading}
          >
            <Mail size={18} className="mr-2" />
            Continue as Guest
          </Button>

          {/* Info */}
          {!isConfigured.supabase && (
            <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground">
                💡 Authentication is not configured. Click "Continue as Guest" to explore in demo
                mode.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
