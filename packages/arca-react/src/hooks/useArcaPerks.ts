"use client";

import { useEffect, useMemo, useState } from "react";
import { useArcaConfig } from "../context";
import { useArca } from "./useArca";
import type { Plan, SubscribedTierDetail } from "../types";

export const useArcaPerks = (planId: string, userId?: string) => {
  const { apiKey, portalUrl } = useArcaConfig();
  const subscription = useArca(planId, userId);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    if (!planId) return;
    const fetchPlan = async () => {
      try {
        setLoadingPlan(true);
        const url = `${portalUrl}/api/sdk/plan/${planId}`;
        const res = await fetch(url, {
          headers: { "x-api-key": apiKey }
        });
        const data = await res.json();
        if (res.ok) {
          setPlan(data.plan);
        }
      } catch (err) {
        console.error("Failed to fetch plan in useArcaPerks", err);
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlan();
  }, [planId, apiKey, portalUrl]);

  const perks = useMemo((): SubscribedTierDetail[] | null | undefined => {
    if (subscription.loading || loadingPlan) return undefined;
    if (subscription.status !== "ACTIVE" || subscription.tierIds.length === 0 || !plan) {
      return null;
    }

    const expiryTime = new Date(Date.now() + subscription.remainingSeconds * 1000);
    const activeTiers = plan.tiers.filter((tier) => subscription.tierIds.includes(tier.id));

    return activeTiers.map((tier) => ({
      tierId: tier.id,
      tierName: tier.label,
      features: tier.features,
      expiryDate: expiryTime,
    }));
  }, [subscription.loading, subscription.status, subscription.tierIds, subscription.remainingSeconds, plan, loadingPlan]);

  return {
    perks,
    loading: subscription.loading || loadingPlan,
    error: subscription.error
  };
};
