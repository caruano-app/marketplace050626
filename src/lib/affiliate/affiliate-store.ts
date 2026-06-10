"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AffiliateTracking = {
  afiliadoId: string;
  usuarioId: string;
  codigoAfiliado: string;
  nomeAfiliado: string;
  commissionPercent: number;
  trackedAt: string;
};

type AffiliateState = {
  affiliate: AffiliateTracking | null;
  setAffiliate: (affiliate: AffiliateTracking) => void;
  clearAffiliate: () => void;
};

const cookieName = "caruano_affiliate";
const maxAge = 60 * 60 * 24 * 7;

function writeAffiliateCookie(affiliate: AffiliateTracking | null) {
  if (typeof document === "undefined") return;

  if (!affiliate) {
    document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(affiliate))}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export const useAffiliateStore = create<AffiliateState>()(
  persist(
    (set) => ({
      affiliate: null,
      setAffiliate: (affiliate) => {
        writeAffiliateCookie(affiliate);
        set({ affiliate });
      },
      clearAffiliate: () => {
        writeAffiliateCookie(null);
        set({ affiliate: null });
      },
    }),
    {
      name: "caruano-affiliate",
    },
  ),
);
