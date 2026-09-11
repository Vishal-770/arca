"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  AlertCircle,
  XCircle,
  Settings,
  ArrowUpRight,
  DollarSign,
  Repeat,
  Layers,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";
import { cn } from "@/lib/utils";

type NotificationEvent = {
  id: string;
  planId: string;
  blockTimestamp: string;
  transactionHash: string;
  type: "STATUS_CHANGE" | "PLAN_UPDATE";
  active?: boolean;
};

type SubscriptionDetail = {
  id: string;
  status: "ACTIVE" | "EXPIRED";
  subscriptionCount: number;
  totalSpent: string;
  totalFeesPaid: string;
  firstStartTime: string;
  remainingSeconds: number;
  lastStartTime: string;
  lastEndTime: string;
  lastBuyerData: string;
  lastTierId: string;
  tierIds?: string[];
  metadata: {
    name?: string;
    brand?: { name?: string; website?: string };
    features?: { title: string; description: string }[];
    version?: string;
    tiers?: { label: string; features: { title: string; description: string }[] }[];
  } | null;
  plan: {
    id: string;
    duration: string;
    active: boolean;
    subscriptionCount: number;
    tiers?: {
      tierId: string;
      price: string;
      label: string;
    }[];
  };
};

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return "Expired";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
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

function humanDuration(secondsValue: string) {
  const seconds = Number(secondsValue);
  const days = Math.floor(seconds / 86400);
  if (days >= 30) return `${Math.round(days / 30)} Months`;
  if (days >= 1) return `${days} Days`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `${hours} Hours`;
  return `${Math.max(Math.floor(seconds / 60), 1)} Minutes`;
}

