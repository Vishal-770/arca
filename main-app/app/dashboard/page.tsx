"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Plus, ExternalLink,
  TrendingUp, Activity, Wallet, Users, DollarSign, Zap,
} from "lucide-react";

function useCssColors() {
  return useMemo(() => {
    if (typeof window === "undefined") return { primary: "#5EBEFF", muted: "#64748b" };
    const resolve = (v: string) => {
      const el = document.createElement("div");
      el.style.color = `var(${v})`;
      el.style.display = "none";
      document.body.appendChild(el);
      const rgb = getComputedStyle(el).color;
      document.body.removeChild(el);
      return rgb || "#5EBEFF";
    };
    return { primary: resolve("--primary"), muted: resolve("--muted-foreground") };
  }, []);
}

type AnalyticsResponse = {
  sellerMetrics: { planCount: number; activePlanCount: number; subscriptionCount: number; totalGrossRevenue: string; totalNetRevenue: string; totalFeeContributed: string } | null;
  buyerMetrics: { subscriptionCount: number; activeSubscriptionCount: number; totalSpent: string; totalFeesPaid: string } | null;
  topPlans: Array<{ id: string; subscriptionCount: number; totalGrossVolume: string; netRevenue: string; active: boolean; tiers?: { tierId: string; price: string; label: string }[]; metadata: { name?: string; brand?: { name?: string } } | null }>;
  recentSubscriptions: Array<{ id: string; subscriber: string; seller: string; planId: string; tierId: string; tier: { label: string; price: string } | null; totalAmount: string; feeAmount: string; blockTimestamp: string }>;
  revenueHistory?: Array<{ date: string; revenue: string }>;
  monthlyStats?: Array<{ id: string; monthStartTimestamp: string; plansCreated: number; subscriptionsCreated: number; totalGrossVolume: string; totalFeesCollected: string }>;
  transactions?: Array<{ id: string; type: string; from: string; to: string | null; amount: string | null; fee: string | null; plan: { id: string } | null; blockTimestamp: string }>;
};

