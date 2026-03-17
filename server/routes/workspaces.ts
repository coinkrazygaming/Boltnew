import { RequestHandler } from "express";
import { getSupabase } from "../lib/supabase-server.ts";

// Get all workspaces in an organization
export const getWorkspaces: RequestHandler = async (req, res) => {
  try {
    const { organization_id } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!organization_id) {
      return res.status(400).json({ error: "organization_id is required" });
    }

    const supabase = getSupabase();

    // Check if user has access to organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", organization_id as string)
      .or(`owner_id.eq.${userId},organization_members.user_id.eq.${userId}`)
      .single();

    if (orgError || !org) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("organization_id", organization_id as string);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};

// Get single workspace
export const getWorkspace: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check access via organization
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", data.organization_id)
      .or(`owner_id.eq.${userId},organization_members.user_id.eq.${userId}`)
      .single();

    if (!org) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ error: "Failed to fetch workspace" });
  }
};

// Create workspace
export const createWorkspace: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { organization_id, name } = req.body;

    if (!organization_id || !name) {
      return res.status(400).json({ error: "organization_id and name are required" });
    }

    const supabase = getSupabase();

    // Check if user is admin/owner of organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select(`
        owner_id,
        organization_members!inner(role)
      `)
      .eq("id", organization_id)
      .single();

    if (orgError || !org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const isAdmin =
      org.owner_id === userId ||
      org.organization_members?.some((m) => m.user_id === userId && m.role === "admin");

    if (!isAdmin) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { data, error } = await supabase
      .from("workspaces")
      .insert([
        {
          organization_id,
          name,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ error: "Failed to create workspace" });
  }
};

// Update workspace
export const updateWorkspace: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", id)
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

    const { name, settings } = req.body;

    const { data, error } = await supabase
      .from("workspaces")
      .update({
        ...(name && { name }),
        ...(settings && { settings }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ error: "Failed to update workspace" });
  }
};

// Delete workspace
export const deleteWorkspace: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check access
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .select("organization_id")
      .eq("id", id)
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

    const { error } = await supabase.from("workspaces").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
};
