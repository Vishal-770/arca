"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { formatUnits, createPublicClient, http, encodeFunctionData } from "viem";
import { arcTestnet } from "@/lib/bridge_config";
import { SUBSCRIPTION_GATEWAY_ADDRESS, ARC_USDC_ADDRESS } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  Lock,
  LogOut,
  Wallet,
  Copy,
  Check,
  ArrowDownUp,
} from "lucide-react";
import { formatTransactionError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BridgeUSDC from "@/components/BridgeUSDC";
import { ModeToggle } from "@/components/ModeToggle";

/* ── Types ── */
interface Tier {
  id: string;
  tierId: string;
  price: string;
  label: string;
  active: boolean;
}

interface Plan {
  id: string;
  planId: string;
  duration: string;
  active: boolean;
  tiers: Tier[];
  seller: {
    id: string;
  };
  metadata: {
    name?: string;
    description?: string;
    brand?: { name?: string; website?: string };
    tiers?: Array<{
      label: string;
      price: string;
      features: Array<{ title: string; description: string }>;
    }>;
  } | null;
}

type TierTxStatus = "idle" | "subscribing" | "success" | "error";

/* ── Helpers ── */
function humanDuration(s: string) {
  const sec = Number(s);
  const d = Math.floor(sec / 86400);
  if (d >= 1) return `${d} day${d !== 1 ? "s" : ""}`;
  const h = Math.floor(sec / 3600);
  if (h >= 1) return `${h} hour${h !== 1 ? "s" : ""}`;
  return `${Math.max(Math.floor(sec / 60), 1)} min`;
}

const trunc = (v: string) => `${v.slice(0, 6)}…${v.slice(-4)}`;
const fmt6 = (v: string) =>
  Number(formatUnits(BigInt(v), 6)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ══════════════════════════════════════════════════════ */
export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, executeTransaction, isReady, clearSession } = useCircleSDK();

  const planId = params.planId as string;
  const userId = searchParams.get("userId") ?? "";
  const redirectUrl = searchParams.get("redirectUrl") ?? "";

  /* ── State ── */
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [wallet, setWallet] = useState<{ id: string; address: string; balance: string } | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Per-tier tx state
  const [tierStatus, setTierStatus] = useState<Record<string, TierTxStatus>>({});
  const [tierError, setTierError] = useState<Record<string, string>>({});
  const [subscription, setSubscription] = useState<{
    status: "ACTIVE" | "EXPIRED";
    remainingSeconds: number;
    lastEndTime: string;
    lastTierId?: string;
    tierIds?: string[];
  } | null>(null);

  // Success state — which tier was just purchased
  const [succeededTier, setSucceededTier] = useState<Tier | null>(null);
  const [countdown, setCountdown] = useState(3);

  /* ── Redirect countdown after success ── */
  useEffect(() => {
    if (!succeededTier) return;
    setCountdown(3);
    const tick = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) {
          clearInterval(tick);
          const dest = redirectUrl
            ? decodeURIComponent(redirectUrl)
            : "/dashboard/subscriptions";
          router.replace(dest);
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [succeededTier, redirectUrl, router]);

  /* ── Load plan ── */
  useEffect(() => {
    if (!planId) return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payment/plan/${planId}`);
        if (!res.ok) throw new Error("Plan not found in registry");
        const data = await res.json();
        setPlan(data.plan as Plan);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [planId]);

  /* ── Load wallet ── */
  const {
    data: walletBalance = "0",
    refetch: refetchWalletBalance,
    isLoading: walletLoading,
  } = useQuery({
    queryKey: ["walletBalance", session?.walletAddress],
    queryFn: async () => {
      if (!session?.walletAddress) return "0";
      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(arcTestnet.rpcUrls.default.http[0]),
      });
      const balance = await publicClient.getBalance({
        address: session.walletAddress as `0x${string}`,
      });
      return formatUnits(balance, 18);
    },
    enabled: !!session?.walletAddress,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (!session?.walletAddress) {
      setWallet(null);
      return;
    }
    setWallet({
      id: "Arc_Testnet",
      address: session.walletAddress,
      balance: walletBalance,
    });
  }, [session?.walletAddress, walletBalance]);

  /* ── Check existing subscription ── */
  useEffect(() => {
    if (!planId) return;
    if (!userId && !wallet?.address) return;
    const checkSub = async () => {
      try {
        const queryParam = userId
          ? `userId=${encodeURIComponent(userId)}`
          : `subscriber=${encodeURIComponent(wallet?.address ?? "")}`;
        const res = await fetch(`/api/subscription/my-subscriptions/${planId}?${queryParam}`);
        if (res.ok) {
          const data = await res.json();
          setSubscription(data.subscription);
        } else {
          setSubscription(null);
        }
      } catch {
        setSubscription(null);
      }
    };
    void checkSub();
  }, [wallet?.address, planId, userId]);

  const isOwner = wallet?.address.toLowerCase() === plan?.seller?.id?.toLowerCase();
  const isActiveSub = subscription?.status === "ACTIVE" && (subscription?.remainingSeconds ?? 0) > 0;

  /* ── Per-tier payment ── */
  const handleTierPayment = async (tier: Tier) => {
    if (!session || !wallet || !plan) return;

    const tid = tier.id;
    setTierError((p) => ({ ...p, [tid]: "" }));
    setTierStatus((p) => ({ ...p, [tid]: "subscribing" }));

    try {
      const erc20Abi = [
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        },
      ] as const;

      const subscriptionGatewayAbi = [
        {
          name: "subscribe",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "tierId", type: "uint256" },
            { name: "buyerData", type: "string" },
          ],
          outputs: [],
        },
      ] as const;

      const requiredAmount = BigInt(tier.price);

      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`, requiredAmount],
      });

      const subscribeData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "subscribe",
        args: [
          plan.planId as `0x${string}`,
          BigInt(tier.tierId),
          userId || wallet.address,
        ],
      });

      const calls = [
        {
          to: ARC_USDC_ADDRESS as `0x${string}`,
          data: approveData,
        },
        {
          to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
          data: subscribeData,
        },
      ];

      await executeTransaction(calls, false, "Arc_Testnet");
      void refetchWalletBalance();

      // Polling for Indexer Sync
      setTierStatus((p) => ({ ...p, [tid]: "success" }));

      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const queryParam = userId
            ? `userId=${encodeURIComponent(userId)}`
            : `subscriber=${encodeURIComponent(wallet.address)}`;
          const res = await fetch(`/api/subscription/my-subscriptions/${planId}?${queryParam}`);
          if (res.ok) {
            const data = await res.json();
            if (data.subscription?.status === "ACTIVE") {
              clearInterval(poll);
              setSucceededTier(tier);
              setSubscription(data.subscription);
            }
          }
        } catch {
          /* continue */
        }

        if (attempts > 30) {
          clearInterval(poll);
          setSucceededTier(tier);
        }
      }, 2000);
    } catch (err) {
      setTierStatus((p) => ({ ...p, [tid]: "error" }));
      setTierError((p) => ({
        ...p,
        [tid]: formatTransactionError(err),
      }));
    }
  };

  const copyAddress = () => {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const activeTiers = plan?.tiers.filter((t) => t.active) ?? [];
  const brandName = plan?.metadata?.brand?.name;
  const planName = plan?.metadata?.name ?? "Subscription Plan";

  /* ── Loading ── */
  if (!isReady || loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono animate-pulse">
          Loading checkout details…
        </p>
      </div>
    );
  }

  /* ── Load error ── */
  if (loadError) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4">
          <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Plan Unavailable</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{loadError}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="h-8.5 px-4 text-xs font-semibold rounded-lg"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (succeededTier) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-2xl border border-border/30 bg-muted/10 p-6 sm:p-8 text-center space-y-6">
          <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-6" />
          </div>

          <div className="space-y-1">
            <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
              Payment Completed
            </Badge>
            <h2 className="text-xl font-bold tracking-tight text-foreground pt-1">
              Subscription Active
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your payment has settled on Arc Testnet. You now have full access to this plan.
            </p>
          </div>

          <div className="divide-y divide-border/20 rounded-xl border border-border/20 bg-background/50 text-xs overflow-hidden">
            <div className="p-3 flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Subscription</span>
              <span className="font-semibold text-foreground">{planName}</span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Selected Tier</span>
              <span className="font-semibold text-foreground">{succeededTier.label}</span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Amount Paid</span>
              <span className="font-semibold text-foreground font-mono">
                ${fmt6(succeededTier.price)} USDC
              </span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Billing Cycle</span>
              <span className="font-semibold text-foreground">
                {plan ? humanDuration(plan.duration) : "—"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${(countdown / 3) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>Redirecting</span>
              <span className="font-bold text-foreground">{countdown}s</span>
            </div>
          </div>

          <Button asChild size="sm" className="w-full h-9 text-xs font-semibold rounded-lg gap-1.5">
            <Link href={redirectUrl ? decodeURIComponent(redirectUrl) : "/dashboard/subscriptions"}>
              Continue to Application <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main UI ── */
  return (
    <div className="w-full flex flex-col flex-1">
      {/* ── Top Header / Nav ── */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-md sticky top-0 z-30 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="Arca" className="h-6 w-6 dark:invert object-contain" />
            <span className="text-sm font-bold tracking-tight text-foreground">Arca</span>
            <span className="text-muted-foreground/40 font-mono text-xs">/</span>
            <span className="text-xs text-muted-foreground font-medium">Checkout</span>
          </Link>

          <div className="flex items-center gap-3">
            {session && wallet && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/30 text-xs font-mono">
                  <span className="size-2 rounded-full bg-primary inline-block" />
                  <span className="text-foreground font-medium">{trunc(wallet.address)}</span>
                </div>

                <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1.5"
                    >
                      <LogOut className="size-3.5" />
                      <span className="hidden sm:inline">Disconnect</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6">
                    <DialogHeader className="text-left space-y-1">
                      <DialogTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Disconnect Wallet
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Are you sure you want to disconnect? You will need to sign in again to complete checkout.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLogoutDialog(false)}
                        className="h-8.5 px-3 text-xs rounded-lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          clearSession();
                          setShowLogoutDialog(false);
                        }}
                        className="h-8.5 px-4 text-xs font-semibold rounded-lg"
                      >
                        Disconnect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full flex flex-col gap-8">
        {/* Plan Header Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {brandName ? (
              <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5 rounded-md">
                {brandName}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5 rounded-md">
                Arca Verified Plan
              </Badge>
            )}

            {brandName && plan?.metadata?.brand?.website && (
              <a
                href={plan.metadata.brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors"
              >
                Merchant Website <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {planName}
            </h1>
            {plan?.metadata?.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
                {plan.metadata.description}
              </p>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-border/20 bg-muted/10 p-3.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Billing Cycle
              </span>
              <span className="text-xs font-semibold text-foreground">
                Every {plan ? humanDuration(plan.duration) : "—"}
              </span>
            </div>

            <div className="rounded-xl border border-border/20 bg-muted/10 p-3.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Settlement Token
              </span>
              <span className="text-xs font-semibold text-foreground">
                USDC (Circle ERC-20)
              </span>
            </div>

            <div className="rounded-xl border border-border/20 bg-muted/10 p-3.5 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Network & Gas
              </span>
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Arc Testnet · Gas Sponsored
              </span>
            </div>
          </div>
        </div>

        {/* Existing Alerts */}
        {isActiveSub && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Active Subscription Found
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Remaining time: <span className="font-mono font-semibold text-foreground">{humanDuration(String(subscription?.remainingSeconds ?? 0))}</span>
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs rounded-lg border-primary/30 text-primary shrink-0">
              <Link href="/dashboard/subscriptions">View Subscriptions</Link>
            </Button>
          </div>
        )}

        {isOwner && (
          <div className="rounded-xl border border-border/30 bg-muted/20 p-4 flex items-center gap-3">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              You are the creator of this subscription plan. Subscribing is disabled for the owner wallet address.
            </p>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tiers Selection */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Select Pricing Tier
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                {activeTiers.length} {activeTiers.length === 1 ? "option" : "options"} available
              </span>
            </div>

            {activeTiers.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-border/20 bg-muted/10 p-6">
                <p className="text-xs text-muted-foreground">
                  No active pricing tiers are configured for this plan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTiers.map((tier) => {
                  const st = tierStatus[tier.id] ?? "idle";
                  const err = tierError[tier.id];
                  const isInsuf = wallet
                    ? Number(wallet.balance) < Number(formatUnits(BigInt(tier.price), 6)) + 0.01
                    : false;
                  const busy = st === "subscribing";
                  const succeeded = st === "success";

                  const metaTier = plan?.metadata?.tiers?.find((mt) => mt.label === tier.label);
                  const tierFeatures = metaTier?.features ?? [];
                  const isThisTierActive =
                    isActiveSub &&
                    (subscription?.tierIds?.includes(tier.tierId) ||
                      subscription?.lastTierId === tier.tierId);

                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "rounded-xl border bg-muted/10 p-5 sm:p-6 transition-all space-y-5",
                        isThisTierActive
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/30 hover:border-border/60"
                      )}
                    >
                      {/* Tier Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-foreground">{tier.label}</h3>
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5 rounded-md text-muted-foreground">
                              Tier #{tier.tierId}
                            </Badge>
                            {isThisTierActive && (
                              <Badge className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
                                Active Tier
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recurring access every {humanDuration(plan?.duration ?? "0")}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <div className="flex items-baseline sm:justify-end gap-1">
                            <span className="text-2xl font-bold font-mono text-foreground leading-none">
                              ${fmt6(tier.price)}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">USDC</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            per billing cycle
                          </p>
                        </div>
                      </div>

                      {/* Tier Features */}
                      {tierFeatures.length > 0 && (
                        <div className="space-y-2.5 pt-3 border-t border-border/10">
                          {tierFeatures.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs">
                              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <p className="font-semibold text-foreground text-xs leading-snug">
                                  {f.title}
                                </p>
                                {f.description && (
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {f.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Error & Warning Notices */}
                      {err && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{err}</span>
                        </div>
                      )}

                      {isInsuf && wallet && !isOwner && !isThisTierActive && !succeeded && (
                        <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-xs flex items-start gap-2.5">
                          <AlertCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">
                              Insufficient USDC Balance
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Required: <span className="font-mono font-semibold text-foreground">{(Number(formatUnits(BigInt(tier.price), 6)) + 0.01).toFixed(2)} USDC</span>. Current balance: <span className="font-mono font-semibold text-foreground">{Number(wallet.balance).toFixed(2)} USDC</span>.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2">
                        {!session ? (
                          <Button
                            onClick={() => {
                              const here = `${window.location.pathname}${window.location.search}`;
                              router.push(`/login?redirect=${encodeURIComponent(here)}`);
                            }}
                            className="w-full h-9 text-xs font-semibold rounded-lg gap-1.5"
                          >
                            <Wallet className="size-3.5" />
                            Connect Wallet to Subscribe
                          </Button>
                        ) : isOwner ? (
                          <Button disabled variant="outline" className="w-full h-9 text-xs rounded-lg">
                            Plan Owner
                          </Button>
                        ) : isThisTierActive ? (
                          <Button disabled variant="outline" className="w-full h-9 text-xs rounded-lg text-primary border-primary/30">
                            Currently Active Tier
                          </Button>
                        ) : succeeded ? (
                          <Button disabled className="w-full h-9 text-xs font-semibold rounded-lg gap-1.5 animate-pulse">
                            <Loader2 className="size-3.5 animate-spin" />
                            Syncing Subscription…
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleTierPayment(tier)}
                            disabled={busy || !wallet || isInsuf}
                            className="w-full h-9 text-xs font-semibold rounded-lg gap-1.5"
                          >
                            {busy ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Processing Transaction…
                              </>
                            ) : isInsuf ? (
                              "Insufficient USDC Balance"
                            ) : (
                              <>
                                Subscribe with USDC
                                <ArrowRight className="size-3.5" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Checkout Summary & Wallet Card */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* Wallet & Balance Box */}
            <div className="rounded-xl border border-border/30 bg-muted/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="size-3.5 text-primary" />
                  Your Wallet
                </span>
                <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5 rounded-md">
                  Arc Testnet
                </Badge>
              </div>

              {!session ? (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/20 text-center space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Connect your passkey wallet to view balances and complete checkout.
                  </p>
                  <Button
                    onClick={() => {
                      const here = `${window.location.pathname}${window.location.search}`;
                      router.push(`/login?redirect=${encodeURIComponent(here)}`);
                    }}
                    size="sm"
                    className="h-8 px-4 text-xs font-semibold rounded-lg w-full"
                  >
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Available Balance
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                        {walletLoading ? "…" : wallet ? Number(wallet.balance).toFixed(2) : "0.00"}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">USDC</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/30 text-xs font-mono">
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {wallet ? wallet.address : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer shrink-0"
                      title="Copy wallet address"
                    >
                      {copiedAddress ? (
                        <Check className="size-3.5 text-primary" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Bridge Sheet Trigger */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8.5 text-xs font-semibold rounded-lg gap-1.5 border-border/60 hover:bg-muted/50"
                      >
                        <ArrowDownUp className="size-3.5" />
                        Deposit or Bridge USDC
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/30 p-6">
                      <SheetHeader className="text-left space-y-1">
                        <SheetTitle className="text-base font-bold text-foreground">
                          Bridge USDC to Arc Testnet
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                          Bridge USDC seamlessly from Base, Arbitrum, or Ethereum to your Arc smart wallet.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <BridgeUSDC isCompact={true} defaultDestChain="Arc_Testnet" />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="rounded-xl border border-border/30 bg-muted/10 p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Order Summary
              </span>

              <div className="space-y-2 text-xs divide-y divide-border/10">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground truncate max-w-[180px]">{planName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Network Gas Fee</span>
                  <span className="font-semibold text-primary font-mono">0.00 USDC (Sponsored)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Execution Protocol</span>
                  <span className="font-semibold text-foreground">Arca Smart Gateway</span>
                </div>
              </div>
            </div>

            {/* Context Metadata */}
            {(userId || redirectUrl) && (
              <div className="rounded-xl border border-border/20 bg-muted/10 p-4 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Session Metadata
                </span>
                {userId && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-mono text-foreground truncate max-w-[180px]">{userId}</span>
                  </div>
                )}
                {redirectUrl && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Return URL</span>
                    <span className="font-mono text-foreground truncate max-w-[180px]">{decodeURIComponent(redirectUrl)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Security Guarantee Strip */}
            <div className="p-3 text-center space-y-1 text-muted-foreground">
              <div className="flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Lock className="size-3 text-primary" /> Passkey Secured
                </span>
                <span>•</span>
                <span>Circle W3S</span>
                <span>•</span>
                <span>Arc Testnet</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
