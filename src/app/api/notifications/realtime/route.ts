import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser, getSessionToken } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const accessToken = getSessionToken(request);

  if (!accessToken) {
    return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
  }

  return NextResponse.json({
    userId: auth.user.id,
    accessToken,
  });
}
