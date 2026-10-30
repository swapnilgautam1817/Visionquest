import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = config.supabase.url;
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;

  if (url && key && url.startsWith('http') && !url.includes('your-project-id')) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
      console.log('✅ Connected to Supabase Cloud Instance at:', url);
    } catch (err) {
      console.warn('⚠️ Failed to initialize Supabase client:', err.message);
      supabaseClient = null;
    }
  } else {
    console.log('ℹ️ Supabase credentials not provided. Using persistent local storage fallback.');
  }

  return supabaseClient;
}

export const isSupabaseConfigured = () => {
  const url = config.supabase.url;
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
  return !!(url && key && url.startsWith('http') && !url.includes('your-project-id'));
};

