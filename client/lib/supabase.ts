import { createClient } from "@supabase/supabase-js";
import { ENV } from "@/config/env";

let supabase: ReturnType<typeof createClient> | null = null;

export function initializeSupabase() {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not configured. Authentication will be disabled.");
    return null;
  }

  supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  return supabase;
}

export function getSupabase() {
  if (!supabase) {
    initializeSupabase();
  }
  return supabase;
}

// Auth functions
export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured");

  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured");

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithGitHub() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured");

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured");

  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;

  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
}

// Export isConfigured from ENV
export const isConfigured = {
  get supabase() {
    return !!ENV.SUPABASE_URL && !!ENV.SUPABASE_ANON_KEY;
  },
  get openai() {
    return !!ENV.OPENAI_API_KEY;
  },
  get webcontainer() {
    return !!ENV.WEBCONTAINER_TOKEN;
  },
};
