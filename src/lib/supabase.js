import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// True only when BOTH credentials are present. When false the app falls back to
// localStorage (see ./db). We never call createClient with empty args because
// it throws synchronously and would white-screen the whole app on load.
export const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseCredentials) {
  console.warn(
    '[studio] Supabase credentials not found (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Running in localStorage mode — data is stored only in this browser.'
  );
}

// createClient throws synchronously on an invalid URL, so guard it: a bad/
// placeholder .env then falls back to localStorage instead of white-screening.
let client = null;
if (hasSupabaseCredentials) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('[studio] Failed to initialize Supabase client, falling back to localStorage:', e?.message || e);
  }
}

export const supabase = client;
