import { RequestHandler } from "express";
import { getSupabase } from "../lib/supabase-server.ts";

// Get all organizations for current user
export const getOrganizations: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("organizations")
      .select(`
        *,
        organization_members!inner(role)
      `)
      .or(`owner_id.eq.${userId},organization_members.user_id.eq.${userId}`);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
};

// Get single organization
export const getOrganization: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("organizations")
      .select(`
        *,
        organization_members(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Organization not found" });

    // Check if user has access
    const hasAccess =
      data.owner_id === userId ||
      data.organization_members?.some((m) => m.user_id === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
};

// Create organization
export const createOrganization: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, slug, description, settings } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    const supabase = getSupabase();

    // Check if slug is unique
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert([
        {
          name,
          slug,
          description,
          owner_id: userId,
          settings: settings || {},
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ error: "Failed to create organization" });
  }
};

// Update organization
export const updateOrganization: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check if user is owner
    const { data: org, error: fetchError } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (fetchError || !org || org.owner_id !== userId) {
      return res.status(403).json({ error: "Only owner can update organization" });
    }

    const { name, slug, description, settings } = req.body;

    const { data, error } = await supabase
      .from("organizations")
      .update({
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(settings && { settings }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ error: "Failed to update organization" });
  }
};

// Delete organization
export const deleteOrganization: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check if user is owner
    const { data: org, error: fetchError } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (fetchError || !org || org.owner_id !== userId) {
      return res.status(403).json({ error: "Only owner can delete organization" });
    }

    const { error } = await supabase.from("organizations").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ error: "Failed to delete organization" });
  }
};

// Add organization member
export const addOrganizationMember: RequestHandler = async (req, res) => {
  try {
    const { id: orgId } = req.params;
    const userId = req.user?.id;
    const { user_id, role } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!user_id || !role) {
      return res.status(400).json({ error: "user_id and role are required" });
    }

    const supabase = getSupabase();

    // Check if user is owner or admin
    const { data: org, error: fetchError } = await supabase
      .from("organizations")
      .select(`
        owner_id,
        organization_members!inner(role)
      `)
      .eq("id", orgId)
      .single();

    if (fetchError || !org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const userMember = org.organization_members?.find((m) => m.user_id === userId);
    if (org.owner_id !== userId && userMember?.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { data, error } = await supabase
      .from("organization_members")
      .insert([
        {
          organization_id: orgId,
          user_id,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error adding organization member:", error);
    res.status(500).json({ error: "Failed to add organization member" });
  }
};

// Update organization member
export const updateOrganizationMember: RequestHandler = async (req, res) => {
  try {
    const { id: orgId, userId } = req.params;
    const currentUserId = req.user?.id;
    const { role } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }

    const supabase = getSupabase();

    // Check if user is owner
    const { data: org, error: fetchError } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .single();

    if (fetchError || !org || org.owner_id !== currentUserId) {
      return res.status(403).json({ error: "Only owner can update members" });
    }

    const { data, error } = await supabase
      .from("organization_members")
      .update({ role })
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating organization member:", error);
    res.status(500).json({ error: "Failed to update organization member" });
  }
};

// Remove organization member
export const removeOrganizationMember: RequestHandler = async (req, res) => {
  try {
    const { id: orgId, userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const supabase = getSupabase();

    // Check if user is owner
    const { data: org, error: fetchError } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .single();

    if (fetchError || !org || org.owner_id !== currentUserId) {
      return res.status(403).json({ error: "Only owner can remove members" });
    }

    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("organization_id", orgId)
      .eq("user_id", userId);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("Error removing organization member:", error);
    res.status(500).json({ error: "Failed to remove organization member" });
  }
};
