"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useDashboardContext } from "../_components/DashboardShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Globe,
  Layers,
  CheckCircle2,
  Settings2,
  ExternalLink,
  Terminal,
  Search,
  RotateCcw,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PlanTier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type UserPlanInfo = {
  planId: string;
  duration: string;
  active: boolean;
  tiers: PlanTier[];
  metadata: {
    name?: string;
    brand?: { name?: string };
  } | null;
};

type WebhookEndpoint = {
  id: string;
  userId: string;
  planId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type StatusFilter = "all" | "active" | "inactive";

export default function WebhooksPage() {
  const { sessionUserToken, wallet } = useDashboardContext();

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [plans, setPlans] = useState<UserPlanInfo[]>([]);

  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Form states
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isActiveToggle, setIsActiveToggle] = useState(true);

  const [editWebhookId, setEditWebhookId] = useState<string | null>(null);

  // UX states
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookEndpoint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all webhooks configured for this user
  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      if (data.webhooks) {
        setWebhooks(data.webhooks);
      }
    } catch (err) {
      console.error("Failed to fetch webhooks", err);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  // Fetch user's plans to associate
  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/subscription/my-plans");
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (sessionUserToken) {
      void fetchWebhooks();
    }
  }, [sessionUserToken]);

  useEffect(() => {
    if (wallet?.address && sessionUserToken) {
      void fetchPlans();
    }
  }, [wallet?.address, sessionUserToken]);

  // Map of Plan ID -> Plan Title
  const planTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    map.set("all", "All Deployed Plans (Legacy)");
    plans.forEach((p) => {
      const title =
        p.metadata?.name ?? p.metadata?.brand?.name ?? `Plan ${p.planId.slice(0, 8)}`;
      map.set(p.planId.toLowerCase(), title);
    });
    return map;
  }, [plans]);

  // Set of plans that already have a configured webhook endpoint
  const configuredPlanIds = useMemo(() => {
    return new Set(webhooks.map((w) => w.planId.toLowerCase()));
  }, [webhooks]);

  // Available plans list that are not configured yet (for creation form)
  const availablePlanOptions = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    plans.forEach((p) => {
      const planIdLower = p.planId.toLowerCase();
      if (!configuredPlanIds.has(planIdLower)) {
        const name = p.metadata?.name ?? p.metadata?.brand?.name ?? `Plan ${p.planId.slice(0, 8)}`;
        list.push({ id: p.planId, label: name });
      }
    });
    return list;
  }, [plans, configuredPlanIds]);

  const handleCreateWebhook = async () => {
    if (!webhookUrl.trim() || !selectedPlanId) return;

    // Client-side URL validation
    try {
      const parsedUrl = new URL(webhookUrl.trim());
      if (parsedUrl.protocol !== "https:") {
        setErrorMsg("Destination URL must use the HTTPS protocol.");
        return;
      }
    } catch {
      setErrorMsg("Please enter a valid absolute URL (e.g., https://api.yourdomain.com/webhooks).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl.trim(),
          planId: selectedPlanId,
          isActive: isActiveToggle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to configure webhook");
      }

      setWebhookUrl("");
      setSelectedPlanId("");
      setIsActiveToggle(true);
      setCreateOpen(false);
      void fetchWebhooks();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to configure webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (wh: WebhookEndpoint) => {
    setEditWebhookId(wh.id);
    setWebhookUrl(wh.url);
    setSelectedPlanId(wh.planId);
    setIsActiveToggle(wh.isActive);
    setErrorMsg(null);
    setEditOpen(true);
  };

  const handleUpdateWebhook = async () => {
    if (!editWebhookId || !webhookUrl.trim() || !selectedPlanId) return;

    // Client-side URL validation
    try {
      const parsedUrl = new URL(webhookUrl.trim());
      if (parsedUrl.protocol !== "https:") {
        setErrorMsg("Destination URL must use the HTTPS protocol.");
        return;
      }
    } catch {
      setErrorMsg("Please enter a valid absolute URL (e.g., https://api.yourdomain.com/webhooks).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editWebhookId,
          url: webhookUrl.trim(),
          planId: selectedPlanId,
          isActive: isActiveToggle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update webhook");
      }

      setEditWebhookId(null);
      setWebhookUrl("");
      setSelectedPlanId("");
      setEditOpen(false);
      void fetchWebhooks();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;
    try {
      const res = await fetch(`/api/webhooks?id=${webhookToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWebhookToDelete(null);
        void fetchWebhooks();
      }
    } catch (err) {
      console.error("Failed to delete webhook", err);
    }
  };

  const copyToClipboard = async (text: string, onSuccess: () => void) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        onSuccess();
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        onSuccess();
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const toggleSecretReveal = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered webhooks
  const filteredWebhooks = useMemo(() => {
    return webhooks.filter((wh) => {
      if (statusFilter === "active" && !wh.isActive) return false;
      if (statusFilter === "inactive" && wh.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const planTitle = planTitleMap.get(wh.planId.toLowerCase()) ?? "";
        const matchesPlan = planTitle.toLowerCase().includes(q);
        const matchesUrl = wh.url.toLowerCase().includes(q);
        if (!matchesPlan && !matchesUrl) return false;
      }
      return true;
    });
  }, [webhooks, statusFilter, searchQuery, planTitleMap]);

  const stats = useMemo(() => {
    const total = webhooks.length;
    const active = webhooks.filter((w) => w.isActive).length;
    const disabled = total - active;
    return {
      total,
      active,
      disabled,
    };
  }, [webhooks]);

  const isLoading = loadingWebhooks || loadingPlans;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Webhooks</h1>
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
              {stats.active} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure real-time event notifications for subscription payments and lifecycle updates.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/50"
          >
            <Link href="/docs">
              API Docs <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>

          <Button
            onClick={() => {
              setWebhookUrl("");
              setSelectedPlanId(availablePlanOptions[0]?.id ?? "");
              setIsActiveToggle(true);
              setErrorMsg(null);
              setCreateOpen(true);
            }}
            disabled={plans.length === 0}
            size="sm"
            className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 rounded-lg"
          >
            <Plus className="size-3.5" />
            Add Webhook
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Endpoints */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Active Webhooks
            </span>
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.active}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Receiving live notifications
            </p>
          </div>
        </div>

        {/* Total Configured */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Endpoints
            </span>
            <Globe className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.total}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Assigned subscription gates
            </p>
          </div>
        </div>

        {/* Monitored Events */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Subscribed Event
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-sm font-bold font-mono tracking-tight text-foreground leading-none">
              payment.succeeded
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Signed via HMAC-SHA256
            </p>
          </div>
        </div>

        {/* Disabled / Paused Endpoints */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Disabled
            </span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.disabled}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Paused or inactive endpoints
            </p>
          </div>
        </div>
      </div>

      {/* ── Content Section: Webhook Endpoints ─────────────────── */}
      {isLoading ? (
        <div className="py-20 text-center rounded-xl border border-border/20 bg-muted/10">
          <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase tracking-widest">
            Loading webhook endpoints…
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-20 px-6 rounded-xl bg-muted/20 border border-border/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Layers className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No subscription plans found</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6">
            You need to create a subscription plan before setting up webhook endpoints to receive payment notifications.
          </p>
          <Button asChild size="sm" className="h-8.5 px-4 text-xs font-semibold rounded-lg">
            <Link href="/dashboard/plans/create">
              Create Subscription Plan <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="py-20 px-6 rounded-xl bg-muted/20 border border-border/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Webhook className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No webhooks configured yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6">
            Configure a webhook endpoint to receive real-time notifications on your backend when customers subscribe.
          </p>
          <Button
            onClick={() => {
              setWebhookUrl("");
              setSelectedPlanId(availablePlanOptions[0]?.id ?? "");
              setIsActiveToggle(true);
              setErrorMsg(null);
              setCreateOpen(true);
            }}
            size="sm"
            className="h-8.5 px-4 text-xs font-semibold rounded-lg gap-1.5"
          >
            <Plus className="size-3.5" />
            Add First Webhook
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search webhooks by plan or destination URL..."
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
                  All ({stats.total})
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
                  Active ({stats.active})
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
                  Disabled ({stats.disabled})
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Endpoints List */}
          {filteredWebhooks.length === 0 ? (
            <div className="py-14 text-center rounded-xl border border-border/20 bg-muted/10 p-6 flex flex-col items-center justify-center">
              <Search className="size-6 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No matching webhooks found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No configured webhooks match your search and filter criteria.
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
            <div className="grid grid-cols-1 gap-4">
              {filteredWebhooks.map((wh) => {
                const planTitle = planTitleMap.get(wh.planId.toLowerCase()) ?? "Subscription Plan";
                const isRevealed = !!revealedSecrets[wh.id];
                const isCopiedSecret = copiedId === wh.id;
                const isCopiedUrl = copiedUrlId === wh.id;

                return (
                  <div
                    key={wh.id}
                    className="rounded-xl border border-border/30 bg-muted/10 p-5 space-y-4 hover:border-border/60 transition-colors"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Webhook size={14} />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">{planTitle}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-mono px-2 py-0.5 rounded-md",
                            wh.isActive
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-muted text-muted-foreground border-border/30"
                          )}
                        >
                          {wh.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-border/50 hover:bg-muted/50"
                        >
                          <Link href={`/dashboard/webhooks/${wh.id}`}>
                            <Terminal size={12} />
                            View Logs
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(wh)}
                          className="h-8 px-2.5 text-xs gap-1.5 rounded-lg border-border/50 hover:bg-muted/50"
                        >
                          <Settings2 size={12} />
                          Configure
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWebhookToDelete(wh)}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="Revoke Webhook"
                        >
                          <Trash2 size={13} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* URL bar */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/30 text-xs font-mono">
                      <Globe size={13} className="text-muted-foreground/70 shrink-0" />
                      <span className="truncate flex-1 select-all text-foreground font-medium">
                        {wh.url}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(wh.url, () => {
                            setCopiedUrlId(wh.id);
                            setTimeout(() => setCopiedUrlId(null), 2000);
                          })
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer shrink-0"
                        title="Copy destination URL"
                      >
                        {isCopiedUrl ? (
                          <Check className="size-3 text-primary" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    {/* Detail Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-border/10">
                      {/* Signing Secret */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Signing Secret
                        </span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono bg-muted/40 border border-border/30 px-2 py-0.5 rounded-md text-foreground font-medium truncate">
                            {isRevealed ? wh.secret : "whsec_••••••••••••••••"}
                          </code>
                          <button
                            type="button"
                            onClick={() => toggleSecretReveal(wh.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer"
                            title={isRevealed ? "Hide secret" : "Reveal secret"}
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(wh.secret, () => {
                                setCopiedId(wh.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              })
                            }
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer"
                            title="Copy signing secret"
                          >
                            {isCopiedSecret ? (
                              <Check size={13} className="text-primary" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Event */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Subscribed Event
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <CheckCircle2 size={13} className="text-primary shrink-0" />
                          <span>payment.succeeded</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Configured On
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} className="shrink-0 text-muted-foreground/60" />
                          <span>
                            {new Date(wh.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      {/* ── Add Webhook Dialog ───────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (open) {
            setWebhookUrl("");
            setSelectedPlanId(availablePlanOptions[0]?.id ?? "");
            setIsActiveToggle(true);
            setErrorMsg(null);
          }
        }}
      >
        <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Webhook className="size-4 text-primary" />
              Configure Webhook Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide an HTTPS URL to receive real-time JSON event alerts for a specific plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 min-w-0">
            {errorMsg && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl p-3">
                <AlertTriangle className="size-4 text-destructive shrink-0" />
                <AlertDescription className="text-xs text-destructive font-medium break-all">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            )}

            {/* Plan Dropdown */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-foreground">Subscription Plan</label>
              {availablePlanOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  All deployed plans currently have configured webhook endpoints.
                </p>
              ) : (
                <Select
                  value={selectedPlanId}
                  onValueChange={(val) => setSelectedPlanId(val ?? "")}
                >
                  <SelectTrigger className="w-full min-w-0 max-w-full h-8.5 text-xs bg-muted/20 border-border/40 rounded-lg overflow-hidden [&>[data-slot=select-value]]:truncate">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-4rem)] sm:max-w-md rounded-xl border-border/30 overflow-hidden">
                    {availablePlanOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs max-w-full overflow-hidden">
                        <span className="truncate block max-w-[280px] sm:max-w-[340px]">
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* URL Input */}
            <div className="space-y-1.5 min-w-0">
              <label htmlFor="create-url-input" className="text-xs font-semibold text-foreground">
                Destination URL
              </label>
              <Input
                id="create-url-input"
                type="url"
                placeholder="https://api.yourdomain.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full min-w-0 h-8.5 text-xs bg-muted/20 border-border/40 focus:border-foreground/40 rounded-lg font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Must be an HTTPS endpoint accepting POST requests with JSON payload.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
              disabled={isSubmitting}
              className="h-8.5 px-3 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateWebhook}
              disabled={isSubmitting || availablePlanOptions.length === 0 || !webhookUrl.trim()}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              {isSubmitting ? "Deploying…" : "Deploy Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Webhook Dialog ──────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              Modify Webhook Configuration
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the destination URL or toggle delivery active status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 min-w-0">
            {errorMsg && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl p-3">
                <AlertTriangle className="size-4 text-destructive shrink-0" />
                <AlertDescription className="text-xs text-destructive font-medium break-all">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            )}

            {/* Read-only Plan indicator */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-foreground">Assigned Subscription Plan</label>
              <div className="h-8.5 bg-muted/20 border border-border/40 px-3 rounded-lg flex items-center min-w-0 overflow-hidden">
                <span className="text-xs font-semibold text-foreground truncate block max-w-full">
                  {planTitleMap.get(selectedPlanId.toLowerCase()) ?? "Subscription Plan"}
                </span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-1.5 min-w-0">
              <label htmlFor="edit-url-input" className="text-xs font-semibold text-foreground">
                Destination URL
              </label>
              <Input
                id="edit-url-input"
                type="url"
                placeholder="https://api.yourdomain.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full min-w-0 h-8.5 text-xs bg-muted/20 border-border/40 focus:border-foreground/40 rounded-lg font-mono"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/20">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Endpoint Status</p>
                <p className="text-[11px] text-muted-foreground">
                  Instantly enable or pause notification delivery.
                </p>
              </div>
              <Button
                type="button"
                variant={isActiveToggle ? "default" : "outline"}
                size="sm"
                onClick={() => setIsActiveToggle(!isActiveToggle)}
                className="h-7 px-3 text-xs rounded-lg font-mono font-semibold"
              >
                {isActiveToggle ? "Active" : "Disabled"}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(false)}
              disabled={isSubmitting}
              className="h-8.5 px-3 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateWebhook}
              disabled={isSubmitting || !webhookUrl.trim()}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────── */}
      <Dialog
        open={!!webhookToDelete}
        onOpenChange={(open) => {
          if (!open) setWebhookToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              Revoke Webhook Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete the webhook for{" "}
              <strong className="text-foreground font-semibold">
                {webhookToDelete
                  ? planTitleMap.get(webhookToDelete.planId.toLowerCase()) ?? "Subscription Plan"
                  : ""}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed my-2">
            This action is permanent. Any checkout and renewal events for this plan will immediately cease dispatching to{" "}
            <span className="font-mono text-foreground font-medium break-all">{webhookToDelete?.url}</span>.
          </p>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWebhookToDelete(null)}
              className="h-8.5 px-3 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteWebhook}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
