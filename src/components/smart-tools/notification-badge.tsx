"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppNotification } from "@/lib/data/notifications";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NotificationsResponse = {
  notifications: AppNotification[];
  unread: number;
  error?: string;
};

type RealtimeSessionResponse = {
  userId?: string;
  accessToken?: string;
  error?: string;
};

type NotificationBellProps = {
  placement?: "fixed" | "inline";
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function NotificationBell({ placement = "fixed" }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  const wrapperClass = useMemo(() => {
    if (placement === "inline") return "relative";
    return "fixed right-4 top-4 z-40";
  }, [placement]);

  const loadNotifications = useCallback(async () => {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    const payload = (await response.json()) as NotificationsResponse;

    if (!response.ok || payload.error) {
      setMessage(payload.error || "Notificacoes indisponiveis.");
      setNotifications([]);
      setUnread(0);
      return;
    }

    setNotifications(payload.notifications || []);
    setUnread(payload.unread || 0);
    setMessage("");
  }, []);

  async function markAsRead(notification: AppNotification) {
    if (!notification.lida) {
      await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
      await loadNotifications();
    }

    if (notification.link_acao) {
      window.location.href = notification.link_acao;
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    let toastTimer: number | undefined;
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return undefined;
    }

    const realtimeClient = supabase;

    async function subscribeToNotifications() {
      const response = await fetch("/api/notifications/realtime", { cache: "no-store" });
      const payload = (await response.json()) as RealtimeSessionResponse;

      if (!response.ok || payload.error || !payload.userId || !payload.accessToken) {
        return undefined;
      }

      realtimeClient.realtime.setAuth(payload.accessToken);

      const channel = realtimeClient
        .channel(`notificacoes:${payload.userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notificacoes",
            filter: `usuario_id=eq.${payload.userId}`,
          },
          (event) => {
            const notification = event.new as AppNotification;
            setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 20));
            setUnread((current) => current + (notification.lida ? 0 : 1));
            setToast(notification.titulo || "Nova notificacao Caruano");
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => setToast(""), 4200);
          },
        )
        .subscribe();

      return channel;
    }

    let activeChannel: Awaited<ReturnType<typeof subscribeToNotifications>> | undefined;
    void subscribeToNotifications().then((channel) => {
      activeChannel = channel;
    });

    return () => {
      window.clearTimeout(toastTimer);
      if (activeChannel) {
        void realtimeClient.removeChannel(activeChannel);
      }
    };
  }, []);

  return (
    <>
      <div className={wrapperClass}>
        <button
          aria-label="Abrir notificacoes"
          className="relative grid min-h-11 min-w-11 place-items-center rounded-full bg-zinc-900 text-[#FFC300] shadow-lg active:scale-95 active:opacity-80"
          onClick={() => setOpen(true)}
          type="button"
        >
          <BellIcon />
          {unread ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-pulse place-items-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <section className="max-h-[82vh] w-full overflow-y-auto rounded-t-[18px] bg-white p-4 shadow-xl md:mx-auto md:max-w-xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-neutral-300" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-orange-600">Central Caruano</p>
                <h2 className="text-2xl font-black uppercase text-zinc-900">Notificacoes</h2>
              </div>
              <button className="min-h-11 rounded-[6px] bg-zinc-900 px-4 text-sm font-black uppercase text-white" onClick={() => setOpen(false)} type="button">
                Fechar
              </button>
            </div>

            {message ? <p className="mt-3 rounded-[8px] bg-[#fff4b8] p-3 text-sm font-black text-zinc-900">{message}</p> : null}

            <div className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <button
                  className={`min-h-16 w-full rounded-[8px] border p-4 text-left active:scale-[0.99] ${
                    notification.lida ? "border-neutral-200 bg-white" : "border-[#FFC300] bg-[#fff8d6]"
                  }`}
                  key={notification.id}
                  onClick={() => markAsRead(notification)}
                  type="button"
                >
                  <span className="block text-sm font-black uppercase text-zinc-900">{notification.titulo}</span>
                  <span className="mt-1 block text-sm font-bold text-neutral-600">{notification.mensagem}</span>
                  <span className="mt-2 block text-xs font-black uppercase text-neutral-400">{formatDate(notification.criado_em)}</span>
                </button>
              ))}

              {!notifications.length ? (
                <p className="rounded-[8px] border border-dashed border-neutral-300 p-6 text-center text-sm font-black uppercase text-neutral-500">
                  Nenhuma notificacao no momento.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed left-3 right-3 top-3 z-[60] rounded-[10px] border border-[#FFC300] bg-zinc-900 p-3 text-sm font-black uppercase text-[#FFC300] shadow-xl md:left-auto md:right-5 md:max-w-sm">
          {toast}
        </div>
      ) : null}
    </>
  );
}

export function NotificationBadge() {
  return <NotificationBell placement="fixed" />;
}
