import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

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
interface ArcaProviderProps {
    apiKey: string;
    children: React.ReactNode;
}
/**
 * ArcaProvider
 * Wraps your application to provide Arca configuration to all components and hooks.
 */
declare const ArcaProvider: ({ apiKey, children }: ArcaProviderProps) => react_jsx_runtime.JSX.Element;
interface ArcaSubscription {
    status: "ACTIVE" | "EXPIRED" | "NONE";
    remainingSeconds: number;
    tierId?: string;
    tierIds: string[];
    loading: boolean;
    error: string | null;
}
/**
 * useArca
 * The primary hook to check a user's subscription status, active tier IDs, and remaining time.
 */
declare const useArca: (planId: string, userId?: string) => ArcaSubscription;
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
/**
 * ArcaPricingTable
 * Professional, premium, and fully customizable pricing table.
 */
declare const ArcaPricingTable: ({ planId, userId, redirectUrl, appearance, className, style, hideBranding, recommendedTierId, customLabels, classNames, renderHeader, renderFooter, renderTierButton, }: ArcaPricingTableProps) => react_jsx_runtime.JSX.Element;
/**
 * useArcaPerks
 * Fetches and resolves active plan tier details (tier name, features, expiry date) subscribed by the user.
 * Returns null if the user has no active subscriptions, or is expired.
 */
declare const useArcaPerks: (planId: string, userId?: string) => {
    perks: SubscribedTierDetail[] | null | undefined;
    loading: boolean;
    error: string | null;
};

export { type ArcaAppearance, type ArcaClassNames, type ArcaConfig, type ArcaLabels, ArcaPricingTable, type ArcaPricingTableProps, ArcaProvider, type ArcaProviderProps, type ArcaSubscription, type Feature, type Plan, type SubscribedTierDetail, type Tier, useArca, useArcaPerks };
