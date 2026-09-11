"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTransactionError } from "@/lib/errors";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error caught by boundary:", error);
  }, [error]);

  const userFriendlyMessage = formatTransactionError(error);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border/30 bg-muted/10 p-6 sm:p-8 text-center space-y-5">
        <div className="mx-auto size-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-foreground">Something went wrong</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {userFriendlyMessage}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            size="sm"
            className="w-full sm:w-auto h-8.5 px-4 text-xs font-semibold rounded-lg gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full sm:w-auto h-8.5 px-4 text-xs rounded-lg gap-1.5 border-border/40 hover:bg-muted/50"
          >
            <Link href="/dashboard">
              <Home className="size-3.5" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
