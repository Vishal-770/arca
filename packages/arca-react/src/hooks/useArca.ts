"use client";

import { useEffect, useState } from "react";
import { useArcaConfig } from "../context";
import type { ArcaSubscription } from "../types";

export const useArca = (planId: string, userId?: string) => {
  const { apiKey, portalUrl } = useArcaConfig();
  const [subscription, setSubscription] = useState<ArcaSubscription>({
    status: "NONE",
    remainingSeconds: 0,
    tierIds: [],
    loading: !!userId,
    error: null,
  });

  useEffect(() => {
    if (!planId || !userId) return;

    const fetchStatus = async () => {
      try {
        setSubscription((prev) => ({ ...prev, loading: true, error: null }));
        const url = new URL(`${portalUrl}/api/sdk/plan/${planId}`);
        url.searchParams.set("userId", userId);

        const res = await fetch(url.toString(), {
          headers: { "x-api-key": apiKey }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch subscription status");

        if (data.subscription) {
          const activeTierId = data.subscription.tierId;
          const activeTierIds = data.subscription.tierIds || (activeTierId ? [activeTierId] : []);

          setSubscription({
            status: data.subscription.status,
            remainingSeconds: data.subscription.remainingSeconds,
            tierId: activeTierId,
            tierIds: activeTierIds,
            loading: false,
            error: null
          });
        } else {
          setSubscription((prev) => ({ ...prev, status: "NONE", tierIds: [], loading: false }));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setSubscription((prev) => ({ ...prev, loading: false, error: message }));
      }
    };

    fetchStatus();
  }, [planId, userId, apiKey, portalUrl]);

  useEffect(() => {
    if (subscription.remainingSeconds <= 0 || subscription.status !== "ACTIVE") return;
    const timer = setInterval(() => {
      setSubscription((prev) => {
        const nextSeconds = Math.max(prev.remainingSeconds - 1, 0);
        return {
          ...prev,
          remainingSeconds: nextSeconds,
          status: nextSeconds <= 0 ? "EXPIRED" : "ACTIVE",
          tierIds: nextSeconds <= 0 ? [] : prev.tierIds
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [subscription.remainingSeconds, subscription.status]);

  return subscription;
};
