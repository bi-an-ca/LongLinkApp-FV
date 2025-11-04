import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Initialize database schema
export async function initializeDatabase() {
  try {
    // This will be called on app initialization to ensure tables exist
    const { error } = await supabase.rpc('init_longlink_schema');
    if (error) console.log('Database already initialized or error:', error.message);
  } catch (error) {
    console.log('Database initialization skipped:', error);
  }
}