export default function SubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const { wallet, sessionUserToken } = useDashboardContext();

  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!params.id || !wallet?.address || !sessionUserToken) return;
      try {
        setLoading(true);
        const [subRes, notifRes] = await Promise.all([
          fetch(`/api/subscription/my-subscriptions/${params.id}?subscriber=${wallet.address}`, {
            cache: "no-store",
          }),
          fetch("/api/subscription/notifications", { cache: "no-store" }),
        ]);

        const subJson = await subRes.json();
        const notifJson = await notifRes.json();

        if (!subRes.ok) throw new Error(subJson.error ?? "Failed to load subscription");

        if (mounted) {
          setData(subJson.subscription);
          const planNotifs = (notifJson.notifications ?? []).filter(
            (n: NotificationEvent) => n.planId === params.id
          );
          setNotifications(planNotifs);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [params.id, wallet?.address, sessionUserToken]);

  const handleCopyPlanId = () => {
    if (!data?.plan.id) return;
    navigator.clipboard.writeText(data.plan.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPayload = () => {
    if (!data?.lastBuyerData) return;
    navigator.clipboard.writeText(data.lastBuyerData);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

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
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] p-8 text-center gap-4 rounded-xl bg-destructive/10">
        <div className="h-12 w-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{error ?? "Subscription Missing"}</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {error || "This subscription could not be located on the network or is still syncing."}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="h-8.5 rounded-lg">
          <Link href="/dashboard/subscriptions">Return to Subscriptions</Link>
        </Button>
      </div>
    );
  }

  const title = data.metadata?.name ?? `Subscription ${data.plan.id.slice(0, 8)}`;
  const isActive = data.status === "ACTIVE";
  const brand = data.metadata?.brand;

  const activeTiers =
    data.plan.tiers?.filter(
      (t) => data.tierIds?.includes(t.tierId) || t.tierId === data.lastTierId
    ) ?? [];
  const tierLabel = activeTiers.length > 0 ? activeTiers.map((t) => t.label).join(", ") : "Standard";
  const durationNum = Number(data.plan.duration) || 1;
  const progressPercent = isActive
    ? Math.min((data.remainingSeconds / durationNum) * 100, 100)
    : 0;

  const isV11 = data.metadata?.version === "1.1";
  let perks: { title: string; description: string }[] = [];
  if (isV11) {
    activeTiers.forEach((tier) => {
      const tierMeta = data.metadata?.tiers?.find((t) => t.label === tier.label);
      if (tierMeta?.features) {
        perks.push(...tierMeta.features);
      }
    });
    const seen = new Set();
    perks = perks.filter((p) => {
      if (seen.has(p.title)) return false;
      seen.add(p.title);
      return true;
    });
  } else {
    perks = data.metadata?.features ?? [];
  }

  const renderNotifications = () => (
    <div className="space-y-0">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Activity size={18} className="text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50">No updates found for this subscription</p>
        </div>
      ) : (
        notifications.map((notif) => {
          const isActiveNotif = notif.type === "STATUS_CHANGE" ? notif.active : true;
          let icon = <Settings className="h-3.5 w-3.5 text-muted-foreground" />;
          let label = "Plan Update";
          let desc = "Plan rules or pricing updated.";

          if (notif.type === "STATUS_CHANGE") {
            if (isActiveNotif) {
              icon = <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
              label = "Activated";
              desc = "Subscription is now active.";
            } else {
              icon = <XCircle className="h-3.5 w-3.5 text-muted-foreground" />;
              label = "Deactivated";
              desc = "Subscription has ended.";
            }
          }

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
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 mt-1">
                  <a
                    href={`https://testnet.arcscan.app/tx/${notif.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono hover:text-primary transition-colors flex items-center gap-0.5"
                  >
                    Tx: {notif.transactionHash.slice(0, 6)}…{notif.transactionHash.slice(-4)}
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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Breadcrumb & Top Bar ───────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1.5">
          <Link
            href="/dashboard/subscriptions"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Subscriptions</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className="text-xs font-mono px-2 py-0.5"
            >
              {isActive ? "Active" : "Expired"}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <button
              onClick={handleCopyPlanId}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] hover:text-foreground transition-colors cursor-pointer"
              title="Click to copy plan ID"
            >
              <span>{data.plan.id.slice(0, 8)}…{data.plan.id.slice(-4)}</span>
              {copiedId ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
            </button>
            <span>·</span>
            <span>{tierLabel} tier</span>
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
                  Updates and status history for this plan.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-2">
                {renderNotifications()}
              </div>
              <div className="px-6 py-4 border-t border-border/10">
                <a
                  href={`https://testnet.arcscan.app/address/${SUBSCRIPTION_GATEWAY_ADDRESS}`}
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
            <Link href={`/dashboard/marketplace/${data.plan.id}`}>
              Marketplace Plan <ExternalLink className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Remaining Time */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Access Remaining
            </span>
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums leading-none">
              {isActive ? formatCountdown(data.remainingSeconds) : "0h 0m"}
            </p>
            {isActive && (
              <div className="mt-2.5 h-1 w-full max-w-[200px] bg-primary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              {isActive ? `${Math.round(progressPercent)}% of cycle remaining` : "Subscription has ended"}
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
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums leading-none">
              ${Number(formatUnits(data.totalSpent || 0, 6)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Across {data.subscriptionCount} cycle{data.subscriptionCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Billing Cycle Duration */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Billing Interval
            </span>
            <Repeat className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {humanDuration(data.plan.duration)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Per renewal period
            </p>
          </div>
        </div>

        {/* Protocol Fees Paid */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Network Fees
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums leading-none">
              ${Number(formatUnits(data.totalFeesPaid || 0, 6)).toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              USDC protocol fees
            </p>
          </div>
        </div>
      </div>

      {/* ── Content Breakdown ──────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Side: Plan Features */}
        <div className="rounded-xl border border-border/30 bg-muted/10 p-5 sm:p-6 flex flex-col gap-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Plan Features & Entitlements</h3>
            <p className="text-xs text-muted-foreground">Features included in your current tier.</p>
          </div>

          <div className="border-t border-border/10 pt-4 flex-1">
            {perks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Standard access tier features apply.</p>
            ) : (
              <div className="space-y-4">
                {perks.map((feature, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={11} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Technical parameters & metadata */}
        <div className="rounded-xl border border-border/30 bg-muted/10 p-5 sm:p-6 flex flex-col gap-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Plan Details & Network State</h3>
            <p className="text-xs text-muted-foreground">On-chain parameters for this subscription.</p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-border/10 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Provider</p>
              <p className="text-xs font-semibold text-foreground truncate">
                {brand?.name || "Independent Provider"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Plan Users</p>
              <p className="text-xs font-semibold text-foreground">{data.plan.subscriptionCount} subscribers</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Activated</p>
              <p className="text-xs font-semibold text-foreground">
                {new Date(Number(data.firstStartTime) * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Cycle Start</p>
              <p className="text-xs font-semibold text-foreground">
                {data.lastStartTime && Number(data.lastStartTime) > 0
                  ? new Date(Number(data.lastStartTime) * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {data.lastBuyerData && (
            <div className="space-y-2 pt-4 border-t border-border/10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Transaction Payload
                </p>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="size-3 text-primary" />
                      <span className="text-primary font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-muted/20 border border-border/20 rounded-lg font-mono text-[10px] break-all leading-normal text-muted-foreground">
                {data.lastBuyerData}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

