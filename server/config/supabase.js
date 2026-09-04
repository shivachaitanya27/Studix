import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const isPlaceholder = (val) => {
  if (!val) return true;
  return (
    val.includes('your-project') ||
    val.includes('your_supabase') ||
    val.trim() === ''
  );
};

export const isSupabaseConfigured =
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey);


if (isSupabaseConfigured) {
  console.log('⚡ Supabase configuration detected. Connecting to Supabase Cloud...');
} else {
  console.log('ℹ️ Supabase environment variables not set or using placeholders. Using integrated fallback data provider.');
}

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

export default {
  isSupabaseConfigured,
  supabaseClient,
  supabaseAdmin
};
