import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  !supabaseAnonKey.includes('tu-anon-key')
);

// Polyfill de transporte de WebSocket para Node.js < 22 en Server-Side Rendering (SSR)
class SSRWebSocketDummy {}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
      },
      realtime: {
        transport: typeof WebSocket !== 'undefined' ? WebSocket : (SSRWebSocketDummy as any),
      },
    })
  : null;
