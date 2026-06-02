import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Shield, Sparkles, Database, Lock, Key, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground font-sans">
      {/* Background radial glow effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#70717D]/10 to-transparent blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#70717D]/10 to-transparent blur-[120px] -z-10" />

      <main className="w-full max-w-4xl flex flex-col items-center text-center space-y-12 py-24 z-10 animate-fade-in">
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#70717D]/30 bg-[#70717D]/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-[#70717D] tracking-wide backdrop-blur-sm animate-pulse-subtle">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>Full-Stack Next.js 16 Auth Demo</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground sm:leading-[1.1]">
            Secure Authentication, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-[#70717D] bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            A premium full-stack demonstration combining the performance of Next.js 16, the security of Better Auth, and the scale of MongoDB Atlas.
          </p>
        </div>

        {/* Dynamic CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-sm mx-auto">
          {session ? (
            <div className="space-y-4 w-full">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Active Session: <span className="text-[#70717D] font-black lowercase">{session.user.email}</span>
              </p>
              <div className="flex items-center justify-center">
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-100 transition-all hover:scale-[1.02] shadow-xl shadow-white/5 cursor-pointer text-xs uppercase tracking-wider"
                  )}
                >
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-100 transition-all hover:scale-[1.02] shadow-xl shadow-white/5 cursor-pointer text-xs uppercase tracking-wider"
                )}
              >
                Create Account
                <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl border border-border/80 hover:bg-muted/50 transition-all hover:scale-[1.02] cursor-pointer text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                )}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-10 text-left">
          <Card className="border border-border bg-card/25 backdrop-blur-md p-6 hover:bg-card/45 hover:border-[#70717D]/30 hover:scale-[1.01] transition-all duration-300 shadow-2xl shadow-black/10 rounded-2xl">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#70717D]/10 text-[#70717D] border border-[#70717D]/20 shadow-inner">
                <Key className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-extrabold text-foreground tracking-tight">Better Auth</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fully loaded with secure hashing (scrypt), session cookie control, and pre-built REST endpoints.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/25 backdrop-blur-md p-6 hover:bg-card/45 hover:border-[#70717D]/30 hover:scale-[1.01] transition-all duration-300 shadow-2xl shadow-black/10 rounded-2xl">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#70717D]/10 text-[#70717D] border border-[#70717D]/20 shadow-inner">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-extrabold text-foreground tracking-tight">MongoDB Atlas</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
                State-of-the-art serverless persistence utilizing native mongo database mapping without configuration schema layers.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/25 backdrop-blur-md p-6 hover:bg-card/45 hover:border-[#70717D]/30 hover:scale-[1.01] transition-all duration-300 shadow-2xl shadow-black/10 rounded-2xl">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#70717D]/10 text-[#70717D] border border-[#70717D]/20 shadow-inner">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-extrabold text-foreground tracking-tight">Strict Guards</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Highly secure, async server-side page session checks to reliably block unauthorized requests.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
