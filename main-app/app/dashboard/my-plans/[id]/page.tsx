"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { encodeFunctionData } from "viem";

import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  Repeat,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditPlanDialog } from "./EditPlanDialog";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type BuyerRow = {
  id: string;
  subscriber: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  lastStartTime: string;
  lastEndTime: string;
  buyerData: string;
  remainingSeconds: number;
  updatedAt: string;
};

type ChartPoint = {
  date: string;
  revenue: string;
  subscriptions: number;
};

type PlanResponse = {
  plan: {
    planId: string;
    price: string;
    duration: string;
    active: boolean;
    subscriptionCount: number;
    totalGrossVolume: string;
    totalFeesCollected: string;
    lastSubscriptionAt: string | null;
    seller: { id: string };
    tiers?: {
      tierId: string;
      price: string;
      label: string;
    }[];
    metadata: {
      version?: string;
      name?: string;
      brand?: { name?: string; website?: string };
      features?: { title: string; description: string }[];
      tiers?: {
        tierId?: string;
        label: string;
        price: string;
        features: { title: string; description: string }[];
      }[];
    } | null;
  };
  isOwnerView: boolean;
  buyers: BuyerRow[];
  chartData: ChartPoint[];
  metrics: {
    activeBuyerCount: number;
    expiredBuyerCount: number;
    totalBuyers: number;
  };
  analytics: {
    grossEarnings: string;
    feeCollected: string;
    netEarnings: string;
    avgRevenuePerSubscriber: string;
    repeatBuyerCount: number;
    repeatBuyerRate: number;
    activeRate: number;
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
};

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(Math.floor(seconds / 60), 1)}m`;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function MyPlanDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet } = useDashboardContext();

  const [data, setData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"embed" | "hook">("embed");
  const [copiedId, setCopiedId] = useState(false);

  const { executeTransaction } = useCircleSDK();

  const effectiveFeePct = useMemo(() => {
    if (!data) return 0.5;
    const gross = Number(data.analytics.grossEarnings);
    if (gross <= 0) return 0.5;
    return (Number(data.analytics.feeCollected) / gross) * 100;
  }, [data?.analytics.grossEarnings, data?.analytics.feeCollected]);

  const handleCopyPlanId = () => {
    if (!data?.plan?.planId) return;
    navigator.clipboard.writeText(data.plan.planId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!data?.plan || !wallet?.address) return;
    setToggling(true);
    setError(null);

    try {
      const active = !data.plan.active;

      const subscriptionGatewayAbi = [
        {
          name: "setPlanStatus",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "active", type: "bool" },
          ],
          outputs: [],
        },
      ] as const;

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "setPlanStatus",
        args: [data.plan.planId as `0x${string}`, active],
      });

      await executeTransaction(
        [
          {
            to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
            data: txData,
          },
        ],
        false,
        "Arc_Testnet"
      );

      setData({ ...data, plan: { ...data.plan, active } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setToggling(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!params.id || !wallet?.address) return;
      try {
        setLoading(true);
        const viewerParam = `&viewer=${wallet.address}`;
        const response = await fetch(
          `/api/subscription/plan/${params.id}?first=500${viewerParam}`,
          { cache: "no-store" }
        );
        const json = (await response.json()) as PlanResponse & { error?: string };
        if (!response.ok) throw new Error(json.error ?? "Failed to load plan");
        if (mounted) setData(json);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [params.id, wallet?.address]);

  const filteredBuyers = useMemo(() => {
    if (!data?.buyers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.buyers;
    return data.buyers.filter(
      (b) =>
        b.subscriber.toLowerCase().includes(q) ||
        b.buyerData.toLowerCase().includes(q)
    );
  }, [data?.buyers, search]);

  const chartData = useMemo(() => {
    if (!data?.chartData) return [];
    return data.chartData.map((d) => ({
      ...d,
      revenueNum: Number(formatUnits(d.revenue, 6)),
    }));
  }, [data?.chartData]);

  const embedMarkdown = useMemo(() => {
    const planId = data?.plan?.planId ?? "0x…";
    return `
