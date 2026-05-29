"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { KeyRound, Wallet, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

// Skeleton fallback
function LoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-semibold uppercase italic tracking-wider text-muted-foreground animate-pulse">
          Loading Wallet Matrix...
        </span>
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, resolvedTheme } = useTheme();
  
  const {
    session,
    isReady,
    registerPasskey,
    loginWithPasskey,
  } = useCircleSDK();

  const [usernameInput, setUsernameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<"register" | "login" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch for theme-dependent assets
  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract redirect URL from query params
  const redirectTo = searchParams.get("redirect");

  // If already authenticated, go to redirect URL or default to dashboard
  useEffect(() => {
    if (session) {
      const destination = redirectTo || "/dashboard";
      router.replace(destination);
    }
  }, [session, router, redirectTo]);

  // Pre-fill username from local storage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("circle_username");
      if (stored) {
        setUsernameInput(stored);
      }
    }
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg("Please enter a username.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setActiveAction("register");

    try {
      await registerPasskey(usernameInput);
      router.replace(redirectTo || "/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("already")) {
        setErrorMsg("Username taken on this device. Try unlocking instead.");
      } else {
        setErrorMsg(msg || "Failed to register passkey. Try again.");
      }
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg("Please enter a username.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setActiveAction("login");

    try {
      await loginWithPasskey(usernameInput);
      router.replace(redirectTo || "/dashboard");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || "Biometrics unlock failed. Make sure your passkey is registered.");
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");
  const globeImage = isDark ? "/globe-dark.png" : "/globe-light.png";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background font-mulish overflow-x-hidden relative">
      
      {/* LEFT SIDE: Strict 50% Full-bleed Visual Panel */}
      <div className="w-full lg:w-1/2 hidden lg:block relative overflow-hidden lg:h-screen bg-slate-50 dark:bg-zinc-950 border-r border-border/40 transition-colors duration-300">
        
        {/* Full-bleed Globe Visual Showcase - Flat (No scale, no spin) */}
        {mounted && (
          <Image
            src={globeImage}
            alt="ARCA Network Globe"
            fill
            priority
            unoptimized
            className="object-cover opacity-90"
          />
        )}
        
        {/* Understated Dynamic Vignette Overlay (Uses semantic background variables) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-background/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(94,190,255,0.02)_0%,transparent_70%)] pointer-events-none" />

        {/* Floating Brand Overlay */}
        <div className="absolute top-12 left-12 flex items-center gap-3.5 z-20">
          <div className="relative w-9 h-9">
            <Image 
              src="/logo.png" 
              alt="ARCA Logo" 
              fill
              priority
              unoptimized
              className="object-contain dark:invert"
            />
          </div>
          <span className="text-xl font-bold uppercase tracking-wider text-foreground font-sans">
            ARCA
          </span>
        </div>

        {/* Bottom Feature Card Overlaid on Image - Elegant Borderless Line */}
        <div className="absolute bottom-12 left-12 right-12 z-20 max-w-xl border-t border-border/40 pt-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground font-sans leading-snug">
                The Protocol for <br />
                Modern Payments.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                An engineering-grade infrastructure for USDC-native memberships, powered by Circle and the Arc blockchain.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-5 border-t border-border/40">
              <div>
                <div className="text-xs font-semibold text-foreground tracking-wider uppercase font-sans">Passkeys</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">Device biometrics</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground tracking-wider uppercase font-sans">USDC Gas</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">Native gas execution</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground tracking-wider uppercase font-sans">CCTP Bridge</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">Official burn & mint</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Strict 50% Highly Polished Login Form Panel - Clean & Flat */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 relative overflow-hidden bg-background lg:h-screen">
        
        {/* Mobile Header: Logo + App Name */}
        <div className="flex items-center justify-between lg:hidden z-20 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="ARCA Logo" 
                fill
                priority
                unoptimized
                className="object-contain dark:invert"
              />
            </div>
            <span className="text-xl font-bold uppercase tracking-wider text-foreground font-sans">
              ARCA
            </span>
          </div>
        </div>

        {/* Spacer for large screens to keep content beautifully centered */}
        <div className="hidden lg:block h-8" />

        {/* Centered Login Form - Pure Flat Modern Design */}
        <div className="w-full max-w-[360px] mx-auto my-auto z-20">
          <div className="space-y-8">
            
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight font-sans">
                Sign in to your account
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Register or unlock your smart account with biometric passkeys
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3.5 text-xs text-destructive flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Username Input - Sleek Bottom Line Only */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="e.g. alice, merchant.arca"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isLoading}
                autoComplete="username"
                className="w-full border-b border-border bg-transparent px-2 py-3.5 text-base text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground transition-colors duration-200"
              />
            </div>

            <div className="flex flex-col gap-4 pt-2">
              {/* Unlock Account (Login) */}
              <button
                onClick={handleLogin}
                disabled={!isReady || isLoading || !usernameInput.trim()}
                className="group relative w-full flex items-center justify-center gap-3 rounded-full border border-border bg-background hover:bg-primary/5 hover:border-primary/40 px-6 py-3.5 text-sm font-bold text-foreground transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.99] cursor-pointer"
              >
                {isLoading && activeAction === "login" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
                <span>Unlock Smart Account</span>
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-widest">
                  <span className="bg-background px-3 text-muted-foreground/60">New Device?</span>
                </div>
              </div>

              {/* Create Account (Register) */}
              <button
                onClick={handleRegister}
                disabled={!isReady || isLoading || !usernameInput.trim()}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-bold hover:bg-primary/95 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.99] cursor-pointer shadow-sm shadow-primary/10"
              >
                {isLoading && activeAction === "register" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <KeyRound className="h-5 w-5" />
                )}
                <span>Register Device Passkey</span>
              </button>
            </div>

            {/* Sponsorship Badge */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                <span className="bg-background px-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sponsored & Secured by Circle MSCA
                </span>
              </div>
            </div>

            {/* Legal Notice */}
            <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
              By entering and unlocking you agree to Arca&apos;s{" "}
              <a
                href="https://www.circle.com/en/legal/user-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground hover:underline transition-colors"
              >
                User Terms
              </a>
              {" "}and{" "}
              <a
                href="https://www.circle.com/en/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-foreground hover:underline transition-colors"
              >
                Privacy Rules
              </a>
            </p>

          </div>
        </div>

        {/* Footer: Legal Link placeholder on bottom */}
        <div className="w-full text-center pt-8 z-20">
          <p className="text-[11px] text-muted-foreground/40">
            © {new Date().getFullYear()} Arca. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
