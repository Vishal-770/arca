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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground font-sans">
      <main className="w-full max-w-4xl flex flex-col items-center text-center space-y-12 py-24 z-10 animate-fade-in">
        {/* Top pill badge: Sophisticated & Minimal */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 text-xs font-semibold text-muted-foreground tracking-wide">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>Full-Stack Next.js 16 Auth Demo</span>
        </div>

        {/* Hero Section: Flat and highly legible */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground sm:leading-[1.15]">
            Secure Authentication, Made Simple
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            A premium full-stack demonstration combining the performance of Next.js 16, the security of Better Auth, and the scale of MongoDB Atlas.
          </p>
        </div>

        {/* Dynamic CTA Section: Clean solid buttons with color-only transitions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-sm mx-auto">
          {session ? (
            <div className="space-y-4 w-full">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Active Session: <span className="text-[#70717D] font-bold lowercase">{session.user.email}</span>
              </p>
              <div className="flex items-center justify-center">
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "inline-flex items-center gap-1.5 font-bold px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors duration-200 cursor-pointer text-xs uppercase tracking-wider"
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
                  "w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-bold px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors duration-200 cursor-pointer text-xs uppercase tracking-wider"
                )}
              >
                Create Account
                <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto inline-flex items-center justify-center font-bold px-5 py-2.5 rounded-xl border border-border bg-transparent hover:bg-muted/40 transition-colors duration-200 cursor-pointer text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                )}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid: Flat, clean solid border cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-10 text-left">
          <Card className="border border-border bg-card/25 p-6 hover:border-muted-foreground/30 transition-colors duration-200 rounded-2xl shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 text-foreground border border-border/80">
                <Key className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">Better Auth</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fully loaded with secure hashing (scrypt), session cookie control, and pre-built REST endpoints.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/25 p-6 hover:border-muted-foreground/30 transition-colors duration-200 rounded-2xl shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 text-foreground border border-border/80">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">MongoDB Atlas</CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed">
                State-of-the-art serverless persistence utilizing native mongo database mapping without configuration schema layers.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/25 p-6 hover:border-muted-foreground/30 transition-colors duration-200 rounded-2xl shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/40 text-foreground border border-border/80">
                <Lock className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">Strict Guards</CardTitle>
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
