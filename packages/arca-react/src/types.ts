import type React from "react";

export interface Feature {
  title: string;
  description: string;
}

export interface Tier {
  id: string;
  price: string;
  label: string;
  features: Feature[];
}

export interface Plan {
  id: string;
  name: string;
  duration: string;
  brand?: { name?: string; website?: string };
  tiers: Tier[];
}

export interface SubscribedTierDetail {
  tierId: string;
  tierName: string;
  features: Feature[];
  expiryDate: Date;
}

export interface ArcaAppearance {
  theme?: "light" | "dark";
  variables?: {
    colorPrimary?: string;
    colorSecondary?: string;
    colorError?: string;
    borderRadius?: string;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    cardPadding?: string;
    gap?: string;
  };
  elements?: {
    container?: React.CSSProperties;
    card?: React.CSSProperties;
    button?: React.CSSProperties;
    price?: React.CSSProperties;
    tierLabel?: React.CSSProperties;
  };
}

export interface ArcaConfig {
  apiKey: string;
}

export interface ArcaClientOptions {
  baseUrl?: string;
}

export interface ArcaSubscriptionResult {
  status: "ACTIVE" | "EXPIRED" | "NONE";
  remainingSeconds: number;
  tierId?: string;
  tierIds: string[];
}

export interface ArcaLabels {
  activeSubscription?: string;
  upgrade?: string;
  downgrade?: string;
  changePlan?: string;
  getTier?: string;
  selectPlanDescription?: string;
  subscriptionActiveHeader?: string;
}

export interface ArcaClassNames {
  container?: string;
  grid?: string;
  card?: string;
  badge?: string;
  tierLabel?: string;
  priceContainer?: string;
  priceAmount?: string;
  priceMuted?: string;
  featuresList?: string;
  featureItem?: string;
  featureTitle?: string;
  featureDescription?: string;
  button?: string;
}

export interface ArcaSubscription {
  status: "ACTIVE" | "EXPIRED" | "NONE";
  remainingSeconds: number;
  tierId?: string;
  tierIds: string[];
  loading: boolean;
  error: string | null;
}
