"use client";

import { CartHeaderButton } from "@/components/cart/cart-header-button";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function IconButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="grid h-11 w-11 place-items-center text-xs font-black uppercase leading-none text-neutral-950" aria-label={label}>
      {icon}
    </button>
  );
}

export function HeaderActions() {
  const [accountLabel, setAccountLabel] = useState("Conta");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      const label = data.user?.user_metadata?.nome_completo || data.user?.email?.split("@")[0];
      if (label) {
        setAccountLabel(String(label).slice(0, 18));
      }
    });
  }, []);

  return (
    <div className="flex items-center gap-3">
      <IconButton label="Favoritos" icon="Fav" />
      <CartHeaderButton />
      <a className="grid h-11 w-11 place-items-center text-xs font-black uppercase leading-none text-neutral-950" href="/login" aria-label="Minha conta">
        User
      </a>
      <a className="max-w-[96px] text-[12px] font-black uppercase leading-none text-neutral-950" href="/login">
        {accountLabel === "Conta" ? (
          <>
            Entre
            <br />
            Cadastrar
          </>
        ) : (
          accountLabel
        )}
      </a>
    </div>
  );
}
