"use client";

export { ArcaProvider } from "./context";
export { ArcaPricingTable } from "./components/ArcaPricingTable";
export { useArca } from "./hooks/useArca";
export { useArcaPerks } from "./hooks/useArcaPerks";
export { ArcaClient, createArcaClient } from "./client";

export type {
  ArcaAppearance,
  ArcaClassNames,
  ArcaClientOptions,
  ArcaConfig,
  ArcaLabels,
  ArcaSubscription,
  ArcaSubscriptionResult,
  Feature,
  Plan,
  SubscribedTierDetail,
  Tier
} from "./types";

export type { ArcaProviderProps } from "./context";
export type { ArcaPricingTableProps } from "./components/ArcaPricingTable";
