import { Organization, Workspace, Project } from "@/store/appStore";

const API_BASE = "/api";

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const { getSupabase } = await import("./supabase");
    const client = getSupabase();
    if (!client) {
      // Supabase not configured, fall back to stored userId (demo mode)
      const storedAuth = localStorage.getItem("bolt_auth");
      if (storedAuth) {
        const { userId } = JSON.parse(storedAuth);
        return userId || null;
      }
      return null;
    }

    const {
      data: { session },
    } = await client.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    // Fall back to stored userId (demo mode)
    const storedAuth = localStorage.getItem("bolt_auth");
    if (storedAuth) {
      const { userId } = JSON.parse(storedAuth);
      return userId || null;
    }
    return null;
  }
}

// Helper function to make authenticated requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

// ============ Organization APIs ============

export async function fetchOrganizations(): Promise<Organization[]> {
  return apiRequest<Organization[]>("/organizations");
}

export async function fetchOrganization(id: string): Promise<Organization> {
  return apiRequest<Organization>(`/organizations/${id}`);
}

export async function createOrganization(
  name: string,
  slug: string,
  description?: string
): Promise<Organization> {
  return apiRequest<Organization>("/organizations", {
    method: "POST",
    body: JSON.stringify({ name, slug, description }),
  });
}

export async function updateOrganization(
  id: string,
  data: Partial<Organization>
): Promise<Organization> {
  return apiRequest<Organization>(`/organizations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrganization(id: string): Promise<void> {
  return apiRequest<void>(`/organizations/${id}`, {
    method: "DELETE",
  });
}

export async function addOrganizationMember(
  orgId: string,
  userId: string,
  role: "owner" | "admin" | "member"
): Promise<{ organization_id: string; user_id: string; role: string }> {
  return apiRequest(`/organizations/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role }),
  });
}

export async function updateOrganizationMember(
  orgId: string,
  userId: string,
  role: "owner" | "admin" | "member"
): Promise<{ organization_id: string; user_id: string; role: string }> {
  return apiRequest(`/organizations/${orgId}/members/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function removeOrganizationMember(orgId: string, userId: string): Promise<void> {
  return apiRequest<void>(`/organizations/${orgId}/members/${userId}`, {
    method: "DELETE",
  });
}

// ============ Workspace APIs ============

export async function fetchWorkspaces(organizationId: string): Promise<Workspace[]> {
  return apiRequest<Workspace[]>(`/workspaces?organization_id=${organizationId}`);
}

export async function fetchWorkspace(id: string): Promise<Workspace> {
  return apiRequest<Workspace>(`/workspaces/${id}`);
}

export async function createWorkspace(
  organizationId: string,
  name: string
): Promise<Workspace> {
  return apiRequest<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify({ organization_id: organizationId, name }),
  });
}

export async function updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
  return apiRequest<Workspace>(`/workspaces/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWorkspace(id: string): Promise<void> {
  return apiRequest<void>(`/workspaces/${id}`, {
    method: "DELETE",
  });
}

// ============ Project APIs ============

export async function fetchProjects(workspaceId: string): Promise<Project[]> {
  return apiRequest<Project[]>(`/projects?workspace_id=${workspaceId}`);
}

export async function fetchProject(id: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}`);
}

export async function createProject(
  workspaceId: string,
  name: string,
  description?: string
): Promise<Project> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify({ workspace_id: workspaceId, name, description }),
  });
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return apiRequest<void>(`/projects/${id}`, {
    method: "DELETE",
  });
}

// ============ Project Settings APIs ============

interface ProjectSettingsData {
  deployment_domain?: string;
  environment_variables?: Record<string, string>;
  build_command?: string;
  start_command?: string;
  auto_sync_enabled?: boolean;
  auto_deploy_enabled?: boolean;
}

export async function fetchProjectSettings(projectId: string): Promise<ProjectSettingsData> {
  return apiRequest<ProjectSettingsData>(`/projects/${projectId}/settings`);
}

export async function updateProjectSettings(
  projectId: string,
  settings: ProjectSettingsData
): Promise<ProjectSettingsData> {
  return apiRequest<ProjectSettingsData>(`/projects/${projectId}/settings`, {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}
