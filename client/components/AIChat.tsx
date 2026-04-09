import { useState, useRef, useEffect } from "react";
import { Send, Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  projectName?: string;
  onClose?: () => void;
}

export function AIChat({ projectName = "My Project", onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI coding assistant. I can help you generate code, debug issues, explain concepts, and more. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call OpenAI)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm a demo AI assistant. In a production environment, I would analyze your project "${projectName}" and provide intelligent responses based on your query: "${input}"\n\nFor now, you can use the "Generate with AI" button in the top toolbar to generate code, or continue experimenting with the IDE features.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your AI coding assistant. I can help you generate code, debug issues, explain concepts, and more. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleClearChat}
            title="Clear chat"
          >
            <X size={14} />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title="Close chat"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-xs rounded-lg px-3 py-2 text-sm",
                message.role === "user"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader size={14} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent text-sm"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tip: Press Shift+Enter for new line, Enter to send
        </p>
      </div>
    </div>
  );
}
