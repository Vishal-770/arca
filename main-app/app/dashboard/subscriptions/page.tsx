"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Settings,
  ShieldCheck,
  DollarSign,
  Repeat,
  Search,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SubscriptionRow = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  canRenew: boolean;
  lastTierId?: string;
  tierIds?: string[];
  plan: {
    id: string;
    duration: string;
    tiers: { tierId: string; price: string; label: string }[];
  };
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
  } | null;
};

type NotificationEvent = {
  id: string;
  planId: string;
  blockTimestamp: string;
  transactionHash: string;
  type: "STATUS_CHANGE" | "PLAN_UPDATE";
  active?: boolean;
  price?: string;
  duration?: string;
  ipfsHash?: string;
};

type SortOption = "remaining" | "spent" | "cycles" | "name";
type StatusFilter = "all" | "active" | "expired";

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return "Expired";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

function timeAgo(timestamp: string) {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MySubscriptionsPage() {
  const { wallet, sessionUserToken } = useDashboardContext();
  const [items, setItems] = useState<SubscriptionRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("remaining");
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
        const [subRes, notifRes] = await Promise.all([
          fetch("/api/subscription/my-subscriptions", { cache: "no-store" }),
          fetch("/api/subscription/notifications", { cache: "no-store" }),
        ]);
        const subJson = await subRes.json();
        const notifJson = await notifRes.json();
        if (!subRes.ok) throw new Error(subJson.error ?? "Failed to load subscriptions");
        if (mounted) {
          setItems(subJson.subscriptions ?? []);
          setNotifications(notifJson.notifications ?? []);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [wallet?.address, sessionUserToken]);

  const handleCopyId = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(planId);
    setCopiedPlanId(planId);
    setTimeout(() => setCopiedPlanId(null), 2000);
  };

  // Metrics summary
  const summary = useMemo(() => {
    const totalPlans = items.length;
    const activePlans = items.filter((i) => i.status === "ACTIVE").length;
    const expiredPlans = items.filter((i) => i.status === "EXPIRED").length;
    const totalSpentBigInt = items.reduce((s, i) => s + BigInt(i.totalSpent || 0), BigInt(0));
    const totalCycles = items.reduce((s, i) => s + i.subscriptionCount, 0);

    return {
      totalPlans,
      activePlans,
      expiredPlans,
      totalSpentFormatted: Number(formatUnits(totalSpentBigInt, 6)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalCycles,
    };
  }, [items]);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((i) => i.status === "ACTIVE");
    } else if (statusFilter === "expired") {
      result = result.filter((i) => i.status === "EXPIRED");
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const name = (i.metadata?.name ?? "").toLowerCase();
        const brand = (i.metadata?.brand?.name ?? "").toLowerCase();
        const planId = (i.plan.id ?? "").toLowerCase();
        return name.includes(q) || brand.includes(q) || planId.includes(q);
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "remaining") {
        if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
        if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
        return a.remainingSeconds - b.remainingSeconds;
      }
      if (sortBy === "spent") {
        const spentA = BigInt(a.totalSpent || 0);
        const spentB = BigInt(b.totalSpent || 0);
        return spentB > spentA ? 1 : spentB < spentA ? -1 : 0;
      }
      if (sortBy === "cycles") {
        return b.subscriptionCount - a.subscriptionCount;
      }
      if (sortBy === "name") {
        const nameA = a.metadata?.name ?? a.metadata?.brand?.name ?? a.plan.id;
        const nameB = b.metadata?.name ?? b.metadata?.brand?.name ?? b.plan.id;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return result;
  }, [items, statusFilter, searchQuery, sortBy]);

  const renderNotifications = () => (
    <div className="space-y-0">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Activity size={18} className="text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50">No notifications yet</p>
        </div>
      ) : (
        notifications.map((notif) => {
          const isActive = notif.type === "STATUS_CHANGE" ? notif.active : true;
          let icon = <Settings className="h-3.5 w-3.5 text-muted-foreground" />;
          let label = "Plan Update";
          let desc = "Plan rules or pricing updated.";

          if (notif.type === "STATUS_CHANGE") {
            if (isActive) {
              icon = <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
              label = "Activated";
              desc = "Your subscription is now active.";
            } else {
              icon = <XCircle className="h-3.5 w-3.5 text-muted-foreground" />;
              label = "Deactivated";
              desc = "Your subscription has ended.";
            }
          }

          const matchedPlan = items.find(
            (i) => i.plan.id.toLowerCase() === notif.planId.toLowerCase()
          );
          const planName = matchedPlan?.metadata?.name ?? matchedPlan?.metadata?.brand?.name;

          return (
            <div
              key={notif.id}
              className="flex items-start gap-3 py-4 border-b border-border/10 last:border-0"
            >
              <div className="h-6 w-6 rounded-full bg-muted/40 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground/60">
                {icon}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-foreground">{label}</span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {timeAgo(notif.blockTimestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                  <span className="font-mono truncate max-w-[120px]">
                    {planName ? `${planName} (${notif.planId.slice(0, 6)})` : notif.planId.slice(0, 10)}
                  </span>
                  <span>·</span>
                  <a
                    href={`https://testnet.arcscan.app/tx/${notif.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono hover:text-primary transition-colors flex items-center gap-0.5"
                  >
                    {notif.transactionHash.slice(0, 6)}…{notif.transactionHash.slice(-4)}
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8.5 w-24 rounded-lg" />
            <Skeleton className="h-8.5 w-28 rounded-lg" />
          </div>
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

        <div className="space-y-4 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-border/10">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] text-center p-8 rounded-xl bg-destructive/10">
        <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mb-3">
          <Activity size={20} />
        </div>
        <h3 className="text-base font-bold text-foreground">Failed to load subscriptions</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-8.5 rounded-lg">
          Try Again
        </Button>
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
              My Subscriptions
            </h1>
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
              {summary.activePlans} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track your active plans, billing cycles, and remaining access time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/50"
              >
                <Activity className="size-3.5 text-muted-foreground" />
                <span>Updates</span>
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-mono leading-none">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-sm border-l border-border/20 p-0 flex flex-col">
              <SheetHeader className="px-6 py-5 border-b border-border/10">
                <SheetTitle className="text-sm font-semibold">Notifications & Updates</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Real-time updates about plan status and protocol changes.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-2">
                {renderNotifications()}
              </div>
              <div className="px-6 py-4 border-t border-border/10">
                <a
                  href="https://testnet.arcscan.app"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <ShieldCheck className="h-3 w-3" /> Secured by Arc Network
                </a>
              </div>
            </SheetContent>
          </Sheet>

          <Button asChild size="sm" className="h-8.5 px-4 text-xs font-semibold rounded-lg">
            <Link href="/dashboard/marketplace">
              Marketplace <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Subscriptions */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Active Subscriptions
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {summary.activePlans}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Currently accessible
            </p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Spent
            </span>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              ${summary.totalSpentFormatted}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              USDC across all plans
            </p>
          </div>
        </div>

        {/* Subscribed Plans */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Plans
            </span>
            <Layers className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {summary.totalPlans}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Subscribed services
            </p>
          </div>
        </div>

        {/* Billing Cycles */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Billing Cycles
            </span>
            <Repeat className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {summary.totalCycles}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Total renewals paid
            </p>
          </div>
        </div>
      </div>

      {/* ── Subscriptions Content ─────────────────────────────── */}
      {items.length === 0 ? (
        <div className="py-20 px-6 rounded-xl bg-muted/20 border border-border/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Layers className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No active subscriptions</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6">
            You haven&apos;t subscribed to any services yet. Explore the marketplace to discover verified plans.
          </p>
          <Button asChild size="sm" className="h-8.5 px-4 text-xs font-semibold rounded-lg">
            <Link href="/dashboard/marketplace">
              Browse Marketplace <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search subscriptions or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8.5 text-xs bg-muted/20 border-border/40 focus:border-foreground/40 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Status Segmented Buttons */}
              <div className="flex items-center rounded-lg bg-muted/30 p-0.5 border border-border/20">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                    statusFilter === "all"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All ({summary.totalPlans})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                    statusFilter === "active"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Active ({summary.activePlans})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("expired")}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                    statusFilter === "expired"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Expired ({summary.expiredPlans})
                </button>
              </div>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="w-[160px] h-8.5 text-xs bg-muted/20 border-border/40 rounded-lg">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/30">
                  <SelectItem value="remaining">Expiring Soonest</SelectItem>
                  <SelectItem value="spent">Total Spent</SelectItem>
                  <SelectItem value="cycles">Billing Cycles</SelectItem>
                  <SelectItem value="name">Service Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table or Filter Empty State */}
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center rounded-xl border border-border/20 bg-muted/10 p-6 flex flex-col items-center justify-center">
              <Search className="size-6 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No subscriptions found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No active or expired subscriptions match your current filter criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4 h-8 text-xs gap-1.5 rounded-lg"
              >
                <RotateCcw size={12} /> Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/40 border-b border-border/20">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pl-4">
                        Service / Plan
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[120px]">
                        Status
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[160px]">
                        Access Remaining
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[130px]">
                        Total Spent
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[100px]">
                        Cycles
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pr-4 text-right w-[110px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const title =
                        item.metadata?.name ??
                        item.metadata?.brand?.name ??
                        `Plan ${item.plan.id.slice(0, 8)}`;
                      const brandName = item.metadata?.brand?.name;
                      const website = item.metadata?.brand?.website;
                      const durationNum = Number(item.plan.duration) || 1;
                      const progress =
                        item.status === "ACTIVE"
                          ? Math.min((item.remainingSeconds / durationNum) * 100, 100)
                          : 0;

                      const activeTiers =
                        item.plan.tiers?.filter(
                          (t) => item.tierIds?.includes(t.tierId) || t.tierId === item.lastTierId
                        ) ?? [];
                      const tierLabel =
                        activeTiers.length > 0
                          ? activeTiers.map((t) => t.label).join(", ")
                          : "Standard";

                      const initials = title
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "PL";

                      return (
                        <TableRow
                          key={item.id}
                          className="hover:bg-muted/30 border-b border-border/10 transition-colors"
                        >
                          {/* Service Info */}
                          <TableCell className="py-3.5 pl-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center font-bold text-xs text-foreground/80 shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0 max-w-[280px] sm:max-w-none">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/dashboard/subscriptions/${item.plan.id}`}
                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                                  >
                                    {title}
                                  </Link>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mt-0.5">
                                  <span className="font-medium text-foreground/70">{tierLabel}</span>
                                  <span>·</span>
                                  <button
                                    onClick={(e) => handleCopyId(e, item.plan.id)}
                                    className="font-mono text-[11px] text-muted-foreground/80 hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                                    title="Copy Plan ID"
                                  >
                                    <span>{item.plan.id.slice(0, 8)}…{item.plan.id.slice(-4)}</span>
                                    {copiedPlanId === item.plan.id ? (
                                      <Check className="size-2.5 text-primary" />
                                    ) : (
                                      <Copy className="size-2.5 opacity-60" />
                                    )}
                                  </button>
                                  {website && (
                                    <>
                                      <span>·</span>
                                      <a
                                        href={website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-primary transition-colors inline-flex items-center gap-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {website.replace(/^https?:\/\//, "")}
                                        <ExternalLink size={9} />
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-3.5 align-middle">
                            {item.status === "ACTIVE" ? (
                              <Badge variant="secondary" className="gap-1.5 font-medium px-2 py-0.5">
                                <span className="size-1.5 rounded-full bg-foreground inline-block" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground border-border/40 px-2 py-0.5">
                                <span className="size-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                                Expired
                              </Badge>
                            )}
                          </TableCell>

                          {/* Remaining Time */}
                          <TableCell className="py-3.5 align-middle">
                            <div className="space-y-1.5">
                              <span className="text-xs font-mono font-medium text-foreground tabular-nums">
                                {formatCountdown(item.remainingSeconds)}
                              </span>
                              {item.status === "ACTIVE" && (
                                <div className="h-1 w-24 bg-muted/40 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Total Spent */}
                          <TableCell className="py-3.5 align-middle font-mono tabular-nums text-xs">
                            <span className="font-semibold text-foreground">
                              ${Number(formatUnits(item.totalSpent || 0, 6)).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">USDC</span>
                          </TableCell>

                          {/* Cycles */}
                          <TableCell className="py-3.5 align-middle font-mono tabular-nums text-xs text-foreground/80">
                            {item.subscriptionCount} {item.subscriptionCount === 1 ? "renewal" : "renewals"}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3.5 pr-4 align-middle text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 px-3 text-xs font-medium gap-1 rounded-lg border-border/40 hover:bg-muted/50"
                            >
                              <Link href={`/dashboard/subscriptions/${item.plan.id}`}>
                                <span>Manage</span>
                                <ArrowUpRight size={13} className="opacity-70" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

