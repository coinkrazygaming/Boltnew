import { RequestHandler } from "express";
import { query } from "../lib/db";

// Get all organizations for current user
export const getOrganizations: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get organizations where user is owner or member
    const result = await query(
      `SELECT DISTINCT o.* FROM organizations o
       LEFT JOIN organization_members om ON o.id = om.organization_id
       WHERE o.owner_id = $1 OR om.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: error.message || "Failed to fetch organizations" });
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

    const result = await query(
      `SELECT * FROM organizations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const org = result.rows[0];

    // Check if user has access (owner or member)
    if (org.owner_id !== userId) {
      const memberResult = await query(
        `SELECT * FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (memberResult.rows.length === 0) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    res.json(org);
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ error: error.message || "Failed to fetch organization" });
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

    // Check if slug is unique
    const existingResult = await query(
      `SELECT id FROM organizations WHERE slug = $1`,
      [slug]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    // Create organization
    const result = await query(
      `INSERT INTO organizations (name, slug, description, owner_id, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, slug, description || null, userId, JSON.stringify(settings || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error creating organization:", error);
    res.status(500).json({ error: error.message || "Failed to create organization" });
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

    // Check if user is owner
    const orgResult = await query(
      `SELECT owner_id FROM organizations WHERE id = $1`,
      [id]
    );

    if (orgResult.rows.length === 0 || orgResult.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Only owner can update organization" });
    }

    const { name, slug, description, settings } = req.body;

    const result = await query(
      `UPDATE organizations
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           settings = COALESCE($4, settings),
           updated_at = now()
       WHERE id = $5
       RETURNING *`,
      [name || null, slug || null, description || null, settings ? JSON.stringify(settings) : null, id]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating organization:", error);
    res.status(500).json({ error: error.message || "Failed to update organization" });
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

    // Check if user is owner
    const orgResult = await query(
      `SELECT owner_id FROM organizations WHERE id = $1`,
      [id]
    );

    if (orgResult.rows.length === 0 || orgResult.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Only owner can delete organization" });
    }

    await query(`DELETE FROM organizations WHERE id = $1`, [id]);

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ error: error.message || "Failed to delete organization" });
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

    // Check if user is owner or admin
    const orgResult = await query(
      `SELECT owner_id FROM organizations WHERE id = $1`,
      [orgId]
    );

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (orgResult.rows[0].owner_id !== userId) {
      const memberResult = await query(
        `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
        [orgId, userId]
      );

      if (memberResult.rows.length === 0 || memberResult.rows[0].role !== "admin") {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
    }

    // Add member
    const result = await query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [orgId, user_id, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Error adding organization member:", error);
    res.status(500).json({ error: error.message || "Failed to add organization member" });
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

    // Check if user is owner
    const orgResult = await query(
      `SELECT owner_id FROM organizations WHERE id = $1`,
      [orgId]
    );

    if (orgResult.rows.length === 0 || orgResult.rows[0].owner_id !== currentUserId) {
      return res.status(403).json({ error: "Only owner can update members" });
    }

    const result = await query(
      `UPDATE organization_members
       SET role = $1
       WHERE organization_id = $2 AND user_id = $3
       RETURNING *`,
      [role, orgId, userId]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating organization member:", error);
    res.status(500).json({ error: error.message || "Failed to update organization member" });
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

    // Check if user is owner
    const orgResult = await query(
      `SELECT owner_id FROM organizations WHERE id = $1`,
      [orgId]
    );

    if (orgResult.rows.length === 0 || orgResult.rows[0].owner_id !== currentUserId) {
      return res.status(403).json({ error: "Only owner can remove members" });
    }

    await query(
      `DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
      [orgId, userId]
    );

    res.status(204).send();
  } catch (error: any) {
    console.error("Error removing organization member:", error);
    res.status(500).json({ error: error.message || "Failed to remove organization member" });
  }
};
