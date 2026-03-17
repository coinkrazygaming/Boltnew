import { RequestHandler } from "express";
import { getSupabase } from "../lib/supabase-server.ts";

// Get project settings
export const getProjectSettings: RequestHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", projectId)
      .single();

    if (projError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", project.workspace_id)
      .single();

    if (workspace) {
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", workspace.organization_id)
        .or(`owner_id.eq.${userId},organization_members.user_id.eq.${userId}`)
        .single();

      if (!org) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    const { data, error } = await supabase
      .from("project_settings")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Settings not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching project settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// Update project settings
export const updateProjectSettings: RequestHandler = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", projectId)
      .single();

    if (projError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", project.workspace_id)
      .single();

    if (workspace) {
      const { data: org } = await supabase
        .from("organizations")
        .select("owner_id,organization_members!inner(role)")
        .eq("id", workspace.organization_id)
        .single();

      if (
        !org ||
        (org.owner_id !== userId &&
          !org.organization_members?.some((m) => m.user_id === userId && m.role === "admin"))
      ) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
    }

    const {
      deployment_domain,
      environment_variables,
      build_command,
      start_command,
      auto_sync_enabled,
      auto_deploy_enabled,
    } = req.body;

    const { data, error } = await supabase
      .from("project_settings")
      .update({
        ...(deployment_domain !== undefined && { deployment_domain }),
        ...(environment_variables && { environment_variables }),
        ...(build_command !== undefined && { build_command }),
        ...(start_command !== undefined && { start_command }),
        ...(auto_sync_enabled !== undefined && { auto_sync_enabled }),
        ...(auto_deploy_enabled !== undefined && { auto_deploy_enabled }),
      })
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating project settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
