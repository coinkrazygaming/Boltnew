import { RequestHandler } from "express";
import { getSupabase } from "../lib/supabase-server.ts";

// Get all projects in a workspace
export const getProjects: RequestHandler = async (req, res) => {
  try {
    const { workspace_id } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!workspace_id) {
      return res.status(400).json({ error: "workspace_id is required" });
    }

    const supabase = getSupabase();

    // Check if user has access to workspace
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", workspace_id as string)
      .single();

    if (wsError || !workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", workspace.organization_id)
      .or(`owner_id.eq.${userId},organization_members.user_id.eq.${userId}`)
      .single();

    if (!org) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", workspace_id as string);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// Get single project
export const getProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check access via workspace -> organization
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", data.workspace_id)
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

    res.json(data);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// Create project
export const createProject: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { workspace_id, name, description } = req.body;

    if (!workspace_id || !name) {
      return res.status(400).json({ error: "workspace_id and name are required" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", workspace_id)
      .single();

    if (wsError || !workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

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

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          workspace_id,
          name,
          description,
          created_by: userId,
          settings: {
            environment_variables: {},
            auto_sync_enabled: false,
            auto_deploy_enabled: false,
          },
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create default project settings
    await supabase
      .from("project_settings")
      .insert([
        {
          project_id: data.id,
          environment_variables: {},
          auto_sync_enabled: false,
          auto_deploy_enabled: false,
        },
      ]);

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Update project
export const updateProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", id)
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

    const { name, description, status, settings } = req.body;

    const { data, error } = await supabase
      .from("projects")
      .update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(settings && { settings }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// Delete project
export const deleteProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("workspace_id")
      .eq("id", id)
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

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
