import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { fetchProjectSettings, updateProjectSettings } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProjectSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [deploymentDomain, setDeploymentDomain] = useState("");
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [buildCommand, setBuildCommand] = useState("");
  const [startCommand, setStartCommand] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [autoDeploy, setAutoDeploy] = useState(false);

  // Form display state
  const [envVarInput, setEnvVarInput] = useState("");

  const currentProject = useAppStore((state) => state.currentProject);

  // Load project settings
  useEffect(() => {
    if (!projectId) return;

    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await fetchProjectSettings(projectId);
        setDeploymentDomain(settings.deployment_domain || "");
        setEnvVars(settings.environment_variables || {});
        setBuildCommand(settings.build_command || "");
        setStartCommand(settings.start_command || "");
        setAutoSync(settings.auto_sync_enabled || false);
        setAutoDeploy(settings.auto_deploy_enabled || false);
      } catch (error: any) {
        toast.error("Failed to load project settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [projectId]);

  const handleSaveSettings = async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      await updateProjectSettings(projectId, {
        deployment_domain: deploymentDomain,
        environment_variables: envVars,
        build_command: buildCommand,
        start_command: startCommand,
        auto_sync_enabled: autoSync,
        auto_deploy_enabled: autoDeploy,
      });
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const addEnvVar = () => {
    if (!envVarInput.includes("=")) {
      toast.error("Environment variable must be in KEY=VALUE format");
      return;
    }

    const [key, value] = envVarInput.split("=");
    if (!key.trim()) {
      toast.error("Environment variable key cannot be empty");
      return;
    }

    setEnvVars({
      ...envVars,
      [key.trim()]: value || "",
    });
    setEnvVarInput("");
  };

  const removeEnvVar = (key: string) => {
    const newVars = { ...envVars };
    delete newVars[key];
    setEnvVars(newVars);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
              <p className="text-sm text-muted-foreground">Project Configuration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="deployment" className="space-y-6">
          <TabsList>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="build">Build & Start</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Domain</CardTitle>
                <CardDescription>
                  Set a custom subdomain for your deployed application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Domain</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="my-app"
                      value={deploymentDomain}
                      onChange={(e) => setDeploymentDomain(e.target.value)}
                      disabled={isSaving}
                    />
                    <span className="px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
                      .app.example.com
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your app will be available at: {deploymentDomain || "my-app"}.app.example.com
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                  <div className="text-sm text-blue-900 dark:text-blue-300">
                    <p className="font-medium mb-1">Domain Requirements</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Must be unique across the platform</li>
                      <li>• Only alphanumeric and hyphens allowed</li>
                      <li>• Minimum 3 characters</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Build & Start Tab */}
          <TabsContent value="build" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Build & Start Commands</CardTitle>
                <CardDescription>
                  Configure how your project is built and started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Build Command</label>
                  <Input
                    placeholder="npm run build"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Command to build your project (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Command</label>
                  <Input
                    placeholder="npm start"
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Command to start your application (optional)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environment Tab */}
          <TabsContent value="environment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  Add secure environment variables for your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">Add Variable</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="KEY=VALUE"
                      value={envVarInput}
                      onChange={(e) => setEnvVarInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addEnvVar();
                        }
                      }}
                      disabled={isSaving}
                    />
                    <Button
                      onClick={addEnvVar}
                      disabled={isSaving || !envVarInput}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {Object.keys(envVars).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Current Variables</h4>
                    <div className="space-y-1">
                      {Object.entries(envVars).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="text-sm font-mono">
                            <span className="text-foreground">{key}</span>
                            <span className="text-muted-foreground">=</span>
                            <span className="text-muted-foreground">{"•".repeat(value.length)}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEnvVar(key)}
                            disabled={isSaving}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Enable automatic synchronization and deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-sync from GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically pull changes from your GitHub repository
                    </p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} disabled={isSaving} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-deploy on sync</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically deploy when changes are synced from GitHub
                    </p>
                  </div>
                  <Switch checked={autoDeploy} onCheckedChange={setAutoDeploy} disabled={isSaving} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="gap-2"
            size="lg"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
