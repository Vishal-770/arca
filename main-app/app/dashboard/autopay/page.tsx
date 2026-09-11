"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Search,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Tier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type SubscriptionRow = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  remainingSeconds: number;
  canRenew: boolean;
  lastTierId?: string;
  lastBuyerData?: string;
  tierIds?: string[];
  lastEndTime: string;
  plan: {
    id: string;
    duration: string;
    ipfsHash: string;
    tiers: Tier[];
  };
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
  } | null;
};

type AutoPaySetting = {
  id: string;
  subscriberAddress: string;
  planId: string;
  enabled: boolean;
  tierId: string;
  buyerData: string;
  signature: string;
  nonce: number;
  deadline: number;
  currentExpiresAt: number;
  sessionPublicKey?: string;
  sessionPrivateKey?: string;
  maxCycles?: number;
  executedCycles?: number;
};

type StatusFilter = "all" | "active" | "inactive";

export default function AutoPayPage() {
  const { wallet, sessionUserToken } = useDashboardContext();

  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [autopaySettings, setAutopaySettings] = useState<Record<string, AutoPaySetting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);

  const walletAddress = wallet?.address;
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!walletAddress || !sessionUserToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [subRes, autoRes] = await Promise.all([
          fetch("/api/subscription/my-subscriptions", { cache: "no-store" }),
          fetch("/api/autopay", { cache: "no-store" }),
        ]);

        if (!subRes.ok) {
          const subJson = await subRes.json();
          throw new Error(subJson.error ?? "Failed to load subscriptions");
        }

        const subData = await subRes.json();
        const autoData = await autoRes.json();

        if (mounted) {
          const allSubs = subData.subscriptions ?? [];
          setSubscriptions(allSubs);

          const mappedSettings: Record<string, AutoPaySetting> = {};
          (autoData.settings ?? []).forEach((s: AutoPaySetting) => {
            mappedSettings[s.planId.toLowerCase()] = s;
          });
          setAutopaySettings(mappedSettings);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      mounted = false;
    };
  }, [walletAddress, sessionUserToken]);

  const handleCopyId = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(planId);
    setCopiedPlanId(planId);
    setTimeout(() => setCopiedPlanId(null), 2000);
  };

  // Metrics summary
  const summary = useMemo(() => {
    const totalSubs = subscriptions.length;
    const activeAutopay = Object.values(autopaySettings).filter((s) => s.enabled).length;
    const inactiveAutopay = totalSubs - activeAutopay;

    return {
      totalSubs,
      activeAutopay,
      inactiveAutopay,
    };
  }, [subscriptions, autopaySettings]);

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const planIdLower = sub.plan.id.toLowerCase();
      const setting = autopaySettings[planIdLower];
      const isEnabled = !!setting?.enabled;

      // Status filter
      if (statusFilter === "active" && !isEnabled) return false;
      if (statusFilter === "inactive" && isEnabled) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (sub.metadata?.name ?? "").toLowerCase();
        const brand = (sub.metadata?.brand?.name ?? "").toLowerCase();
        const planId = (sub.plan.id ?? "").toLowerCase();
        return name.includes(q) || brand.includes(q) || planId.includes(q);
      }

      return true;
    });
  }, [subscriptions, autopaySettings, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <Skeleton className="h-8.5 w-32 rounded-lg" />
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

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] text-center p-8 rounded-xl bg-destructive/10">
        <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mb-3">
          <AlertCircle size={20} />
        </div>
        <h3 className="text-base font-bold text-foreground">Failed to connect to Auto-Pay</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-8.5 rounded-lg">
          Retry Connection
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
              Auto-Pay
            </h1>
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
              {summary.activeAutopay} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically renew your subscriptions without manual approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button asChild variant="outline" size="sm" className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/50">
            <Link href="/dashboard/subscriptions">
              Subscriptions <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Auto-Pay */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Auto-Pay Active
            </span>
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {summary.activeAutopay}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Automated renewals configured
            </p>
          </div>
        </div>

        {/* Not Set Up */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Manual Renewal
            </span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {summary.inactiveAutopay}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Require manual payment
            </p>
          </div>
        </div>

        {/* Total Plans */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Subscribed Plans
            </span>
            <Layers className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {summary.totalSubs}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Eligible for auto-renewal
            </p>
          </div>
        </div>

        {/* Network Fees */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Relayer Fees
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              Free
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Sponsored transactions
            </p>
          </div>
        </div>
      </div>

      {/* ── Content Section ───────────────────────────────────── */}
      {subscriptions.length === 0 ? (
        <div className="py-20 px-6 rounded-xl bg-muted/20 border border-border/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No subscriptions found</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6">
            Auto-Pay requires an active subscription. Explore the marketplace to subscribe to plans.
          </p>
          <Button asChild size="sm" className="h-8.5 px-4 text-xs font-semibold rounded-lg">
            <Link href="/dashboard/marketplace">
              Explore Marketplace <ArrowRight className="ml-1.5 size-3.5" />
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
                placeholder="Search plans or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8.5 text-xs bg-muted/20 border-border/40 focus:border-foreground/40 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
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
                  All ({summary.totalSubs})
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
                  Active ({summary.activeAutopay})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("inactive")}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                    statusFilter === "inactive"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Not Set Up ({summary.inactiveAutopay})
                </button>
              </div>
            </div>
          </div>

          {/* Table or Filter Empty State */}
          {filteredSubscriptions.length === 0 ? (
            <div className="py-14 text-center rounded-xl border border-border/20 bg-muted/10 p-6 flex flex-col items-center justify-center">
              <Search className="size-6 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No matching plans found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No subscription plans match your current search and filter settings.
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
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[150px]">
                        Auto-Pay Status
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[180px]">
                        Next Renewal
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[160px]">
                        Renewal Tier
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pr-4 text-right w-[120px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => {
                      const planIdLower = sub.plan.id.toLowerCase();
                      const setting = autopaySettings[planIdLower];
                      const isEnabled = !!setting?.enabled;

                      const planName =
                        sub.metadata?.name ??
                        sub.metadata?.brand?.name ??
                        `Plan ${sub.plan.id.slice(0, 8)}`;
                      const website = sub.metadata?.brand?.website;

                      const initials =
                        planName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "PL";

                      const activeTiers = sub.plan.tiers?.filter((t) => t.active) ?? [];
                      const selectedTier =
                        setting?.tierId
                          ? activeTiers.find((t) => t.tierId === setting.tierId)
                          : activeTiers[0];
                      const tierLabel = selectedTier?.label ?? "Standard";
                      const tierPrice = selectedTier?.price
                        ? `$${Number(formatUnits(selectedTier.price, 6)).toLocaleString()} USDC`
                        : "—";

                      return (
                        <TableRow
                          key={sub.id}
                          className="hover:bg-muted/30 border-b border-border/10 transition-colors"
                        >
                          {/* Service info */}
                          <TableCell className="py-3.5 pl-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center font-bold text-xs text-foreground/80 shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0 max-w-[280px] sm:max-w-none">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/dashboard/autopay/${sub.id}`}
                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                                  >
                                    {planName}
                                  </Link>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mt-0.5">
                                  <button
                                    onClick={(e) => handleCopyId(e, sub.plan.id)}
                                    className="font-mono text-[11px] text-muted-foreground/80 hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                                    title="Copy Plan ID"
                                  >
                                    <span>{sub.plan.id.slice(0, 8)}…{sub.plan.id.slice(-4)}</span>
                                    {copiedPlanId === sub.plan.id ? (
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

                          {/* Auto-Pay Status */}
                          <TableCell className="py-3.5 align-middle">
                            {isEnabled ? (
                              <Badge variant="secondary" className="gap-1.5 font-medium px-2 py-0.5">
                                <span className="size-1.5 rounded-full bg-foreground inline-block" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground border-border/40 px-2 py-0.5">
                                <span className="size-1.5 rounded-full bg-muted-foreground/40 inline-block" />
                                Not Set Up
                              </Badge>
                            )}
                          </TableCell>

                          {/* Next Renewal */}
                          <TableCell className="py-3.5 align-middle">
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
                              <Clock size={12} className="text-muted-foreground shrink-0" />
                              <span>
                                {sub.lastEndTime && Number(sub.lastEndTime) > 0
                                  ? new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Renewal Tier */}
                          <TableCell className="py-3.5 align-middle">
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium text-foreground">{tierLabel}</p>
                              <p className="text-[11px] font-mono text-muted-foreground">{tierPrice}</p>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3.5 pr-4 align-middle text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 px-3 text-xs font-medium gap-1 rounded-lg border-border/40 hover:bg-muted/50"
                            >
                              <Link href={`/dashboard/autopay/${sub.id}`}>
                                <span>Configure</span>
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

