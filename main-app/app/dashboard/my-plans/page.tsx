"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  ExternalLink,
  DollarSign,
  Search,
  Copy,
  Check,
  Webhook,
  Repeat,
  Sparkles,
  ArrowUpDown,
  Radio,
} from "lucide-react";

type PlanAnalytics = {
  totalSubscribers: number;
  activeSubscribers: number;
  expiredSubscribers: number;
  grossEarnings: string;
  feeCollected: string;
  netEarnings: string;
  averageRevenuePerSubscriber: string;
  repeatBuyerCount: number;
  repeatBuyerRate: number;
  lastSubscriptionAgeDays: number | null;
  windows: {
    sevenDays: {
      subscriptionCount: number;
      grossVolume: string;
      totalFees: string;
      averageTicket: string;
    };
    thirtyDays: {
      subscriptionCount: number;
      grossVolume: string;
      totalFees: string;
      averageTicket: string;
    };
  };
};

type Tier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type MyPlanRow = {
  id: string;
  planId: string;
  price: string;
  duration: string;
  active: boolean;
  tiers: Tier[];
  metadata: {
    name?: string;
    brand?: { name?: string };
    description?: string;
  } | null;
  analysis: PlanAnalytics;
};

type MyPlansResponse = {
  plans: MyPlanRow[];
  summary: {
    totalPlans: number;
    activePlans: number;
    totalGross: string;
    totalNet: string;
  };
};

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

type SortOption = "revenue" | "subscribers" | "retention" | "velocity";
type StatusFilter = "all" | "active" | "inactive";

const PALETTES = [
  { bg: "bg-emerald-500/15 text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400" },
  { bg: "bg-indigo-500/15 text-indigo-400", badge: "bg-indigo-500/10 text-indigo-400" },
  { bg: "bg-violet-500/15 text-violet-400", badge: "bg-violet-500/10 text-violet-400" },
  { bg: "bg-sky-500/15 text-sky-400", badge: "bg-sky-500/10 text-sky-400" },
  { bg: "bg-amber-500/15 text-amber-400", badge: "bg-amber-500/10 text-amber-400" },
  { bg: "bg-rose-500/15 text-rose-400", badge: "bg-rose-500/10 text-rose-400" },
];

