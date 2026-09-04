import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
  'https://znsmeomxgvyfbwpuplpu.supabase.co';

const supabaseKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_LJUSGQDADEMPLrUUZgwyVw_dgav0S7e';

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export default supabase;
