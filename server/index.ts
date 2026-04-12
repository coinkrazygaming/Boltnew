import "dotenv/config";
import express, { RequestHandler } from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSignUp, handleSignIn, handleCreateAdminUser } from "./routes/auth";
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
} from "./routes/organizations";
import {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "./routes/workspaces";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "./routes/projects";
import {
  getProjectSettings,
  updateProjectSettings,
} from "./routes/project-settings";
import { verifyToken } from "./lib/auth";

// Middleware to extract user from JWT token
const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // User is not authenticated, continue anyway for public endpoints
      return next();
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = verifyToken(token);
    if (decoded) {
      // Attach user to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authMiddleware);

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/signup", handleSignUp);
  app.post("/api/auth/signin", handleSignIn);
  app.post("/api/admin/create-user", handleCreateAdminUser);

  // Organization routes
  app.get("/api/organizations", getOrganizations);
  app.get("/api/organizations/:id", getOrganization);
  app.post("/api/organizations", createOrganization);
  app.put("/api/organizations/:id", updateOrganization);
  app.delete("/api/organizations/:id", deleteOrganization);

  // Organization members routes
  app.post("/api/organizations/:id/members", addOrganizationMember);
  app.put("/api/organizations/:id/members/:userId", updateOrganizationMember);
  app.delete("/api/organizations/:id/members/:userId", removeOrganizationMember);

  // Workspace routes
  app.get("/api/workspaces", getWorkspaces);
  app.get("/api/workspaces/:id", getWorkspace);
  app.post("/api/workspaces", createWorkspace);
  app.put("/api/workspaces/:id", updateWorkspace);
  app.delete("/api/workspaces/:id", deleteWorkspace);

  // Project routes
  app.get("/api/projects", getProjects);
  app.get("/api/projects/:id", getProject);
  app.post("/api/projects", createProject);
  app.put("/api/projects/:id", updateProject);
  app.delete("/api/projects/:id", deleteProject);

  // Project settings routes
  app.get("/api/projects/:projectId/settings", getProjectSettings);
  app.put("/api/projects/:projectId/settings", updateProjectSettings);

  return app;
}
