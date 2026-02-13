import "./global.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeSupabase } from "./lib/supabase";
import { useAppStore } from "./store/appStore";
import Home from "./pages/Home";
import IDE from "./pages/IDE";
import IDEAdvanced from "./pages/IDEAdvanced";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Initialize Supabase on app load
initializeSupabase();

const queryClient = new QueryClient();

const App = () => {
  // Hydrate store from localStorage if available
  React.useEffect(() => {
    const storedAuth = localStorage.getItem("bolt_auth");
    if (storedAuth) {
      const { userId, isAuthenticated } = JSON.parse(storedAuth);
      useAppStore.setState({
        userId,
        isAuthenticated,
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ide" element={<IDEAdvanced />} />
            <Route path="/ide-basic" element={<IDE />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
