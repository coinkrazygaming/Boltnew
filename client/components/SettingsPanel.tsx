import { useState } from "react";
import { X, Moon, Sun, Type, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const editorState = useAppStore((state) => state.editorState);
  const setEditorState = useAppStore((state) => state.setEditorState);
  const setTheme = useAppStore((state) => state.setTheme);
  const setFontSize = useAppStore((state) => state.setFontSize);

  const handleFontSizeChange = (size: number) => {
    setFontSize(Math.max(10, Math.min(24, size)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent">
              <TabsTrigger value="appearance" className="rounded-none flex-1">
                Appearance
              </TabsTrigger>
              <TabsTrigger value="editor" className="rounded-none flex-1">
                Editor
              </TabsTrigger>
            </TabsList>

            {/* Appearance */}
            <TabsContent value="appearance" className="p-6 space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "p-3 rounded-lg border-2 transition text-sm font-medium flex items-center justify-center gap-2",
                      editorState.theme === "dark"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-secondary hover:border-muted-foreground text-muted-foreground"
                    )}
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "p-3 rounded-lg border-2 transition text-sm font-medium flex items-center justify-center gap-2",
                      editorState.theme === "light"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-secondary hover:border-muted-foreground text-muted-foreground"
                    )}
                  >
                    <Sun size={16} />
                    Light
                  </button>
                </div>
              </div>

              {/* Color Scheme Info */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  The application uses a modern developer theme optimized for long coding sessions.
                </p>
              </div>
            </TabsContent>

            {/* Editor */}
            <TabsContent value="editor" className="p-6 space-y-6">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Type size={16} />
                    Font Size
                  </label>
                  <span className="text-sm text-muted-foreground">{editorState.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={editorState.fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Font Family</label>
                <select
                  value={editorState.fontFamily}
                  onChange={(e) =>
                    setEditorState({
                      fontFamily: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="Fira Code">Fira Code</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Inconsolata">Inconsolata</option>
                  <option value="Ubuntu Mono">Ubuntu Mono</option>
                </select>
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Eye size={16} />
                  Word Wrap
                </label>
                <button
                  onClick={() =>
                    setEditorState({
                      wordWrap: !editorState.wordWrap,
                    })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition",
                    editorState.wordWrap ? "bg-accent" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition",
                      editorState.wordWrap ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Minimap */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Minimap</label>
                <button
                  onClick={() =>
                    setEditorState({
                      showMinimap: !editorState.showMinimap,
                    })
                  }
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition",
                    editorState.showMinimap ? "bg-accent" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition",
                      editorState.showMinimap ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Help Text */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  Your settings are automatically saved and applied to the editor in real-time.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex gap-2">
          <Button onClick={onClose} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
