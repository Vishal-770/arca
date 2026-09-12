"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatUnits, Wallet } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { useCircleSDK } from "@/context/CircleSDKContext";
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Play,
  XCircle,
  Zap,
  Repeat,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { toCircleSmartAccount } from "@circle-fin/modular-wallets-core";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { createPublicClient, http, type Client } from "viem";
import { arcTestnet } from "@/lib/bridge_config";
import { SUBSCRIPTION_GATEWAY_ADDRESS } from "@/lib/subscription";

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

export default function AutoPayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { wallet, sessionUserToken } = useDashboardContext();
  const { session } = useCircleSDK();

  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [setting, setSetting] = useState<AutoPaySetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [selectedCycles, setSelectedCycles] = useState<number>(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [copiedPlanId, setCopiedPlanId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Load data for single subscription
  useEffect(() => {
    let mounted = true;
    const loadSubData = async () => {
      if (!wallet?.address || !sessionUserToken || !id) {
        setLoading(false);
        return;
      }
      try {
        const [subRes, autoRes] = await Promise.all([
          fetch("/api/subscription/my-subscriptions", { cache: "no-store" }),
          fetch("/api/autopay", { cache: "no-store" }),
        ]);

        if (!subRes.ok) {
          const subJson = await subRes.json();
          throw new Error(subJson.error ?? "Failed to load subscription details");
        }

        const subData = await subRes.json();
        const autoData = await autoRes.json();

        if (mounted) {
          const allSubs: SubscriptionRow[] = subData.subscriptions ?? [];
          const foundSub = allSubs.find(
            (s) =>
              s.id.toLowerCase() === id.toLowerCase() ||
              s.plan?.id?.toLowerCase() === id.toLowerCase()
          );

          if (!foundSub) {
            throw new Error("Subscription not found");
          }

          setSub(foundSub);

          const planIdLower = foundSub.plan.id.toLowerCase();
          const foundSetting = (autoData.settings ?? []).find(
            (s: AutoPaySetting) => s.planId.toLowerCase() === planIdLower
          );

          if (foundSetting) {
            setSetting(foundSetting);
            setSelectedTierId(foundSetting.tierId);
            setSelectedCycles(foundSetting.maxCycles ?? 10);
          } else {
            const activeTiers = foundSub.plan.tiers.filter((t) => t.active);
            setSelectedTierId(foundSub.lastTierId ?? activeTiers[0]?.tierId ?? "0");
            setSelectedCycles(10);
          }
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSubData();
    return () => {
      mounted = false;
    };
  }, [wallet?.address, sessionUserToken, id]);

  const handleCopyPlanId = () => {
    if (!sub?.plan.id) return;
    navigator.clipboard.writeText(sub.plan.id);
    setCopiedPlanId(true);
    setTimeout(() => setCopiedPlanId(false), 2000);
  };

  const handleCopyPayload = () => {
    if (!sub?.lastBuyerData) return;
    navigator.clipboard.writeText(sub.lastBuyerData);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Handle Save / EIP-712 Sign Authorization
  const handleAuthorizeAutoPay = async () => {
    if (!sub || !wallet?.address || !sessionUserToken || !session) {
      setStatusMessage({ type: "error", text: "Active smart account session is required." });
      return;
    }

    setActionLoading(true);
    setStatusMessage(null);

    try {
      const customBuyerData = sub.lastBuyerData ?? "";
      const currentExpiresAt = Number(sub.lastEndTime || Math.floor(Date.now() / 1000) + 30 * 86400);

      const nonce = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(Date.now() / 1000) + 5 * 365 * 24 * 3600;

      // 1. Re-initialize modular smart account using local WebAuthn session
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(arcTestnet.rpcUrls.default.http[0]),
      });

      const smartAccount = await toCircleSmartAccount({
        client: publicClient as Client,
        owner: toWebAuthnAccount({ credential: session.credential }),
        name: session.username,
      });

      // 2. Generate a local Session Key and sign the EIP-712 single authorization intent
      const sessionWallet = Wallet.createRandom();
      const sessionPublicKey = sessionWallet.address;
      const sessionPrivateKey = sessionWallet.privateKey;

      const signature = await smartAccount.signTypedData({
        domain: {
          name: "Arca Subscription Gateway",
          version: "1",
          chainId: 5042002,
          verifyingContract: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
        },
        types: {
          AuthorizeSessionKey: [
            { name: "subscriber", type: "address" },
            { name: "sessionPublicKey", type: "address" },
            { name: "planId", type: "bytes32" },
            { name: "tierId", type: "uint256" },
            { name: "maxCycles", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "AuthorizeSessionKey",
        message: {
          subscriber: wallet.address as `0x${string}`,
          sessionPublicKey: sessionPublicKey as `0x${string}`,
          planId: sub.plan.id as `0x${string}`,
          tierId: BigInt(selectedTierId),
          maxCycles: BigInt(selectedCycles),
          deadline: BigInt(deadline),
        },
      });

      // 3. POST options, session key, & EIP-712 signature to MongoDB
      const res = await fetch("/api/autopay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberAddress: wallet.address,
          planId: sub.plan.id,
          enabled: true,
          tierId: selectedTierId,
          buyerData: customBuyerData,
          signature,
          nonce,
          deadline,
          currentExpiresAt,
          sessionPublicKey,
          sessionPrivateKey,
          maxCycles: selectedCycles,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save configuration");

      const updatedSetting: AutoPaySetting = {
        id: json.upsertedId ?? "generated",
        subscriberAddress: wallet.address,
        planId: sub.plan.id,
        enabled: true,
        tierId: selectedTierId,
        buyerData: customBuyerData,
        signature,
        nonce,
        deadline,
        currentExpiresAt,
        sessionPublicKey,
        sessionPrivateKey,
        maxCycles: selectedCycles,
        executedCycles: 0,
      };

      setSetting(updatedSetting);
      setStatusMessage({ type: "success", text: "AutoPay configuration secured successfully." });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Signing failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Disable AutoPay (Delete from DB)
  const handleDisableAutoPay = async () => {
    if (!sub || !wallet?.address || !sessionUserToken) return;

    setActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/autopay?planId=${sub.plan.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to disable AutoPay");

      setSetting(null);
      setStatusMessage({ type: "success", text: "AutoPay pre-authorization revoked." });
      setShowRevokeModal(false);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to disable." });
    } finally {
      setActionLoading(false);
    }
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
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[360px] p-8 text-center gap-4 rounded-xl bg-destructive/10">
        <div className="h-12 w-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Configuration Error</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {error ?? "Subscription not found"}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="h-8.5 rounded-lg">
          <Link href="/dashboard/autopay">Back to Auto-Pay</Link>
        </Button>
      </div>
    );
  }

  const isEnabled = !!setting?.enabled;
  const isModified =
    isEnabled &&
    setting &&
    (selectedTierId !== setting.tierId || selectedCycles !== (setting.maxCycles ?? 10));
  const planName =
    sub.metadata?.name ?? sub.metadata?.brand?.name ?? `Plan ${sub.plan.id.slice(0, 8)}`;
  const brand = sub.metadata?.brand;
  const durationDays = Math.round(Number(sub.plan.duration) / 86400);

  const activeTiers = sub.plan.tiers.filter((t) => t.active);
  const selectedTier = activeTiers.find((t) => t.tierId === selectedTierId) ?? activeTiers[0];

  const baseEndTime = Number(sub.lastEndTime || Math.floor(Date.now() / 1000));
  const duration = Number(sub.plan.duration || 30 * 86400);
  const maxCycles = isEnabled && setting?.maxCycles ? setting.maxCycles : selectedCycles;
  const scheduleItems = Array.from({ length: maxCycles }, (_, i) => ({
    index: i + 1,
    startTime: baseEndTime + i * duration,
    endTime: baseEndTime + (i + 1) * duration,
  }));

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Breadcrumb & Header ───────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1.5">
          <Link
            href="/dashboard/autopay"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Auto-Pay</span>
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{planName}</h1>
            <Badge
              variant={sub.status === "ACTIVE" ? "secondary" : "outline"}
              className="text-xs font-mono px-2 py-0.5"
            >
              {sub.status === "ACTIVE" ? "Active" : "Expired"}
            </Badge>
            <Badge
              variant={isEnabled ? "secondary" : "outline"}
              className="text-xs font-mono px-2 py-0.5"
            >
              {isEnabled ? "Auto-Pay On" : "Auto-Pay Off"}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <button
              onClick={handleCopyPlanId}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] hover:text-foreground transition-colors cursor-pointer"
              title="Click to copy plan ID"
            >
              <span>{sub.plan.id.slice(0, 8)}…{sub.plan.id.slice(-4)}</span>
              {copiedPlanId ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
            </button>
            <span>·</span>
            <span>Every {durationDays} Days</span>
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

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          <Button asChild size="sm" variant="outline" className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/50">
            <Link href={`/dashboard/subscriptions/${sub.plan.id}`}>
              Subscription Details <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Status */}
        <div className={cn("rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3", isEnabled ? "bg-primary/10" : "bg-muted/30")}>
          <div className="flex items-center justify-between">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isEnabled ? "text-primary" : "text-muted-foreground")}>
              Auto-Pay State
            </span>
            <Zap className={cn("h-3.5 w-3.5 shrink-0", isEnabled ? "text-primary" : "text-muted-foreground/60")} />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {isEnabled ? "Enabled" : "Disabled"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {isEnabled ? "Renewals will execute automatically" : "Manual payment required"}
            </p>
          </div>
        </div>

        {/* Next Renewal */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Current Cycle Ends
            </span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString("en-US", { year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Billing Interval */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Billing Interval
            </span>
            <Repeat className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {durationDays} Days
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Renewal period length
            </p>
          </div>
        </div>

        {/* Relayer Fees */}
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
              Sponsored by network
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Section ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Form Card */}
        <div className="lg:col-span-7 rounded-xl border border-border/30 bg-muted/10 p-5 sm:p-6 flex flex-col gap-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              {isEnabled ? "Auto-Pay Configuration" : "Set Up Auto-Pay"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isEnabled
                ? "Review or modify your renewal tier and authorization limit."
                : "Select your renewal tier and cycle limit to enable automatic renewals."}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 border-t border-border/10 pt-5">
            {/* Active Status Banner - ONLY visible when Auto-Pay is already set up */}
            {isEnabled && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary inline-block" />
                    <span className="text-xs font-semibold text-foreground">Auto-Pay is Active</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Automatic renewals are enabled with passkey approval · Nonce: <span className="font-mono">{setting?.nonce}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => setShowRevokeModal(true)}
                  className="h-8 text-xs font-medium rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 shrink-0"
                >
                  Turn Off Auto-Pay
                </Button>
              </div>
            )}

            {/* Tier Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Renewal Price Tier</label>
              <Select
                disabled={actionLoading}
                value={selectedTierId}
                onValueChange={(val) => setSelectedTierId(val ?? "")}
              >
                <SelectTrigger className="w-full h-8.5 text-xs bg-muted/20 border-border/40 rounded-lg">
                  <SelectValue placeholder="Select a pricing tier" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/30">
                  {activeTiers.map((t) => (
                    <SelectItem key={t.tierId} value={t.tierId} className="text-xs">
                      {t.label} — {Number(formatUnits(t.price, 6)).toLocaleString()} USDC
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cycle Limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="cycle-limit" className="text-xs font-semibold text-foreground">
                  Renewal Cycle Limit (1 - 10)
                </label>
                <span className="font-mono text-xs text-primary font-semibold">{maxCycles} Cycles</span>
              </div>
              <Input
                id="cycle-limit"
                type="number"
                min={1}
                max={10}
                disabled={actionLoading}
                value={selectedCycles}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 1) val = 1;
                  if (val > 10) val = 10;
                  setSelectedCycles(val);
                }}
                className="h-8.5 bg-muted/20 border-border/40 text-xs font-mono rounded-lg"
              />
            </div>

            {/* Custom buyer data / payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Saved Parameters</label>
                {sub.lastBuyerData && (
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
                )}
              </div>
              <div className="p-3 bg-muted/20 border border-border/20 rounded-lg font-mono text-[10px] break-all leading-normal text-muted-foreground">
                {sub.lastBuyerData || "No custom parameters registered for this plan"}
              </div>
            </div>

            {/* Schedule Timeline Accordion */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTimeline(!showTimeline)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {showTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>Renewal Schedule Timeline ({maxCycles} Cycles)</span>
              </button>

              {showTimeline && (
                <div className="rounded-lg border border-border/20 bg-muted/20 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 px-3">Cycle</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono text-[11px]">
                      {scheduleItems.map((item) => {
                        const dateStr = new Date(item.startTime * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        const isExecuted =
                          setting && setting.executedCycles ? item.index <= setting.executedCycles : false;

                        return (
                          <tr key={item.index} className="hover:bg-muted/30">
                            <td className="py-2 px-3 font-semibold text-foreground">#{item.index}</td>
                            <td className="py-2 px-3 text-muted-foreground">{dateStr}</td>
                            <td className="py-2 px-3 text-right">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-medium",
                                  isExecuted
                                    ? "text-muted-foreground"
                                    : isEnabled
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isExecuted ? "bg-muted-foreground" : isEnabled ? "bg-primary" : "bg-muted-foreground"
                                  )}
                                />
                                {isExecuted ? "Executed" : isEnabled ? "Authorized" : "Needs Signature"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Status Feedback Message */}
            {statusMessage && (
              <div
                className={cn(
                  "p-3 rounded-lg border text-xs flex items-center gap-2",
                  statusMessage.type === "success"
                    ? "bg-primary/10 border-primary/20 text-primary font-medium"
                    : "bg-destructive/10 border-destructive/20 text-destructive font-medium"
                )}
              >
                {statusMessage.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            {(!isEnabled || isModified) && (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={handleAuthorizeAutoPay}
                  disabled={actionLoading}
                  className="h-8.5 px-4 text-xs font-semibold gap-1.5 rounded-lg flex-1"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                      <span>Securing Intent...</span>
                    </>
                  ) : isModified ? (
                    <>
                      <Play size={12} className="fill-current shrink-0" />
                      <span>Save & Re-Sign Setup</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-current shrink-0" />
                      <span>Set Up Auto-Pay</span>
                    </>
                  )}
                </Button>

                {isModified && (
                  <Button
                    onClick={() => {
                      if (setting) {
                        setSelectedTierId(setting.tierId);
                        setSelectedCycles(setting.maxCycles ?? 10);
                      }
                    }}
                    disabled={actionLoading}
                    variant="outline"
                    className="h-8.5 px-3 text-xs rounded-lg"
                  >
                    Reset Changes
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Security & Cryptographic Pipeline Card */}
        <div className="lg:col-span-5 rounded-xl border border-border/30 bg-muted/10 p-5 sm:p-6 flex flex-col gap-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">Security & Authorization</h2>
            <p className="text-xs text-muted-foreground">
              How passkey approvals safely automate recurring payments.
            </p>
          </div>

          <div className="relative border-l border-border/20 pl-5 space-y-6 pt-2">
            {/* Step 1 */}
            <div className="relative">
              <span
                className={cn(
                  "absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-background transition-colors",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"
                )}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">1. Biometric Passkey Consent</span>
                  <Badge variant={isEnabled ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0 font-mono">
                    {isEnabled ? "Signed" : "Pending"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You biometrically approve the pre-authorization using your hardware passkey (Face ID / Touch ID).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span
                className={cn(
                  "absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-background transition-colors",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"
                )}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">2. Session Key Vault</span>
                  <Badge variant={isEnabled ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0 font-mono">
                    {isEnabled ? "Secured" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your bounded session key and EIP-712 signature are stored safely with cycle constraints.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span
                className={cn(
                  "absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-background transition-colors",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"
                )}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">3. Sponsored Relayer</span>
                  <Badge variant={isEnabled ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0 font-mono">
                    {isEnabled ? "Active" : "Ready"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Renewal gas fees are fully sponsored by Arca. Renewals trigger automatically on schedule.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <span
                className={cn(
                  "absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-background transition-colors",
                  isEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"
                )}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">4. Gateway Settlement</span>
                  <Badge variant={isEnabled ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0 font-mono">
                    {isEnabled ? "Verified" : "Standby"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The on-chain smart contract verifies signature parameters and extends the subscription.
                </p>
              </div>
            </div>
          </div>

          {/* Assurances list */}
          <div className="border-t border-border/10 pt-4 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <CheckCircle2 size={13} className="text-primary shrink-0" />
              <span>Zero gas fees paid by you (Sponsored)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <CheckCircle2 size={13} className="text-primary shrink-0" />
              <span>Instantly revocable anytime with one click</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <CheckCircle2 size={13} className="text-primary shrink-0" />
              <span>Non-custodial: funds never leave your account</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Revocation Confirmation Dialog ── */}
      <Dialog open={showRevokeModal} onOpenChange={setShowRevokeModal}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Turn off Auto-Pay?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will immediately stop automated renewal payments for this subscription. You can re-enable Auto-Pay at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/20 bg-muted/20 p-4 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan ID:</span>
              <span className="font-semibold text-foreground">{sub.plan.id.slice(0, 10)}…{sub.plan.id.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Authorized Cycles:</span>
              <span className="font-semibold text-foreground">{maxCycles} Cycles</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Executed Cycles:</span>
              <span className="font-semibold text-foreground">{setting?.executedCycles ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Next Expiration:</span>
              <span className="font-semibold text-foreground">
                {new Date(Number(sub.lastEndTime) * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => setShowRevokeModal(false)}
              className="h-8.5 rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actionLoading}
              onClick={handleDisableAutoPay}
              className="h-8.5 rounded-lg text-xs font-semibold gap-1.5"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span>Revoking...</span>
                </>
              ) : (
                <span>Confirm Turn Off</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