export default function MyPlansPage() {
  const { wallet, sessionUserToken } = useDashboardContext();
  const [data, setData] = useState<MyPlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("revenue");
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);
  const [copiedLinkPlanId, setCopiedLinkPlanId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!wallet?.address || !sessionUserToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/subscription/my-plans", {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }

        const json: MyPlansResponse = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load plans");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [wallet?.address, sessionUserToken]);

  const metrics = useMemo(() => {
    if (!data?.plans) {
      return {
        totalGross: "0",
        totalNet: "0",
        totalSubs: 0,
        totalActiveSubs: 0,
        avgRepeatRate: 0,
        thirtyDayVolume: "0",
        thirtyDaySubs: 0,
      };
    }

    let gross = BigInt(0);
    let net = BigInt(0);
    let totalSubs = 0;
    let totalActiveSubs = 0;
    let repeatRateSum = 0;
    let thirtyDayVol = BigInt(0);
    let thirtyDaySubCount = 0;

    data.plans.forEach((p) => {
      gross += BigInt(p.analysis?.grossEarnings || 0);
      net += BigInt(p.analysis?.netEarnings || 0);
      totalSubs += p.analysis?.totalSubscribers || 0;
      totalActiveSubs += p.analysis?.activeSubscribers || 0;
      repeatRateSum += p.analysis?.repeatBuyerRate || 0;
      thirtyDayVol += BigInt(p.analysis?.windows?.thirtyDays?.grossVolume || 0);
      thirtyDaySubCount += p.analysis?.windows?.thirtyDays?.subscriptionCount || 0;
    });

    const avgRepeat = data.plans.length > 0 ? repeatRateSum / data.plans.length : 0;

    return {
      totalGross: gross.toString(),
      totalNet: net.toString(),
      totalSubs,
      totalActiveSubs,
      avgRepeatRate: avgRepeat,
      thirtyDayVolume: formatUnits(thirtyDayVol, 6),
      thirtyDaySubs: thirtyDaySubCount,
    };
  }, [data]);

  const filteredAndSortedPlans = useMemo(() => {
    if (!data?.plans) return [];

    let plans = [...data.plans];

    if (statusFilter === "active") {
      plans = plans.filter((p) => p.active);
    } else if (statusFilter === "inactive") {
      plans = plans.filter((p) => !p.active);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      plans = plans.filter((p) => {
        const name = p.metadata?.name?.toLowerCase() || "";
        const brand = p.metadata?.brand?.name?.toLowerCase() || "";
        const id = p.planId.toLowerCase();
        const tierLabels = p.tiers?.map((t) => t.label.toLowerCase()).join(" ") || "";
        return name.includes(q) || brand.includes(q) || id.includes(q) || tierLabels.includes(q);
      });
    }

    plans.sort((a, b) => {
      if (sortBy === "revenue") {
        const revA = BigInt(a.analysis?.grossEarnings || 0);
        const revB = BigInt(b.analysis?.grossEarnings || 0);
        return revB > revA ? 1 : revB < revA ? -1 : 0;
      }
      if (sortBy === "subscribers") {
        return (b.analysis?.activeSubscribers || 0) - (a.analysis?.activeSubscribers || 0);
      }
      if (sortBy === "retention") {
        return (b.analysis?.repeatBuyerRate || 0) - (a.analysis?.repeatBuyerRate || 0);
      }
      if (sortBy === "velocity") {
        const volA = BigInt(a.analysis?.windows?.thirtyDays?.grossVolume || 0);
        const volB = BigInt(b.analysis?.windows?.thirtyDays?.grossVolume || 0);
        return volB > volA ? 1 : volB < volA ? -1 : 0;
      }
      return 0;
    });

    return plans;
  }, [data?.plans, statusFilter, searchQuery, sortBy]);

  const handleCopyId = (planId: string) => {
    navigator.clipboard.writeText(planId);
    setCopiedPlanId(planId);
    setTimeout(() => setCopiedPlanId(null), 2000);
  };

  const handleCopyPaywallLink = (planId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/pay/${planId}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkPlanId(planId);
    setTimeout(() => setCopiedLinkPlanId(null), 2000);
  };

  // Loading skeleton (borderless, pure surfaces)
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-muted/20 space-y-3">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] text-center p-8 rounded-2xl bg-destructive/10">
        <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mb-3">
          <Radio size={20} />
        </div>
        <h3 className="text-base font-bold text-foreground">Failed to Load Subscription Plans</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl text-xs h-8 px-4")}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Empty State
  if (!data || data.plans.length === 0) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Subscription Plans
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deploy, monitor, and scale recurring on-chain subscriptions.
            </p>
          </div>
          <Link
            href="/dashboard/plans/create"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 rounded-xl font-semibold h-9 px-4 shadow-sm")}
          >
            <Plus size={15} /> Create Plan
          </Link>
        </div>

        <div className="py-24 px-6 rounded-2xl bg-muted/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground">No subscription plans deployed yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1 mb-6">
            Create automated recurring billing smart contracts with custom intervals, multi-tier pricing, and direct USDC settlement.
          </p>
          <Link
            href="/dashboard/plans/create"
            className={cn(buttonVariants({ size: "default" }), "gap-2 rounded-xl px-5 font-semibold text-xs shadow-sm")}
          >
            <Plus size={15} /> Create Your First Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Subscription Plans
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {data.summary.activePlans} Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Decentralized recurring billing engine with real-time settlement telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/webhooks"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-xl text-xs gap-1.5 h-8.5 px-3 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <Webhook size={13} /> Webhooks
          </Link>
          <Link
            href="/dashboard/plans/create"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-xl text-xs gap-1.5 h-8.5 px-4 font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
            )}
          >
            <Plus size={14} /> New Plan
          </Link>
        </div>
      </div>

      {/* ── Executive Telemetry Strip (Borderless, rich distinct colors) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Gross Volume (Emerald) */}
        <div className="p-4 rounded-2xl bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09] transition-colors flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80">
              Gross Volume
            </span>
            <span className="h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign size={13} />
            </span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-foreground font-mono leading-none">
              ${Number(formatUnits(BigInt(metrics.totalGross), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-400/90 font-medium mt-1.5 flex items-center gap-1">
              <TrendingUp size={12} />
              +${Number(metrics.thirtyDayVolume).toLocaleString()} <span className="text-muted-foreground font-normal">in last 30d</span>
            </p>
          </div>
        </div>

        {/* Net Realized (Sky/Cyan) */}
        <div className="p-4 rounded-2xl bg-sky-500/[0.06] hover:bg-sky-500/[0.09] transition-colors flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400/80">
              Net Settled
            </span>
            <span className="h-6 w-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <TrendingUp size={13} />
            </span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-foreground font-mono leading-none">
              ${Number(formatUnits(BigInt(metrics.totalNet), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Net USDC received to smart wallet
            </p>
          </div>
        </div>

        {/* Subscribers (Indigo) */}
        <div className="p-4 rounded-2xl bg-indigo-500/[0.06] hover:bg-indigo-500/[0.09] transition-colors flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400/80">
              Active Subscribers
            </span>
            <span className="h-6 w-6 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Users size={13} />
            </span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-foreground font-mono leading-none">
              {metrics.totalActiveSubs}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {metrics.totalSubs} lifetime signups across plans
            </p>
          </div>
        </div>

        {/* Retention Rate (Amber) */}
        <div className="p-4 rounded-2xl bg-amber-500/[0.06] hover:bg-amber-500/[0.09] transition-colors flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">
              Renewal Rate
            </span>
            <span className="h-6 w-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Repeat size={13} />
            </span>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-foreground font-mono leading-none">
              {metrics.avgRepeatRate.toFixed(1)}%
            </p>
            <p className="text-[11px] text-amber-400/80 font-medium mt-1.5">
              Avg subscriber retention velocity
            </p>
          </div>
        </div>

      </div>

      {/* ── Filter & Search Toolbar (Borderless, sleek surface) ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-muted/20 p-2 rounded-2xl">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans, brand, plan ID or tiers..."
            className="w-full bg-transparent pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:outline-none focus:bg-muted/40 transition-colors"
          />
        </div>

        {/* Filter Pills & Sort Selector */}
        <div className="flex items-center gap-2 self-end md:self-center">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg font-medium transition-all text-xs",
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({data.plans.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-3 py-1 rounded-lg font-medium transition-all text-xs flex items-center gap-1.5",
                statusFilter === "active"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={cn(
                "px-3 py-1 rounded-lg font-medium transition-all text-xs",
                statusFilter === "inactive"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Paused
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl text-xs text-muted-foreground">
            <ArrowUpDown size={12} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-foreground text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="revenue" className="bg-popover text-foreground">Top Revenue</option>
              <option value="subscribers" className="bg-popover text-foreground">Most Subscribers</option>
              <option value="retention" className="bg-popover text-foreground">Highest Retention</option>
              <option value="velocity" className="bg-popover text-foreground">30d Velocity</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── Plans Data Ledger (High-density, borderless, distinctive colors) ── */}
      {filteredAndSortedPlans.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-muted/15">
          <p className="text-sm font-semibold text-foreground">No subscription plans matched your filter</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Try adjusting your search terms or status view.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl text-xs h-8 px-4")}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredAndSortedPlans.map((plan, index) => {
            const palette = PALETTES[index % PALETTES.length];
            const title =
              plan.metadata?.name ?? plan.metadata?.brand?.name ?? `Plan ${plan.planId.slice(0, 10)}`;
            const brand = plan.metadata?.brand?.name;
            const prices = plan.tiers?.map((t) => BigInt(t.price)) ?? [];
            const minPrice = prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : BigInt(plan.price || "0");
            const maxPrice = prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : BigInt(plan.price || "0");
            const priceDisplay =
              minPrice === maxPrice
                ? `$${formatUnits(minPrice, 6)}`
                : `$${formatUnits(minPrice, 6)} – $${formatUnits(maxPrice, 6)}`;

            const isCopiedId = copiedPlanId === plan.planId;
            const isCopiedLink = copiedLinkPlanId === plan.planId;

            return (
              <div
                key={plan.planId}
                className="group relative rounded-2xl bg-muted/15 hover:bg-muted/30 p-4 lg:p-5 transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Section: Avatar, Title, Brand, ID & Duration */}
                <div className="flex items-start gap-3.5 min-w-[260px] lg:max-w-[320px]">
                  {/* Distinctive Brand Monogram */}
                  <div
                    className={cn(
                      "h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5",
                      palette.bg
                    )}
                  >
                    {title.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/my-plans/${plan.planId}`}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate"
                      >
                        {title}
                      </Link>

                      {/* Status indicator */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          plan.active ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/60 text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            plan.active ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"
                          )}
                        />
                        {plan.active ? "Active" : "Paused"}
                      </span>

                      {/* Duration chip */}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                        {humanDuration(plan.duration)}
                      </span>
                    </div>

                    {/* Brand & Copyable Plan ID */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      {brand && <span className="font-medium text-foreground/70 truncate">{brand} ·</span>}
                      <button
                        onClick={() => handleCopyId(plan.planId)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy Plan ID"
                      >
                        <span>{plan.planId.slice(0, 6)}…{plan.planId.slice(-4)}</span>
                        {isCopiedId ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center Section: Tiers, Pricing & Metrics (High Density) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 lg:py-0 text-xs flex-1 max-w-[620px]">
                  
                  {/* Tiers & Rates */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Pricing
                    </span>
                    <p className="text-xs font-bold text-foreground font-mono mt-0.5">
                      {priceDisplay}
                    </p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {plan.tiers && plan.tiers.length > 0 ? (
                        plan.tiers.slice(0, 2).map((t) => (
                          <span
                            key={t.tierId}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground"
                          >
                            {t.label} (${formatUnits(BigInt(t.price), 6)})
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-muted-foreground">Standard</span>
                      )}
                      {plan.tiers && plan.tiers.length > 2 && (
                        <span className="text-[9px] text-muted-foreground">+{plan.tiers.length - 2} more</span>
                      )}
                    </div>
                  </div>

                  {/* Active Subscribers */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Subscribers
                    </span>
                    <p className="text-xs font-bold text-foreground font-mono mt-0.5">
                      {plan.analysis?.activeSubscribers || 0} active
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {plan.analysis?.totalSubscribers || 0} total
                    </span>
                  </div>

                  {/* 30-Day Velocity */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      30d Velocity
                    </span>
                    <p className="text-xs font-bold text-sky-400 font-mono mt-0.5">
                      ${Number(formatUnits(BigInt(plan.analysis?.windows?.thirtyDays?.grossVolume || 0), 6)).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {plan.analysis?.windows?.thirtyDays?.subscriptionCount || 0} renewals
                    </span>
                  </div>

                  {/* Gross & Net Volume */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Total Volume
                    </span>
                    <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      ${Number(formatUnits(BigInt(plan.analysis?.grossEarnings || 0), 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70">
                      ${Number(formatUnits(BigInt(plan.analysis?.netEarnings || 0), 6)).toLocaleString()} net
                    </span>
                  </div>

                </div>

                {/* Right Section: Actions (Paywall copy, Checkout, Analytics) */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                  <button
                    onClick={() => handleCopyPaywallLink(plan.planId)}
                    className={cn(
                      "rounded-xl text-xs h-8 px-3 gap-1.5 font-semibold transition-all inline-flex items-center justify-center cursor-pointer",
                      isCopiedLink
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-muted/40 hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {isCopiedLink ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {isCopiedLink ? "Copied" : "Copy Paywall"}
                  </button>

                  <Link
                    href={`/pay/${plan.planId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 rounded-xl bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                    title="Open Live Public Paywall"
                  >
                    <ExternalLink size={13} />
                  </Link>

                  <Link
                    href={`/dashboard/my-plans/${plan.planId}`}
                    className="h-8 px-3 rounded-xl bg-foreground text-background font-bold text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                  >
                    Analytics <ArrowUpRight size={13} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
