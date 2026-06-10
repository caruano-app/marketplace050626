"use client";

import { useEffect } from "react";
import { useAffiliateStore, type AffiliateTracking } from "@/lib/affiliate/affiliate-store";

type AffiliateTrackerProps = {
  affiliate: Omit<AffiliateTracking, "trackedAt"> | null;
};

export function AffiliateTracker({ affiliate }: AffiliateTrackerProps) {
  const setAffiliate = useAffiliateStore((state) => state.setAffiliate);

  useEffect(() => {
    if (!affiliate) return;

    setAffiliate({
      ...affiliate,
      trackedAt: new Date().toISOString(),
    });
  }, [affiliate, setAffiliate]);

  return null;
}
