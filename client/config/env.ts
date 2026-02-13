/**
 * Environment configuration for Bolt.new clone
 * These values should be set via .env.local or environment variables
 */

export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",

  // OpenAI Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || "",

  // WebContainers Configuration
  WEBCONTAINER_TOKEN: import.meta.env.VITE_WEBCONTAINER_TOKEN || "",

  // API URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
};

export const isConfigured = {
  supabase: !!ENV.SUPABASE_URL && !!ENV.SUPABASE_ANON_KEY,
  openai: !!ENV.OPENAI_API_KEY,
  webcontainer: !!ENV.WEBCONTAINER_TOKEN,
};
