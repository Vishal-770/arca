"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Layers,
  Activity,
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

  // Loading skeleton
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
            <div key={i} className="p-5 rounded-xl bg-muted/30 space-y-3">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-muted/20 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
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
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] text-center p-8 rounded-xl bg-destructive/10">
        <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mb-3">
          <Activity size={20} />
        </div>
        <h3 className="text-base font-bold text-foreground">Failed to Load Subscription Plans</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
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
          <Button asChild size="sm">
            <Link href="/dashboard/plans/create">
              <Plus className="mr-1.5 size-4" /> Create Plan
            </Link>
          </Button>
        </div>

        <div className="py-24 px-6 rounded-xl bg-muted/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No subscription plans deployed yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1 mb-6">
            Create automated recurring billing smart contracts with custom intervals, multi-tier pricing, and direct USDC settlement.
          </p>
          <Button asChild>
            <Link href="/dashboard/plans/create">
              <Plus className="mr-2 size-4" /> Create Your First Plan
            </Link>
          </Button>
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
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Subscription Plans
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {data.summary.activePlans} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Decentralized recurring billing engine with real-time settlement telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs h-8">
            <Link href="/dashboard/webhooks">
              <Webhook className="mr-1.5 size-3.5 text-muted-foreground" /> Webhooks
            </Link>
          </Button>
          <Button size="sm" asChild className="text-xs h-8">
            <Link href="/dashboard/plans/create">
              <Plus className="mr-1.5 size-3.5" /> New Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Executive Stat Cards (Using Global CSS Tokens) ─────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Gross Volume */}
        <div className="rounded-xl px-5 py-4 flex flex-col gap-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Gross Volume
            </p>
            <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          </div>
          <p className="text-2xl font-black font-mono leading-none text-foreground">
            ${Number(formatUnits(BigInt(metrics.totalGross), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span>${Number(metrics.thirtyDayVolume).toLocaleString()} in last 30d</span>
          </p>
        </div>

        {/* Net Settled Revenue */}
        <div className="rounded-xl px-5 py-4 flex flex-col gap-2 bg-primary/10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Net Revenue
            </p>
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary" />
          </div>
          <p className="text-2xl font-black font-mono leading-none text-foreground">
            ${Number(formatUnits(BigInt(metrics.totalNet), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Directly settled to smart wallet
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="rounded-xl px-5 py-4 flex flex-col gap-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Subscribers
            </p>
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          </div>
          <p className="text-2xl font-black font-mono leading-none text-foreground">
            {metrics.totalActiveSubs}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {metrics.totalSubs} total signups across plans
          </p>
        </div>

        {/* Renewal & Retention Rate */}
        <div className="rounded-xl px-5 py-4 flex flex-col gap-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Retention Rate
            </p>
            <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          </div>
          <p className="text-2xl font-black font-mono leading-none text-foreground">
            {metrics.avgRepeatRate.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            Average recurring cycle renewals
          </p>
        </div>

      </div>

      {/* ── Toolbar: Shadcn Input + Filter Tabs + Shadcn Select ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search plans, brand, plan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/40 focus:border-primary/50"
          />
        </div>

        {/* Status Filter & Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({data.plans.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                statusFilter === "active"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                statusFilter === "inactive"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Paused
            </button>
          </div>

          {/* Shadcn Select for Sorting */}
          <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v as SortOption); }}>
            <SelectTrigger className="w-[170px] h-9 bg-muted/20 border-border/40 rounded-xl text-xs font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/60 rounded-xl shadow-lg">
              <SelectItem value="revenue" className="text-xs">Top Revenue</SelectItem>
              <SelectItem value="subscribers" className="text-xs">Most Subscribers</SelectItem>
              <SelectItem value="retention" className="text-xs">Highest Retention</SelectItem>
              <SelectItem value="velocity" className="text-xs">30d Velocity</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>

      {/* ── Plans Data Table (Shadcn Table) ────────────────────── */}
      {filteredAndSortedPlans.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-muted/20">
          <p className="text-sm font-semibold text-foreground">No subscription plans matched your query</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Try clearing filters or search terms.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-card/40 border border-border/30">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">Plan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">Pricing &amp; Tiers</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">Subscribers</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">30d Volume</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3">Total Gross</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right py-3 pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPlans.map((plan) => {
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
                  <TableRow
                    key={plan.planId}
                    className="border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    {/* Plan Identity */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                          {title.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/my-plans/${plan.planId}`}
                              className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate"
                            >
                              {title}
                            </Link>
                            <Badge
                              variant={plan.active ? "secondary" : "outline"}
                              className="text-[10px] h-4.5 px-1.5"
                            >
                              {plan.active ? "Active" : "Paused"}
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {humanDuration(plan.duration)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            {brand && <span className="font-medium text-foreground/70 truncate">{brand} ·</span>}
                            <button
                              onClick={() => handleCopyId(plan.planId)}
                              className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Copy Plan ID"
                            >
                              <span>{plan.planId.slice(0, 6)}…{plan.planId.slice(-4)}</span>
                              {isCopiedId ? <Check className="size-2.5 text-primary" /> : <Copy className="size-2.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Pricing & Tiers */}
                    <TableCell className="py-3.5">
                      <div>
                        <p className="text-xs font-bold font-mono text-foreground">{priceDisplay}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {plan.tiers && plan.tiers.length > 0 ? (
                            plan.tiers.slice(0, 2).map((t) => (
                              <Badge key={t.tierId} variant="outline" className="text-[9px] h-4 px-1 py-0 font-normal">
                                {t.label} (${formatUnits(BigInt(t.price), 6)})
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Standard</span>
                          )}
                          {plan.tiers && plan.tiers.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">+{plan.tiers.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Subscribers */}
                    <TableCell className="py-3.5">
                      <div>
                        <p className="text-xs font-mono font-bold text-foreground">
                          {plan.analysis?.activeSubscribers || 0}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {plan.analysis?.totalSubscribers || 0} total
                        </p>
                      </div>
                    </TableCell>

                    {/* 30d Velocity */}
                    <TableCell className="py-3.5">
                      <div>
                        <p className="text-xs font-mono font-bold text-foreground">
                          ${Number(formatUnits(BigInt(plan.analysis?.windows?.thirtyDays?.grossVolume || 0), 6)).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {plan.analysis?.windows?.thirtyDays?.subscriptionCount || 0} renewals
                        </p>
                      </div>
                    </TableCell>

                    {/* Total Gross / Net */}
                    <TableCell className="py-3.5">
                      <div>
                        <p className="text-xs font-mono font-bold text-foreground">
                          ${Number(formatUnits(BigInt(plan.analysis?.grossEarnings || 0), 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          ${Number(formatUnits(BigInt(plan.analysis?.netEarnings || 0), 6)).toLocaleString()} net
                        </p>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyPaywallLink(plan.planId)}
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          {isCopiedLink ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                          {isCopiedLink ? "Copied" : "Paywall"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Open Live Public Paywall"
                        >
                          <Link href={`/pay/${plan.planId}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          asChild
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          <Link href={`/dashboard/my-plans/${plan.planId}`}>
                            Analytics <ArrowUpRight className="size-3" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

    </div>
  );
}
