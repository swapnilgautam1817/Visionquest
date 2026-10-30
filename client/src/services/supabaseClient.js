import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase Client] Initialized with Anon Key on Vercel Client');
  } catch (err) {
    console.warn('[Supabase Client] Failed to initialize:', err.message);
  }
}

export { supabase };

/**
 * Subscribe to real-time incident changes directly from Supabase
 */
export function subscribeToIncidents(onNewIncident) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:incidents')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, payload => {
      console.log('[Supabase Realtime] New incident detected:', payload.new);
      if (onNewIncident) onNewIncident(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

