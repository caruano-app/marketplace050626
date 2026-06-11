import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { AppNotification } from "@/lib/data/notifications";

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error, notifications: [], unread: 0 }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("notificacoes")
    .select("id,usuario_id,titulo,mensagem,tipo,lida,link_acao,criado_em")
    .eq("usuario_id", auth.user.id)
    .order("criado_em", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message, notifications: [], unread: 0 }, { status: 200 });
  }

  const notifications = (data || []) as AppNotification[];

  return NextResponse.json({
    notifications,
    unread: notifications.filter((notification) => !notification.lida).length,
  });
}
