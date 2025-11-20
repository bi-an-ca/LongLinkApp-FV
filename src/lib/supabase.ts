import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.';
  console.error(errorMsg);
  console.error('Current env check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0
  });
  throw new Error(errorMsg);
}

// Log connection info (without sensitive data) - only in development
if (import.meta.env.DEV) {
  console.log('Supabase connection initialized:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0
  });
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Initialize database schema
export async function initializeDatabase() {
  try {
    // This will be called on app initialization to ensure tables exist
    const { error } = await supabase.rpc('init_longlink_schema');
    if (error && import.meta.env.DEV) {
      console.log('Database already initialized or error:', error.message);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.log('Database initialization skipped:', error);
    }
  }
}
