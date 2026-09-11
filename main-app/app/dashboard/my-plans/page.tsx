"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

type SortOption = "revenue" | "subscribers" | "renewal" | "recent_sales";
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
      if (sortBy === "renewal") {
        return (b.analysis?.repeatBuyerRate || 0) - (a.analysis?.repeatBuyerRate || 0);
      }
      if (sortBy === "recent_sales") {
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl bg-muted/30 space-y-3">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-muted/20 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/10 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 rounded hidden md:block" />
              <Skeleton className="h-4 w-16 rounded hidden md:block" />
              <Skeleton className="h-4 w-20 rounded hidden md:block" />
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
        <h3 className="text-base font-bold text-foreground">Failed to load plans</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty State
  if (!data || data.plans.length === 0) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Subscription Plans
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create and manage recurring plans for your customers.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/plans/create">
              <Plus className="mr-1.5 size-4" /> Create Plan
            </Link>
          </Button>
        </div>

        <div className="py-20 px-6 rounded-xl bg-muted/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No plans created yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6">
            Create subscription plans with custom prices and billing cycles.
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
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
              {data.summary.activePlans} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your plans, track subscribers, and review revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button variant="outline" size="sm" asChild className="text-xs h-8.5 px-3">
            <Link href="/dashboard/webhooks">
              <Webhook className="mr-1.5 size-3.5 text-muted-foreground" /> Webhooks
            </Link>
          </Button>
          <Button size="sm" asChild className="text-xs h-8.5 px-4 font-semibold">
            <Link href="/dashboard/plans/create">
              <Plus className="mr-1.5 size-3.5" /> New Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Sales */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Sales
            </span>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              ${Number(formatUnits(BigInt(metrics.totalGross), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-2">
              <TrendingUp className="h-3 w-3 text-primary shrink-0" />
              <span>${Number(metrics.thirtyDayVolume).toLocaleString()} in last 30 days</span>
            </p>
          </div>
        </div>

        {/* Net Earnings */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Net Earnings
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              ${Number(formatUnits(BigInt(metrics.totalNet), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              After protocol fees
            </p>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Active Subscribers
            </span>
            <Users className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {metrics.totalActiveSubs}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {metrics.totalSubs} all-time
            </p>
          </div>
        </div>

        {/* Renewal Rate */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Renewal Rate
            </span>
            <Repeat className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {metrics.avgRepeatRate.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Average repeat renewals
            </p>
          </div>
        </div>

      </div>

      {/* ── Toolbar: Search + Filter Tabs + Sort Dropdown ──────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search plans, brands, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/40 focus:border-primary/50"
          />
        </div>

        {/* Filters & Sort Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
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
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
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
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
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
              <SelectItem value="revenue" className="text-xs">Highest Revenue</SelectItem>
              <SelectItem value="subscribers" className="text-xs">Most Subscribers</SelectItem>
              <SelectItem value="renewal" className="text-xs">Best Renewal Rate</SelectItem>
              <SelectItem value="recent_sales" className="text-xs">Most Sales (30d)</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>

      {/* ── Plans Presentation (Desktop Table + Mobile Cards) ───── */}
      {filteredAndSortedPlans.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-xl bg-muted/20">
          <p className="text-sm font-semibold text-foreground">No plans matched your filter</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Try clearing your search or status filter.</p>
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
        <>
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block rounded-xl overflow-hidden bg-card/40 border border-border/30">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="w-[28%] text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5 pl-4">Plan</TableHead>
                    <TableHead className="w-[22%] text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Pricing</TableHead>
                    <TableHead className="w-[12%] text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Subscribers</TableHead>
                    <TableHead className="w-[14%] text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Last 30 Days</TableHead>
                    <TableHead className="w-[12%] text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-3.5">Total Sales</TableHead>
                    <TableHead className="w-[12%] text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right py-3.5 pr-4">Actions</TableHead>
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

                    return (
                      <TableRow
                        key={plan.planId}
                        className="border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        {/* Plan Identity */}
                        <TableCell className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                              {title.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/dashboard/my-plans/${plan.planId}`}
                                  className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate max-w-[180px]"
                                >
                                  {title}
                                </Link>
                                <Badge
                                  variant={plan.active ? "secondary" : "outline"}
                                  className="text-[10px] h-4.5 px-1.5 font-medium"
                                >
                                  {plan.active ? "Active" : "Paused"}
                                </Badge>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {humanDuration(plan.duration)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                {brand && <span className="font-medium text-foreground/70 truncate max-w-[120px]">{brand} ·</span>}
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
                        <TableCell className="py-4">
                          <div>
                            <p className="text-xs font-bold font-mono text-foreground">{priceDisplay}</p>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {plan.tiers && plan.tiers.length > 0 ? (
                                plan.tiers.slice(0, 2).map((t) => (
                                  <Badge key={t.tierId} variant="outline" className="text-[9px] h-4 px-1.5 py-0 font-normal">
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
                        <TableCell className="py-4">
                          <div>
                            <p className="text-xs font-mono font-bold text-foreground">
                              {plan.analysis?.activeSubscribers || 0}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {plan.analysis?.totalSubscribers || 0} all-time
                            </p>
                          </div>
                        </TableCell>

                        {/* 30-Day Sales */}
                        <TableCell className="py-4">
                          <div>
                            <p className="text-xs font-mono font-bold text-foreground">
                              ${Number(formatUnits(BigInt(plan.analysis?.windows?.thirtyDays?.grossVolume || 0), 6)).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {plan.analysis?.windows?.thirtyDays?.subscriptionCount || 0} renewals
                            </p>
                          </div>
                        </TableCell>

                        {/* Total Sales */}
                        <TableCell className="py-4">
                          <div>
                            <p className="text-xs font-mono font-bold text-foreground">
                              ${Number(formatUnits(BigInt(plan.analysis?.grossEarnings || 0), 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              ${Number(formatUnits(BigInt(plan.analysis?.netEarnings || 0), 6)).toLocaleString()} net
                            </p>
                          </div>
                        </TableCell>

                        {/* Actions: Clean single Checkout button + Analytics */}
                        <TableCell className="py-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-7 text-xs px-2.5 gap-1.5 font-medium"
                            >
                              <Link href={`/pay/${plan.planId}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-3 text-muted-foreground" />
                                <span>Preview Checkout</span>
                              </Link>
                            </Button>

                            <Button
                              size="sm"
                              asChild
                              className="h-7 text-xs px-2.5 gap-1 font-semibold"
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
          </div>

          {/* Mobile Card View (hidden on md and up) */}
          <div className="md:hidden flex flex-col gap-3">
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

              return (
                <div
                  key={plan.planId}
                  className="rounded-xl bg-card/40 border border-border/30 p-4 flex flex-col gap-3.5"
                >
                  {/* Top: Identity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                        {title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/my-plans/${plan.planId}`}
                          className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          {brand && <span className="font-medium text-foreground/70 truncate">{brand} ·</span>}
                          <button
                            onClick={() => handleCopyId(plan.planId)}
                            className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <span>{plan.planId.slice(0, 6)}…{plan.planId.slice(-4)}</span>
                            {isCopiedId ? <Check className="size-2.5 text-primary" /> : <Copy className="size-2.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={plan.active ? "secondary" : "outline"}
                        className="text-[10px] h-4.5 px-1.5 font-medium"
                      >
                        {plan.active ? "Active" : "Paused"}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                        {humanDuration(plan.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Middle: 3-column key stats */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/20 text-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">
                        Price
                      </span>
                      <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                        {priceDisplay}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">
                        Subscribers
                      </span>
                      <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                        {plan.analysis?.activeSubscribers || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">
                        Sales
                      </span>
                      <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                        ${Number(formatUnits(BigInt(plan.analysis?.grossEarnings || 0), 6)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  {/* Tiers Preview */}
                  {plan.tiers && plan.tiers.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {plan.tiers.map((t) => (
                        <Badge key={t.tierId} variant="outline" className="text-[9px] h-4 px-1.5 py-0 font-normal">
                          {t.label} (${formatUnits(BigInt(t.price), 6)})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Bottom: Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/10">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 h-8 text-xs gap-1.5 font-medium"
                    >
                      <Link href={`/pay/${plan.planId}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3 text-muted-foreground" />
                        <span>Preview Checkout</span>
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      asChild
                      className="flex-1 h-8 text-xs gap-1 font-semibold"
                    >
                      <Link href={`/dashboard/my-plans/${plan.planId}`}>
                        Analytics <ArrowUpRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
