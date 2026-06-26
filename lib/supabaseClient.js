import { createClient } from '@supabase/supabase-js';

// Read public keys from environment (may be undefined during build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Avoid throwing at module init time so Next builds don't fail when envs are not present.
// Export a "null-safe" client. Callers should guard if `supabase` is null.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to lazily create a client if needed at runtime
export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (supabase) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey);
}
