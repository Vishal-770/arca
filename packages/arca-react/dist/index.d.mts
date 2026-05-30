import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

interface ArcaProviderProps {
    apiKey: string;
    children: React.ReactNode;
}
declare const ArcaProvider: ({ apiKey, children }: ArcaProviderProps) => react_jsx_runtime.JSX.Element;

interface Feature {
    title: string;
    description: string;
}
interface Tier {
    id: string;
    price: string;
    label: string;
    features: Feature[];
}
interface Plan {
    id: string;
    name: string;
    duration: string;
    brand?: {
        name?: string;
        website?: string;
    };
    tiers: Tier[];
}
interface SubscribedTierDetail {
    tierId: string;
    tierName: string;
    features: Feature[];
    expiryDate: Date;
}
interface ArcaAppearance {
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
interface ArcaConfig {
    apiKey: string;
}
interface ArcaClientOptions {
    baseUrl?: string;
}
interface ArcaSubscriptionResult {
    status: "ACTIVE" | "EXPIRED" | "NONE";
    remainingSeconds: number;
    tierId?: string;
    tierIds: string[];
}
interface ArcaLabels {
    activeSubscription?: string;
    upgrade?: string;
    downgrade?: string;
    changePlan?: string;
    getTier?: string;
    selectPlanDescription?: string;
    subscriptionActiveHeader?: string;
}
interface ArcaClassNames {
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
interface ArcaSubscription {
    status: "ACTIVE" | "EXPIRED" | "NONE";
    remainingSeconds: number;
    tierId?: string;
    tierIds: string[];
    loading: boolean;
    error: string | null;
}

interface ArcaPricingTableProps {
    planId: string;
    userId?: string;
    redirectUrl?: string;
    appearance?: ArcaAppearance;
    className?: string;
    style?: React.CSSProperties;
    hideBranding?: boolean;
    recommendedTierId?: string;
    customLabels?: ArcaLabels;
    classNames?: ArcaClassNames;
    renderHeader?: (plan: Plan, subscription: ArcaSubscription) => React.ReactNode;
    renderFooter?: () => React.ReactNode;
    renderTierButton?: (tier: Tier, state: {
        isActive: boolean;
        isCurrent: boolean;
        isDisabled: boolean;
        isUpgrade: boolean;
        isDowngrade: boolean;
        label: string;
    }, handleSelect: () => void) => React.ReactNode;
}
declare const ArcaPricingTable: ({ planId, userId, redirectUrl, appearance, className, style, hideBranding, recommendedTierId, customLabels, classNames, renderHeader, renderFooter, renderTierButton, }: ArcaPricingTableProps) => react_jsx_runtime.JSX.Element;

declare const useArca: (planId: string, userId?: string) => ArcaSubscription;

declare const useArcaPerks: (planId: string, userId?: string) => {
    perks: SubscribedTierDetail[] | null | undefined;
    loading: boolean;
    error: string | null;
};

declare class ArcaClient {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string, options?: ArcaClientOptions);
    getSubscriptionStatus(planId: string, userId: string): Promise<ArcaSubscriptionResult>;
}
declare function createArcaClient(apiKey: string, options?: ArcaClientOptions): ArcaClient;

export { type ArcaAppearance, type ArcaClassNames, ArcaClient, type ArcaClientOptions, type ArcaConfig, type ArcaLabels, ArcaPricingTable, type ArcaPricingTableProps, ArcaProvider, type ArcaProviderProps, type ArcaSubscription, type ArcaSubscriptionResult, type Feature, type Plan, type SubscribedTierDetail, type Tier, createArcaClient, useArca, useArcaPerks };