Install the package and add the pricing table component for Plan ID \`${planId}\`.

\`\`\`bash
npm install arca-react
\`\`\`

\`\`\`tsx
import { ArcaProvider, ArcaPricingTable } from 'arca-react';

function PricingPage() {
  return (
    <ArcaProvider apiKey="arca_your_api_key">
      <ArcaPricingTable planId="${planId}" userId="user_unique_id" />
    </ArcaProvider>
  );
}
\`\`\`
`;
  }, [data?.plan?.planId]);

  const hookMarkdown = useMemo(() => {
    const planId = data?.plan?.planId ?? "0x…";
    return `
Check active subscription status and feature permissions in your React components.

\`\`\`tsx
import { useArca, useArcaPerks } from 'arca-react';

function ProtectedPage() {
  const { status, remainingSeconds, loading } = useArca("${planId}", "user_unique_id");
  const { perks } = useArcaPerks("${planId}", "user_unique_id");

  if (loading) return <div>Checking subscription...</div>;
  if (status !== 'ACTIVE') return <div>Please subscribe to continue</div>;

  return <div>Welcome! Access granted.</div>;
}
\`\`\`
`;
  }, [data?.plan?.planId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="space-y-2 pb-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded" />
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
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] p-8 text-center gap-4 rounded-xl bg-destructive/10">
        <div className="h-12 w-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{error ?? "Plan Not Found"}</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Unable to locate plan details or synchronize with the network.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/my-plans">Back to My Plans</Link>
        </Button>
      </div>
    );
  }

  const { plan, analytics, metrics: planMetrics } = data;
  const brand = plan.metadata?.brand;
  const title = plan.metadata?.name ?? brand?.name ?? `Plan ${plan.planId.slice(0, 10)}`;
  const isV11 = plan.metadata?.version === "1.1";

  return (
    <div className="w-full flex flex-col gap-6">

      {/* ── Breadcrumb & Top Bar ───────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1.5">
          <Link
            href="/dashboard/my-plans"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Plans</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
            <Badge
              variant={plan.active ? "secondary" : "outline"}
              className="text-xs font-mono px-2 py-0.5"
            >
              {plan.active ? "Active" : "Paused"}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <button
              onClick={handleCopyPlanId}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] hover:text-foreground transition-colors cursor-pointer"
              title="Click to copy plan ID"
            >
              <span>{truncateAddress(plan.planId)}</span>
              {copiedId ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
            </button>
            <span>·</span>
            <span>{humanDuration(plan.duration)} cycle</span>
            {brand?.name && (
              <>
                <span>·</span>
                <span className="font-medium text-foreground/80">{brand.name}</span>
              </>
            )}
            {brand?.website && (
              <>
                <span>·</span>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {brand.website.replace(/^https?:\/\//, "")}
                  <ExternalLink size={10} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 text-xs px-3 gap-1.5 font-medium rounded-lg"
          >
            <Link href={`/pay/${plan.planId}`} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span>Preview Checkout</span>
            </Link>
          </Button>

          <EditPlanDialog
            planId={plan.planId}
            durationSeconds={Number(plan.duration)}
            metadata={plan.metadata}
            onSuccess={() => window.location.reload()}
          />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8.5 px-3 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <a
              href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              <span>On-Chain</span>
              <ArrowUpRight size={11} />
            </a>
          </Button>

          <Button
            onClick={() => setConfirmStatusOpen(true)}
            disabled={toggling || !wallet}
            variant={plan.active ? "outline" : "default"}
            size="sm"
            className="h-8.5 px-3 text-xs font-medium rounded-lg cursor-pointer"
          >
            {toggling ? "Updating…" : plan.active ? "Pause Plan" : "Resume Plan"}
          </Button>
        </div>
      </div>

      {/* ── Confirmation Alert Dialog Before Status Change Write Operation ── */}
      <Dialog open={confirmStatusOpen} onOpenChange={setConfirmStatusOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {plan.active ? "Pause Subscription Plan?" : "Resume Subscription Plan?"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              {plan.active
                ? "Are you sure you want to pause this plan? Existing active subscribers will keep access until their current billing period ends, but new subscribers will not be able to checkout."
                : "Are you sure you want to resume this plan? The checkout page will immediately accept new subscriptions."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmStatusOpen(false)}
              disabled={toggling}
            >
              Cancel
            </Button>
            <Button
              variant={plan.active ? "destructive" : "default"}
              size="sm"
              disabled={toggling}
              onClick={async () => {
                await handleToggleStatus();
                setConfirmStatusOpen(false);
              }}
            >
              {toggling ? "Processing…" : plan.active ? "Yes, Pause Plan" : "Yes, Resume Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              ${Number(formatUnits(plan.totalGrossVolume, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {plan.subscriptionCount} subscriptions created
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
              ${Number(formatUnits(analytics.netEarnings, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              After {effectiveFeePct.toFixed(1)}% protocol fee
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
              {planMetrics.activeBuyerCount}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {analytics.activeRate.toFixed(1)}% active renewal rate
            </p>
          </div>
        </div>

        {/* Average Order Ticket */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Average Order
            </span>
            <Repeat className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              ${Number(formatUnits(analytics.avgRevenuePerSubscriber, 6)).toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Average revenue per subscriber
            </p>
          </div>
        </div>

      </div>

      {/* ── Pricing Tiers ──────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Pricing Tiers</h2>
            <p className="text-xs text-muted-foreground">Available plans and feature offerings.</p>
          </div>
          <Layers size={14} className="text-muted-foreground/40" />
        </div>

        {isV11 && plan.metadata?.tiers && plan.metadata.tiers.length > 0 ? (
          <div className={cn(
            "grid gap-3.5 w-full",
            plan.metadata.tiers.length === 1
              ? "grid-cols-1 max-w-md"
              : plan.metadata.tiers.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3"
          )}>
            {plan.metadata.tiers.map((tier, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-xl bg-muted/20 hover:bg-muted/30 p-5 border border-border/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                      Tier {i + 1}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-muted-foreground">
                      USDC / cycle
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{tier.label}</h3>
                    <p className="text-3xl font-extrabold font-mono text-foreground mt-1.5">
                      ${tier.price}
                      <span className="text-xs font-normal text-muted-foreground ml-1">USDC</span>
                    </p>
                  </div>
                </div>

                {tier.features && tier.features.length > 0 && (
                  <div className="mt-5 pt-3 border-t border-border/20 space-y-2">
                    {tier.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{f.title}</p>
                          {f.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
            <Layers size={14} />
            <span>Single tier plan: ${formatUnits(plan.price || "0", 6)} USDC per {humanDuration(plan.duration)}</span>
          </div>
        )}
      </div>

      {/* ── Revenue Chart & Provider/Loyalty ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl bg-card/40 border border-border/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Revenue Over Time</h2>
              <p className="text-xs text-muted-foreground">Daily subscription sales performance.</p>
            </div>
            <TrendingUp size={14} className="text-muted-foreground/40" />
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.split("-").slice(1).join("/")}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenueNum"
                  stroke="var(--primary)"
                  fill="url(#colorRev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider & Loyalty Sidebar */}
        <div className="rounded-xl bg-card/40 border border-border/30 p-5 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Plan Provider</h2>
              <ShieldCheck size={14} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{brand?.name || "Self-Hosted Creator"}</p>
              {brand?.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
                >
                  <span>{brand.website}</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <div className="pt-3 border-t border-border/20 text-xs">
              <span className="text-muted-foreground">Settlement Protocol Fee</span>
              <p className="text-sm font-mono font-semibold text-foreground mt-0.5">
                {effectiveFeePct.toFixed(1)}% ({(effectiveFeePct * 100).toFixed(0)} bps)
              </p>
            </div>
          </div>

          {/* Loyalty & Retention */}
          <div className="space-y-3 pt-4 border-t border-border/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Customer Loyalty</span>
              <span className="text-xs font-mono font-bold text-primary">
                {analytics.repeatBuyerRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(analytics.repeatBuyerRate, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {analytics.repeatBuyerCount} returning subscribers have renewed across multiple cycles.
            </p>
          </div>
        </div>

      </div>

      {/* ── Subscribers Table ──────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Subscribers</h2>
            <p className="text-xs text-muted-foreground">Customer subscriptions and payment history.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8.5 text-xs bg-muted/20 border-border/40 rounded-lg"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[700px]">
            <TableHeader>
              <TableRow className="border-b border-border/20 hover:bg-transparent">
                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">
                  Subscriber
                </TableHead>
                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Status
                </TableHead>
                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Cycles
                </TableHead>
                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Total Paid
                </TableHead>
                <TableHead className="py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 text-right pr-1">
                  Customer Data
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuyers.length === 0 ? (
                <TableRow className="border-b border-border/10">
                  <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBuyers.map((buyer) => (
                  <TableRow
                    key={buyer.id}
                    className="border-b border-border/10 hover:bg-muted/30 transition-colors"
                  >
                    {/* Subscriber Address */}
                    <TableCell className="py-3.5 pl-1 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                          {buyer.subscriber.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-mono font-semibold text-foreground">
                            {truncateAddress(buyer.subscriber)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {buyer.subscriber.slice(0, 16)}…
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 align-middle">
                      <Badge
                        variant={buyer.status === "ACTIVE" ? "secondary" : "outline"}
                        className="text-[10px] h-4.5 px-1.5 font-medium"
                      >
                        {buyer.status === "ACTIVE" ? "Active" : "Expired"}
                      </Badge>
                    </TableCell>

                    {/* Cycles */}
                    <TableCell className="py-3.5 text-xs font-mono font-medium text-foreground align-middle">
                      {buyer.subscriptionCount}
                    </TableCell>

                    {/* Total Paid */}
                    <TableCell className="py-3.5 text-xs font-mono font-bold text-foreground align-middle">
                      ${Number(formatUnits(buyer.totalSpent, 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Customer Data */}
                    <TableCell className="py-3.5 text-right pr-1 align-middle">
                      <span className="inline-block max-w-[160px] truncate font-mono text-[11px] text-muted-foreground">
                        {buyer.buyerData || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Developer SDK Integration ──────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-border/20">
        <div>
          <h2 className="text-sm font-bold text-foreground">Developer Integration</h2>
          <p className="text-xs text-muted-foreground">
            Embed pricing or check subscription status in your frontend.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2 text-xs">
            <button
              onClick={() => setActiveTab("embed")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs",
                activeTab === "embed"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              1. Embed Pricing Table
            </button>
            <button
              onClick={() => setActiveTab("hook")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs",
                activeTab === "hook"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              2. Check Permissions (Hook)
            </button>
          </div>

          <div className="bg-card text-card-foreground rounded-xl border border-border/30 p-5">
            <MarkdownRenderer content={activeTab === "embed" ? embedMarkdown : hookMarkdown} />
          </div>
        </div>
      </div>

    </div>
  );
}
