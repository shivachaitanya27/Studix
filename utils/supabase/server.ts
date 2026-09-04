import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://znsmeomxgvyfbwpuplpu.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_LJUSGQDADEMPLrUUZgwyVw_dgav0S7e";

export const createClient = (cookieStore: any) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore?.set ? cookieStore.set(name, value, options) : null
            );
          } catch {
            // Can be ignored if middleware is refreshing user sessions
          }
        },
      },
    },
  );
};

export default createClient;
