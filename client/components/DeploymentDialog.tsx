import { useState } from "react";
import { X, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DeploymentStep {
  name: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

export function DeploymentDialog({
  isOpen,
  projectName,
  onClose,
  onDeploy,
  isDeploying,
}: {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onDeploy: () => void;
  isDeploying: boolean;
}) {
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    { name: "Preparing files", status: "pending" },
    { name: "Building application", status: "pending" },
    { name: "Uploading to server", status: "pending" },
    { name: "Configuring domain", status: "pending" },
  ]);

  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    onDeploy();

    // Simulate deployment steps
    for (let i = 0; i < deploymentSteps.length; i++) {
      setDeploymentSteps((prev) => [
        ...prev.slice(0, i),
        { ...prev[i], status: "in-progress" },
        ...prev.slice(i + 1),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setDeploymentSteps((prev) => [
        ...prev.slice(0, i),
        { ...prev[i], status: "completed" },
        ...prev.slice(i + 1),
      ]);
    }

    // Set deployed URL
    const url = `https://${projectName.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substring(7)}.bolt.app`;
    setDeployedUrl(url);
  };

  const handleCopyUrl = () => {
    if (deployedUrl) {
      navigator.clipboard.writeText(deployedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Deploy Project</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
            disabled={isDeploying}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="deploy" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent">
              <TabsTrigger value="deploy" className="rounded-none flex-1">
                Deploy
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none flex-1">
                History
              </TabsTrigger>
            </TabsList>

            {/* Deploy Tab */}
            <TabsContent value="deploy" className="p-6 space-y-6">
              {!deployedUrl ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deploy your project to make it accessible online. Your app will be live in
                      minutes.
                    </p>
                  </div>

                  {/* Deployment Steps */}
                  <div className="space-y-3">
                    {deploymentSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition",
                            {
                              "bg-muted text-muted-foreground": step.status === "pending",
                              "bg-accent text-accent-foreground animate-spin":
                                step.status === "in-progress",
                              "bg-green-600 text-white": step.status === "completed",
                              "bg-red-600 text-white": step.status === "error",
                            }
                          )}
                        >
                          {step.status === "completed" ? (
                            "✓"
                          ) : step.status === "error" ? (
                            "✕"
                          ) : (
                            <span className={step.status === "in-progress" ? "invisible" : ""}>
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn("text-sm font-medium", {
                              "text-muted-foreground": step.status === "pending",
                              "text-accent": step.status === "in-progress",
                              "text-green-600": step.status === "completed",
                              "text-red-600": step.status === "error",
                            })}
                          >
                            {step.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 Your project will be deployed to our global CDN and accessible via a public
                      URL. You can deploy new versions anytime.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Deployment Successful!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your project is now live and accessible online.
                      </p>
                    </div>
                  </div>

                  {/* URL Display */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Live URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={deployedUrl}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyUrl}
                        className="border-border"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>

                  {/* Open in new tab */}
                  <Button
                    asChild
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={16} className="mr-2" />
                      Open Deployed App
                    </a>
                  </Button>

                  {/* Share Info */}
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      Share the URL above with others to let them see your app in action!
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  {
                    date: "Today at 2:30 PM",
                    url: "https://my-project-abc123.bolt.app",
                    status: "Live",
                  },
                  {
                    date: "Yesterday at 10:15 AM",
                    url: "https://my-project-def456.bolt.app",
                    status: "Archived",
                  },
                  {
                    date: "2 days ago at 5:45 PM",
                    url: "https://my-project-ghi789.bolt.app",
                    status: "Archived",
                  },
                ].map((deployment, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{deployment.date}</p>
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {deployment.status}
                      </span>
                    </div>
                    <a
                      href={deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent/80 transition flex items-center gap-1"
                    >
                      {deployment.url}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        {!deployedUrl && (
          <div className="border-t border-border p-4 flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-border"
              disabled={isDeploying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isDeploying}
            >
              {isDeploying ? "Deploying..." : "Deploy Now"}
            </Button>
          </div>
        )}

        {deployedUrl && (
          <div className="border-t border-border p-4">
            <Button onClick={onClose} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
