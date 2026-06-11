import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth/session";
import { searchManagementUsers } from "@/lib/data/management";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const term = request.nextUrl.searchParams.get("q") || "";

  try {
    const users = await searchManagementUsers(admin.supabase, term);
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao buscar usuarios." }, { status: 400 });
  }
}
