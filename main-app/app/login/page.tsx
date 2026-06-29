"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { KeyRound, Wallet, Loader2, ShieldAlert, ShieldCheck, Sun, Moon } from "lucide-react";

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
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  
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
  const [activeTab, setActiveTab] = useState<"unlock" | "register">("unlock");

  const handleTabChange = (tab: "unlock" | "register") => {
    setActiveTab(tab);
    setErrorMsg(null);
  };

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background font-sans overflow-x-hidden relative">
      
      {/* LEFT SIDE: Full-bleed Visual Panel with Glassmorphic Overlay */}
      <div className="w-full lg:w-1/2 hidden lg:block relative overflow-hidden lg:h-screen bg-secondary/50 border-r border-border/40 transition-colors duration-300">
        
        {/* Full-bleed Globe Visual Showcase */}
        {mounted && (
          <Image
            src={globeImage}
            alt="ARCA Network Globe"
            fill
            priority
            unoptimized
            className="object-cover opacity-90 transition-opacity duration-500"
          />
        )}
        
        {/* Understated Dynamic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-background/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(94,190,255,0.015)_0%,transparent_70%)] pointer-events-none" />

        {/* Floating Brand Overlay */}
        <div className="absolute top-12 left-12 flex items-center gap-3 z-20">
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
          <span className="text-lg font-bold tracking-widest text-foreground uppercase font-sans">
            ARCA
          </span>
        </div>

        {/* Bottom Feature Card Overlaid on Image - Premium Glassmorphism */}
        <div className="absolute bottom-12 left-12 right-12 z-20 max-w-xl backdrop-blur-md bg-card/25 border border-border/10 rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans leading-snug">
                The Protocol for <br />
                Modern Payments.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                An engineering-grade infrastructure for USDC-native memberships, powered by Circle and the Arc blockchain.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-5 border-t border-border/10">
              <div>
                <div className="text-xs font-bold text-foreground tracking-wider uppercase">Passkeys</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">Device biometrics</div>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground tracking-wider uppercase">USDC Gas</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">Native gas execution</div>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground tracking-wider uppercase">CCTP Bridge</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">Official burn & mint</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Highly Polished Login Form Panel - Clean, Minimal & Flat */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 relative overflow-hidden bg-background lg:h-screen transition-colors duration-300">
        
        {/* Theme Toggle Button */}
        <div className="absolute top-8 right-8 z-30">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-background hover:bg-muted/60 text-foreground transition-colors duration-200 cursor-pointer shadow-sm"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        </div>

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
            <span className="text-lg font-bold tracking-widest text-foreground uppercase font-sans">
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
              <h2 className="text-2xl font-bold text-foreground tracking-tight font-sans">
                Sign in to your account
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Register or unlock your smart account with biometric passkeys
              </p>
            </div>

            {/* Tabs Selector - Premium Underline Navigation Design */}
            <div className="flex border-b border-border/60 w-full">
              <button
                type="button"
                onClick={() => handleTabChange("unlock")}
                disabled={isLoading}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer flex-1 text-center ${
                  activeTab === "unlock"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Unlock Account
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                disabled={isLoading}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer flex-1 text-center ${
                  activeTab === "register"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Register Device
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3.5 text-xs text-destructive flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Tab conditional views */}
            {activeTab === "unlock" ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center lg:text-left space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Unlock directly using your stored device credentials. Your passkey client resolves account identifiers automatically.
                  </p>
                </div>

                {/* Unlock Account Button - Premium Elevation */}
                <button
                  onClick={handleLogin}
                  disabled={!isReady || isLoading}
                  className="group relative w-full flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-foreground transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm hover:shadow cursor-pointer"
                >
                  {isLoading && activeAction === "login" ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Wallet className="h-4.5 w-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                  <span>Unlock Smart Account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center lg:text-left space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Choose a unique username to bind a new cryptographic passkey to this device and build your smart account.
                  </p>
                </div>

                {/* Username Input - Sleek Enclosed Input */}
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
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 shadow-inner"
                  />
                </div>

                {/* Create Account (Register) Button - High Contrast Premium */}
                <button
                  onClick={handleRegister}
                  disabled={!isReady || isLoading || !usernameInput.trim()}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary text-primary-foreground px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-primary/90 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 shadow-md shadow-primary/5 cursor-pointer"
                >
                  {isLoading && activeAction === "register" ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <KeyRound className="h-4.5 w-4.5" />
                  )}
                  <span>Register Device Passkey</span>
                </button>
              </div>
            )}

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
