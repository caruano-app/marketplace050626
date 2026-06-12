import { cookies } from "next/headers";
import { isCaruanoAdmin } from "@/lib/auth/admin";
import { createSupabaseRequestClient } from "@/lib/auth/session";
import { createSupabaseProfileClient, getProfileForUser } from "@/lib/auth/profile";

function getTokenFromCookieStore(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const appCookie = cookieStore.get("caruano_session_access_token")?.value;

  if (appCookie) return appCookie;

  const authCookie = cookieStore.getAll().find((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));

  if (!authCookie?.value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(authCookie.value));
    return parsed?.access_token || parsed?.[0] || null;
  } catch {
    return null;
  }
}

export async function getServerSessionClient() {
  const cookieStore = await cookies();
  const token = getTokenFromCookieStore(cookieStore);

  if (!token) {
    return null;
  }

  const supabase = createSupabaseRequestClient(token);

  if (!supabase) {
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return null;
  }

  const { profile } = await getProfileForUser(authData.user, token);

  if (!profile) {
    return null;
  }

  const adminClient = isCaruanoAdmin(profile) ? createSupabaseProfileClient(token) : null;

  return {
    supabase: adminClient || supabase,
    user: authData.user,
    profile,
  };
}