const fmt = (v: string | null | undefined) =>
  Number(formatUnits(v ?? "0", 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trunc = (v: string) => `${v.slice(0, 6)}…${v.slice(-4)}`;
const TX_LABELS: Record<string, string> = {
  SUBSCRIBE: "Subscribe", CREATE_PLAN: "Plan Created",
  UPDATE_PLAN: "Plan Updated", WITHDRAW: "Withdraw", SET_FEE: "Fee Update",
};

/* ─── Stat Card ─── */
function StatCard({ label, value, sub, icon: Icon, loading, accent = false }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean; accent?: boolean;
}) {
  return (
    <div className={cn("rounded-xl px-5 py-4 flex flex-col gap-2", accent ? "bg-primary/10" : "bg-muted/30")}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", accent ? "text-primary" : "text-muted-foreground/40")} />
      </div>
      {loading ? <Skeleton className="h-7 w-24 mt-1" /> : (
        <p className="text-2xl font-black font-mono leading-none">{value}</p>
      )}
      {loading ? <Skeleton className="h-3 w-16" /> : (
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

/* ─── Panel wrapper (gives every section a consistent block) ─── */
function Panel({ title, action, children, className }: {
  title: string; action?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ─── Separator ─── */
const Sep = () => <div className="border-t border-border/40" />;

/* ─── Metric Row ─── */
function MetricRow({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-border/20 last:border-0">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>
      {loading ? <Skeleton className="h-3.5 w-16" /> : <span className="text-sm font-mono font-bold">{value}</span>}
    </div>
  );
}

/* ─── Scrollable list wrapper ─── */
function ScrollList({ height, children }: { height: number; children: React.ReactNode }) {
  return <div style={{ height }} className="overflow-y-auto pr-0.5">{children}</div>;
}

/* ─── Empty ─── */
function Empty({ text }: { text: string }) {
  return <div className="flex items-center justify-center h-full text-xs text-muted-foreground text-center px-4">{text}</div>;
}

export default function DashboardOverviewPage() {
  const { wallet, sessionUserToken } = useDashboardContext();
  const clr = useCssColors();

  const tooltipStyle = {
    background: "var(--popover)", border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 11, color: "var(--foreground)", padding: "8px 12px",
  };

  const { data: analytics = null, isLoading: loading } = useQuery<AnalyticsResponse>({
    queryKey: ["dashboardAnalytics", wallet?.address, sessionUserToken],
    queryFn: async () => {
      if (!wallet?.address || !sessionUserToken) return null as unknown as AnalyticsResponse;
      const p = new URLSearchParams({ seller: wallet.address, subscriber: wallet.address, userToken: sessionUserToken });
      const res = await fetch(`/api/subscription/analytics?${p.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!wallet?.address && !!sessionUserToken,
    refetchInterval: 15000, refetchOnWindowFocus: true,
  });

  const tokenBalances = wallet?.tokenBalances ?? [];
  let usdcToken = tokenBalances.find(t => t.symbol.toUpperCase() === "USDC");
  if (!usdcToken) usdcToken = tokenBalances.find(t => t.symbol.toUpperCase().includes("USDC"));
  if (!usdcToken && wallet?.blockchain === "ARC-TESTNET") usdcToken = tokenBalances.find(t => t.isNative);
  const usdcBalance = usdcToken ? Number(usdcToken.amount).toFixed(2) : "0.00";

  const revenueChart = useMemo(() =>
    (analytics?.revenueHistory ?? []).map(e => ({ d: e.date.slice(5), v: Number(formatUnits(e.revenue, 6)) })),
    [analytics?.revenueHistory]);

  const monthlyChart = useMemo(() =>
    [...(analytics?.monthlyStats ?? [])].reverse().map(e => ({
      m: new Date(Number(e.monthStartTimestamp) * 1000).toLocaleDateString("en", { month: "short" }),
      vol: Number(formatUnits(e.totalGrossVolume, 6)),
      subs: e.subscriptionsCreated,
    })), [analytics?.monthlyStats]);

  const s = analytics?.sellerMetrics;
  const b = analytics?.buyerMetrics;
  const thisMonth = (analytics?.monthlyStats ?? [])[0];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight">Overview</h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-50 truncate max-w-[260px]">{wallet?.address ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />{wallet?.blockchain ?? "—"}
          </span>
          <Link href="/dashboard/plans/create" className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5 text-xs font-bold h-8 px-4 rounded-xl")}>
            <Plus className="h-3.5 w-3.5" /> New Plan
          </Link>
        </div>
      </div>

      {/* ── Row 1: 4 Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="USDC Balance" value={`$${usdcBalance}`} sub="Available in wallet" icon={Wallet} loading={loading} accent />
        <StatCard label="Net Revenue" value={`$${fmt(s?.totalNetRevenue)}`} sub={`${fmt(s?.totalGrossRevenue)} gross`} icon={DollarSign} loading={loading} />
        <StatCard label="Subscribers" value={String(s?.subscriptionCount ?? 0)} sub={`${s?.activePlanCount ?? 0} of ${s?.planCount ?? 0} plans active`} icon={Users} loading={loading} />
        <StatCard label="Total Spent" value={`$${fmt(b?.totalSpent)}`} sub={`${b?.activeSubscriptionCount ?? 0} active subscriptions`} icon={Zap} loading={loading} />
      </div>

      <Sep />

      {/* ── Row 2: Revenue Chart (main) + This Month stats (sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">

        {/* Revenue chart */}
        <Panel
          title="30-Day Revenue"
          action={
            <div className="flex items-center gap-1.5 text-primary text-[11px] font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              {loading ? <Skeleton className="h-3 w-16" /> : <span>${fmt(s?.totalNetRevenue)} net</span>}
            </div>
          }
        >
          {loading ? <Skeleton className="h-[180px] w-full rounded-xl" /> : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={clr.primary} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={clr.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="d" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: clr.muted }} interval={4} />
                  <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{ fill: clr.muted }} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: clr.primary, strokeWidth: 1, strokeDasharray: "3 3" }} formatter={v => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]} />
                  <Area type="monotone" dataKey="v" stroke={clr.primary} strokeWidth={2} fill="url(#rg)" dot={false} activeDot={{ r: 4, fill: clr.primary, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* This Month — compact vertical stats */}
        <Panel title="This Month">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : thisMonth ? (
            <>
              <MetricRow label="Volume"    value={`$${fmt(thisMonth.totalGrossVolume)}`}  loading={loading} />
              <MetricRow label="New Subs"  value={String(thisMonth.subscriptionsCreated)} loading={loading} />
              <MetricRow label="New Plans" value={String(thisMonth.plansCreated)}          loading={loading} />
              <MetricRow label="Fees"      value={`$${fmt(thisMonth.totalFeesCollected)}`} loading={loading} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No data this month</p>
          )}
          <div className="border-t border-border/20 mt-3 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Your Spending</p>
            <MetricRow label="Spent"       value={`$${fmt(b?.totalSpent)}`}                loading={loading} />
            <MetricRow label="Active Subs" value={String(b?.activeSubscriptionCount ?? 0)} loading={loading} />
            <MetricRow label="Fees Paid"   value={`$${fmt(b?.totalFeesPaid)}`}            loading={loading} />
          </div>
        </Panel>

      </div>

      <Sep />

      {/* ── Row 3: Monthly Volume + Top Plans ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">

        {/* Monthly bar chart */}
        <Panel
          title="Monthly Volume"
          action={
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm inline-block" style={{ background: clr.primary, opacity: 0.85 }} /> Volume
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm inline-block" style={{ background: clr.muted, opacity: 0.5 }} /> Subs
              </span>
            </div>
          }
        >
          <p className="text-[11px] text-muted-foreground -mt-2 mb-4">12-month gross USDC &amp; subscription metrics</p>
          {loading ? <Skeleton className="h-[160px] w-full rounded-xl" /> : (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChart} barSize={9} barGap={3} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="m" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: clr.muted }} />
                  <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{ fill: clr.muted }} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: clr.muted, opacity: 0.06 }}
                    formatter={(v, name) => {
                      const num = Number(v ?? 0);
                      return [name === "vol" ? `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : num, name === "vol" ? "Volume" : "Subscriptions"];
                    }}
                  />
                  <Bar dataKey="vol" fill={clr.primary} radius={[3, 3, 0, 0]} opacity={0.85} />
                  <Bar dataKey="subs" fill={clr.muted} radius={[3, 3, 0, 0]} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Top Plans */}
        <Panel
          title="Top Plans"
          action={
            <Link href="/dashboard/my-plans" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
              All →
            </Link>
          }
        >
          <ScrollList height={192}>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}</div>
            ) : (analytics?.topPlans ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
                <p className="text-xs text-muted-foreground">No plans yet</p>
                <Link href="/dashboard/plans/create" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs h-7 rounded-xl")}>
                  <Plus className="h-3 w-3 mr-1" /> Create
                </Link>
              </div>
            ) : (
              <div>
                {(analytics?.topPlans ?? []).map((plan, i) => {
                  const name = plan.metadata?.brand?.name ?? plan.metadata?.name ?? trunc(plan.id);
                  return (
                    <Link key={plan.id} href={`/dashboard/my-plans/${plan.id}`}
                      className="flex items-center gap-2.5 py-2.5 border-b border-border/15 last:border-0 hover:bg-muted/20 -mx-1 px-1 rounded transition-colors group">
                      <span className="text-[10px] text-muted-foreground font-mono w-3 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{plan.subscriptionCount} subs</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-mono font-bold">${fmt(plan.netRevenue)}</p>
                        <p className={cn("text-[9px] font-black uppercase", plan.active ? "text-primary" : "text-muted-foreground/40")}>{plan.active ? "live" : "off"}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollList>
        </Panel>

      </div>

      <Sep />

      {/* ── Row 4: Transactions (main) + Recent Events (sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">

        {/* Recent Transactions */}
        <Panel
          title="Recent Transactions"
          action={
            <Link href="/dashboard/subscriptions" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              All <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          }
        >
          <ScrollList height={220}>
            {loading ? (
              <div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-border/15 last:border-0">
                    <Skeleton className="h-3 w-20" /><Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-3 w-14" /><Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            ) : (analytics?.transactions ?? []).length === 0 ? (
              <Empty text="No transactions yet. Transactions will appear here once you create a plan and receive payments." />
            ) : (
              <div>
                {(analytics?.transactions ?? []).slice(0, 20).map(tx => {
                  const isIn = tx.to?.toLowerCase() === wallet?.address?.toLowerCase();
                  const label = TX_LABELS[tx.type] ?? tx.type;
                  return (
                    <div key={tx.id} className="grid grid-cols-[120px_1fr_auto_auto] items-center gap-4 py-3 border-b border-border/15 last:border-0 hover:bg-muted/10 -mx-1 px-1 rounded transition-colors">
                      <div>
                        <p className="text-xs font-semibold leading-none">{label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">{trunc(tx.from)}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{tx.plan ? trunc(tx.plan.id) : "—"}</p>
                      {tx.amount ? (
                        <div className={cn("flex items-center gap-0.5 text-xs font-mono font-bold", isIn ? "text-primary" : "text-muted-foreground")}>
                          {isIn ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          ${fmt(tx.amount)}
                        </div>
                      ) : <span />}
                      <p className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {new Date(Number(tx.blockTimestamp) * 1000).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollList>
        </Panel>

        {/* Recent Events */}
        <Panel
          title="Recent Events"
          action={<Activity className="h-3.5 w-3.5 text-muted-foreground/40" />}
        >
          <ScrollList height={220}>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}</div>
            ) : (analytics?.recentSubscriptions ?? []).length === 0 ? (
              <Empty text="No events in the last 30 days." />
            ) : (
              <div>
                {(analytics?.recentSubscriptions ?? []).slice(0, 15).map(sub => {
                  const isSale = sub.seller.toLowerCase() === wallet?.address?.toLowerCase();
                  return (
                    <div key={sub.id} className="flex items-center gap-2.5 py-2.5 border-b border-border/15 last:border-0">
                      <div className={cn("shrink-0 h-1.5 w-1.5 rounded-full mt-0.5", isSale ? "bg-primary" : "bg-muted-foreground/30")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-muted-foreground truncate">{trunc(sub.subscriber)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] uppercase font-black tracking-wider text-primary/60">{sub.tier?.label ?? `#${sub.tierId}`}</span>
                          <span className="text-[9px] text-muted-foreground/40">
                            {new Date(Number(sub.blockTimestamp) * 1000).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <p className={cn("text-[11px] font-mono font-bold shrink-0 tabular-nums", isSale ? "text-primary" : "text-muted-foreground")}>
                        {isSale ? "+" : ""}{fmt(sub.totalAmount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollList>
        </Panel>

      </div>


    </div>
  );
}
