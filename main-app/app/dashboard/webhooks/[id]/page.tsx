"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Webhook,
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  Globe,
  Layers,
  CheckCircle2,
  Settings2,
  RefreshCw,
  ExternalLink,
  FileText,
  Terminal,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

type WebhookLog = {
  id: string;
  webhookEndpointId?: string;
  userId: string;
  planId: string;
  url: string;
  event: string;
  payload: any;
  status: number;
  statusText?: string;
  responseBody?: string;
  durationMs: number;
  txHash?: string;
  timestamp: string;
};

type UserPlanInfo = {
  planId: string;
  duration: string;
  active: boolean;
  metadata: {
    name?: string;
    brand?: { name?: string };
  } | null;
};

export default function WebhookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const webhookId = params.id as string;

  const { sessionUserToken, wallet } = useDashboardContext();

  const [webhook, setWebhook] = useState<WebhookEndpoint | null>(null);
  const [plans, setPlans] = useState<UserPlanInfo[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);

  const [loadingWebhook, setLoadingWebhook] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [refreshingLogs, setRefreshingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editOpen, setEditOpen] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inspection modal state
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  // UX states
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Fetch this specific webhook
  const fetchWebhook = async () => {
    try {
      setLoadingWebhook(true);
      setError(null);
      const res = await fetch(`/api/webhooks?id=${encodeURIComponent(webhookId)}`);
      if (!res.ok) {
        throw new Error("Webhook endpoint not found");
      }
      const data = await res.json();
      if (data.webhook) {
        setWebhook(data.webhook);
        setEditUrl(data.webhook.url);
        setEditIsActive(data.webhook.isActive);
      } else {
        throw new Error("Webhook data is missing");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load webhook");
    } finally {
      setLoadingWebhook(false);
    }
  };

  // Fetch delivery logs for this specific webhook
  const fetchLogs = async (silent = false) => {
    if (!silent) setLoadingLogs(true);
    else setRefreshingLogs(true);
    try {
      const res = await fetch(`/api/webhooks/logs?endpointId=${encodeURIComponent(webhookId)}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoadingLogs(false);
      setRefreshingLogs(false);
    }
  };

  // Fetch plans to display associated plan metadata
  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/subscription/my-plans");
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  };

  useEffect(() => {
    if (sessionUserToken && webhookId) {
      void fetchWebhook();
      void fetchLogs();
      void fetchPlans();
    }
  }, [sessionUserToken, webhookId]);

  const planTitle = useMemo(() => {
    if (!webhook) return "Subscription Plan";
    const found = plans.find((p) => p.planId.toLowerCase() === webhook.planId.toLowerCase());
    return found?.metadata?.name ?? found?.metadata?.brand?.name ?? `Plan ${webhook.planId.slice(0, 8)}`;
  }, [webhook, plans]);

  const copyToClipboard = (text: string, onSuccess: () => void) => {
    navigator.clipboard.writeText(text);
    onSuccess();
  };

  const handleUpdateWebhook = async () => {
    if (!webhook || !editUrl.trim()) return;

    try {
      const parsedUrl = new URL(editUrl.trim());
      if (parsedUrl.protocol !== "https:") {
        setEditError("Destination URL must use HTTPS protocol.");
        return;
      }
    } catch {
      setEditError("Please enter a valid absolute URL (e.g. https://api.yourdomain.com/webhooks).");
      return;
    }

    setIsSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch("/api/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: webhook.id,
          url: editUrl.trim(),
          planId: webhook.planId,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to update webhook");
      }

      setEditOpen(false);
      void fetchWebhook();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhook) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/webhooks?id=${encodeURIComponent(webhook.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/webhooks");
      } else {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete webhook");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete webhook");
      setIsDeleting(false);
    }
  };

  // Metric stats
  const stats = useMemo(() => {
    const totalDeliveries = logs.length;
    const successfulDeliveries = logs.filter((l) => l.status >= 200 && l.status < 300).length;
    const successRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 100;
    const avgLatency =
      totalDeliveries > 0
        ? Math.round(logs.reduce((acc, l) => acc + (l.durationMs || 0), 0) / totalDeliveries)
        : 0;

    return {
      totalDeliveries,
      successRate,
      avgLatency,
    };
  }, [logs]);

  if (loadingWebhook) {
    return (
      <div className="py-24 text-center rounded-xl border border-border/20 bg-muted/10">
        <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase tracking-widest">
          Loading webhook details…
        </p>
      </div>
    );
  }

  if (error || !webhook) {
    return (
      <div className="py-16 text-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 max-w-md mx-auto space-y-4">
        <AlertTriangle className="size-8 text-destructive mx-auto" />
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Webhook Not Found</h2>
          <p className="text-xs text-muted-foreground">{error ?? "This webhook endpoint could not be loaded."}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-lg">
          <Link href="/dashboard/webhooks">Back to Webhooks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Breadcrumb & Top Header ────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/webhooks"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Webhooks</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{planTitle}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-md",
                  webhook.isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border/30"
                )}
              >
                {webhook.isActive ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Endpoint ID: <span className="font-mono text-foreground">{webhook.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditUrl(webhook.url);
                setEditIsActive(webhook.isActive);
                setEditError(null);
                setEditOpen(true);
              }}
              className="h-8.5 px-3 text-xs gap-1.5 rounded-lg border-border/50 hover:bg-muted/50"
            >
              <Settings2 size={13} />
              Configure
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="h-8.5 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <Trash2 size={13} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Endpoint Status */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Status
            </span>
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {webhook.isActive ? "Active" : "Disabled"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {webhook.isActive ? "Listening for checkout events" : "Notification deliveries paused"}
            </p>
          </div>
        </div>

        {/* Deliveries Count */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Deliveries
            </span>
            <Terminal className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.totalDeliveries}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Logged execution dispatches
            </p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Delivery Success
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.totalDeliveries > 0 ? `${stats.successRate}%` : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {stats.avgLatency > 0 ? `Avg Latency: ${stats.avgLatency}ms` : "No latency data yet"}
            </p>
          </div>
        </div>

        {/* Event Type */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Event Trigger
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
      </div>

      {/* ── Webhook Configuration Details Card ─────────────────── */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Configuration & Credentials
        </h2>

        {/* Destination URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Destination Target URL</label>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/30 text-xs font-mono">
            <Globe size={13} className="text-muted-foreground/70 shrink-0" />
            <span className="truncate flex-1 select-all text-foreground font-medium">
              {webhook.url}
            </span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(webhook.url, () => {
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                })
              }
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer shrink-0"
              title="Copy destination URL"
            >
              {copiedUrl ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Signing Secret & Plan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/10">
          {/* Signing Secret */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Signing Secret (HMAC)</label>
            <div className="flex items-center gap-1.5">
              <code className="text-xs font-mono bg-muted/40 border border-border/30 px-2.5 py-1 rounded-lg text-foreground font-medium truncate flex-1">
                {isSecretRevealed ? webhook.secret : "whsec_••••••••••••••••••••••••"}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSecretRevealed(!isSecretRevealed)}
                className="h-8 px-2.5 text-xs rounded-lg border-border/40 hover:bg-muted"
                title={isSecretRevealed ? "Hide Secret" : "Reveal Secret"}
              >
                {isSecretRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(webhook.secret, () => {
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  })
                }
                className="h-8 px-2.5 text-xs rounded-lg border-border/40 hover:bg-muted"
                title="Copy Secret"
              >
                {copiedSecret ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              </Button>
            </div>
          </div>

          {/* Associated Plan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Associated Subscription Gate</label>
            <div className="h-8 px-3 rounded-lg bg-muted/20 border border-border/30 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground truncate">{planTitle}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{webhook.planId.slice(0, 10)}…</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Webhook Delivery Logs ───────────────────────────────── */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              Delivery Activity Logs
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live delivery attempts and status history dispatched to this destination URL.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(true)}
            disabled={refreshingLogs || loadingLogs}
            className="h-8 px-3 text-xs gap-1.5 rounded-lg border-border/60 hover:bg-muted/50 self-start sm:self-auto"
          >
            <RefreshCw size={12} className={refreshingLogs ? "animate-spin" : ""} />
            {refreshingLogs ? "Refreshing…" : "Refresh Logs"}
          </Button>
        </div>

        {loadingLogs ? (
          <div className="py-12 text-center rounded-xl border border-border/20 bg-muted/10">
            <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase tracking-widest">
              Loading activity logs…
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-border/40 bg-muted/20 p-6">
            <Clock size={22} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">No delivery logs for this webhook</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
              Events will be dispatched and logged here automatically once checkout transactions occur on this plan.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/30 bg-background/50 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-muted/40 border-b border-border/20">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pl-4 w-[110px]">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[180px]">
                      Event / Method
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3">
                      Destination URL
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[180px]">
                      Time / Latency
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pr-4 text-right w-[140px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const isSuccess = log.status >= 200 && log.status < 300;
                    const formattedTime = new Date(log.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    });
                    const formattedDate = new Date(log.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="py-3 pl-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold",
                              isSuccess
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {log.status === 0 ? "FAILED" : log.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-foreground">{log.event}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">POST</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 max-w-[240px]">
                          <span
                            className="text-xs font-mono text-muted-foreground truncate block select-all"
                            title={log.url}
                          >
                            {log.url}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 text-xs text-muted-foreground">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {formattedDate}, {formattedTime}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {log.durationMs}ms latency
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {log.txHash && (
                              <a
                                href={`https://testnet.arcscan.app/tx/${log.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="View transaction on ArcScan"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                              className="h-7 px-2.5 text-xs rounded-lg gap-1 border-border/50 hover:bg-muted/50"
                            >
                              <FileText size={11} />
                              Inspect
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
        )}
      </div>

      {/* ── Edit Webhook Dialog ──────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              Modify Webhook Configuration
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update destination URL or toggle endpoint delivery active status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 min-w-0">
            {editError && (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl p-3">
                <AlertTriangle className="size-4 text-destructive shrink-0" />
                <AlertDescription className="text-xs text-destructive font-medium break-all">
                  {editError}
                </AlertDescription>
              </Alert>
            )}

            {/* Read-only Plan indicator */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold text-foreground">Assigned Subscription Plan</label>
              <div className="h-8.5 bg-muted/20 border border-border/40 px-3 rounded-lg flex items-center min-w-0 overflow-hidden">
                <span className="text-xs font-semibold text-foreground truncate block max-w-full">
                  {planTitle}
                </span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-1.5 min-w-0">
              <label htmlFor="detail-edit-url-input" className="text-xs font-semibold text-foreground">
                Destination URL
              </label>
              <Input
                id="detail-edit-url-input"
                type="url"
                placeholder="https://api.yourdomain.com/webhooks"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
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
                variant={editIsActive ? "default" : "outline"}
                size="sm"
                onClick={() => setEditIsActive(!editIsActive)}
                className="h-7 px-3 text-xs rounded-lg font-mono font-semibold"
              >
                {editIsActive ? "Active" : "Disabled"}
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
              disabled={isSubmitting || !editUrl.trim()}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Webhook Dialog ─────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              Revoke Webhook Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete the webhook for{" "}
              <strong className="text-foreground font-semibold">{planTitle}</strong>?
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed my-2">
            This action is permanent. Any checkout and renewal events for this plan will immediately cease dispatching to{" "}
            <span className="font-mono text-foreground font-medium break-all">{webhook.url}</span>.
          </p>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              className="h-8.5 px-3 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteWebhook}
              disabled={isDeleting}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              {isDeleting ? "Deleting…" : "Delete Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Log Inspection Dialog ─────────────────────────────────── */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto flex flex-col p-6 rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="pb-3 border-b border-border/30 shrink-0 text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Terminal size={15} className="text-primary" />
              Delivery Inspection Detail
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Event ID:{" "}
              <span className="font-mono text-foreground font-semibold">
                {selectedLog?.payload?.id || "N/A"}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-3 flex-1 min-h-0 overflow-y-auto text-left">
              {/* Delivery stats strip */}
              <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/20">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Response Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        selectedLog.status >= 200 && selectedLog.status < 300
                          ? "bg-primary"
                          : "bg-destructive"
                      )}
                    />
                    <span className="text-xs font-bold text-foreground">
                      {selectedLog.status === 0
                        ? "Failed / Timeout"
                        : `${selectedLog.status} ${selectedLog.statusText ?? ""}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Latency
                  </span>
                  <p className="text-xs font-bold text-foreground mt-0.5 font-mono">
                    {selectedLog.durationMs}ms
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Timestamp
                  </span>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5 font-mono">
                    {new Date(selectedLog.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Destination & Tx info */}
              <div className="space-y-2 bg-muted/20 p-3.5 rounded-xl border border-border/20 text-xs">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground font-medium">Destination URL</span>
                  <span className="font-mono text-foreground break-all select-all font-semibold text-right max-w-[70%]">
                    {selectedLog.url}
                  </span>
                </div>
                <Separator className="my-1.5 opacity-40" />
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground font-medium">Signature Method</span>
                  <span className="text-foreground font-semibold font-mono">HMAC-SHA256 (t, v1)</span>
                </div>
                <Separator className="my-1.5 opacity-40" />
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground font-medium">On-Chain Tx Hash</span>
                  {selectedLog.txHash ? (
                    <a
                      href={`https://testnet.arcscan.app/tx/${selectedLog.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline flex items-center gap-1 font-semibold truncate max-w-[70%]"
                    >
                      {selectedLog.txHash.slice(0, 16)}...
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-muted-foreground font-mono">None</span>
                  )}
                </div>
              </div>

              {/* Request JSON payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Terminal size={11} />
                    Request Payload (Body JSON)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(JSON.stringify(selectedLog.payload, null, 2))
                    }
                    className="h-6 px-2 text-[11px] rounded-lg gap-1 border border-border/40 hover:bg-muted"
                    title="Copy payload"
                  >
                    <Copy size={10} />
                    Copy
                  </Button>
                </div>
                <pre className="text-[11px] font-mono p-3 bg-muted/20 border border-border/30 rounded-xl overflow-x-auto max-h-52 leading-relaxed select-all text-foreground">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              {/* Response Body */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText size={11} />
                  Response Body (Merchant Server Output)
                </label>
                <div className="p-3 bg-muted/20 border border-border/30 rounded-xl max-h-32 overflow-y-auto select-all">
                  {selectedLog.responseBody ? (
                    <pre className="text-[11px] font-mono whitespace-pre-wrap break-all leading-normal text-muted-foreground">
                      {selectedLog.responseBody}
                    </pre>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No response body returned from destination server.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2 pt-3 border-t border-border/20 shrink-0">
            <Button
              onClick={() => setSelectedLog(null)}
              className="w-full sm:w-auto h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
