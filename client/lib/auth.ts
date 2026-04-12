// JWT-based authentication using Neon PostgreSQL

const API_BASE = "/api";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, name?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: name || email.split("@")[0] }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Sign up failed" }));
    throw new Error(error.error || "Sign up failed");
  }

  const data = await response.json();
  
  // Store auth token and user info
  if (data.token) {
    localStorage.setItem("auth_token", data.token);
  }
  
  return data;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Invalid credentials" }));
    throw new Error(error.error || "Invalid credentials");
  }

  const data = await response.json();
  
  // Store auth token and user info
  if (data.token) {
    localStorage.setItem("auth_token", data.token);
  }
  
  return data;
}

/**
 * Get current authentication token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

/**
 * Sign out (client-side only)
 */
export async function signOut(): Promise<void> {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("bolt_auth");
}

/**
 * Get current user from localStorage (after login)
 */
export function getCurrentUserFromStorage(): { id: string; email: string; name: string } | null {
  try {
    const authToken = getAuthToken();
    if (!authToken) return null;

    // Parse JWT token to get user info
    const parts = authToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    
    // Try to get full user info from localStorage
    const storedAuth = localStorage.getItem("bolt_auth");
    if (storedAuth) {
      const auth = JSON.parse(storedAuth);
      if (auth.user) return auth.user;
    }

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.email.split("@")[0],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * GitHub auth (not available with Neon-only setup)
 */
export async function signInWithGitHub(): Promise<never> {
  throw new Error("GitHub authentication is not available with Neon-only setup. Use email/password instead.");
}

export const isConfigured = {
  get supabase() {
    return false; // Supabase is no longer used
  },
  get neon() {
    return true; // Using Neon instead
  },
  get openai() {
    return !!localStorage.getItem("openai_api_key");
  },
  get webcontainer() {
    return !!localStorage.getItem("webcontainer_token");
  },
};
