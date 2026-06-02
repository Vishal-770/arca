"use client";

import Link from "next/link";
import { ArcaProvider, useArca } from "arca-sdk";
import { CreditCard, Loader2, AlertCircle, Tv } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLAN_ID = process.env.NEXT_PUBLIC_ARCA_PLAN_ID || "";
const API_KEY = process.env.NEXT_PUBLIC_ARCA_API_KEY || "";

function DashboardContentInner({ userId }: { userId: string }) {
  const { status, remainingSeconds, tierIds, loading, error } = useArca(PLAN_ID, userId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Checking subscription tier status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-destructive/20 bg-destructive/10 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive font-medium">Error loading subscription state: {error}</p>
      </Card>
    );
  }

  const isPlus = status === "ACTIVE" && remainingSeconds > 0 && tierIds?.includes("1");
  const isBasic = status === "ACTIVE" && remainingSeconds > 0 && tierIds?.includes("0") && !isPlus;
  const isProperTier = isPlus || isBasic;

  return (
    <div className="max-w-3xl mx-auto">
      {isProperTier ? (
        /* Subscribed state: Show active plan header and render the video directly */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <div className="space-y-1 text-left">
              <span className="text-[9px] font-bold text-[#70717D] uppercase tracking-[0.2em] block">Active Protocol Plan</span>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {isPlus ? "Plus Tier — 4K UHD Streaming" : "Basic Tier — Premium HD Streaming"}
              </h2>
            </div>
            <Link
              href="/billing"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex items-center gap-1.5 border border-border/80 cursor-pointer text-xs font-bold px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-200 shadow-none"
              )}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Billing
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border bg-black shadow-none">
            <video 
              controls 
              playsInline
              className="w-full aspect-video rounded-2xl outline-none animate-fade-in"
              autoPlay
              muted
              loop
            >
              <source 
                src={isPlus ? "/4k.mp4" : "/hd.mp4"} 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ) : (
        /* Unsubscribed state: Show clean unified lock card */
        <Card className="border border-border/80 bg-card/25 rounded-2xl p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto shadow-none hover:border-muted-foreground/30 transition-colors duration-200">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-center text-foreground shadow-none">
            <Tv className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-[#70717D] uppercase tracking-[0.2em] block">Active Protocol Plan</span>
            <h3 className="text-xl font-bold text-foreground tracking-tight">Free Tier — Locked</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Please subscribe to the Basic Tier or higher on <Link href="/billing" className="text-primary hover:underline font-semibold">`/billing`</Link> to unlock premium streaming access.
            </p>
          </div>

          <div className="pt-2">
            <Link 
              href="/billing"
              className={cn(
                buttonVariants({ variant: "default" }),
                "inline-flex items-center gap-2 cursor-pointer font-bold px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors duration-200 shadow-none text-xs uppercase tracking-wider font-extrabold"
              )}
            >
              <CreditCard className="h-4 w-4 shrink-0" />
              Subscribe on Billing
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export function DashboardContent({ userId }: { userId: string }) {
  return (
    <ArcaProvider apiKey={API_KEY}>
      <DashboardContentInner userId={userId} />
    </ArcaProvider>
  );
}
