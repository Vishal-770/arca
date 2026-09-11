"use client";

import { useEffect, useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Search,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";

type ApiKeyInfo = {
  id: string;
  name: string;
  prefix: string;
  mask: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export default function DeveloperPage() {
  const { sessionUserToken, wallet } = useDashboardContext();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMaskId, setCopiedMaskId] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<ApiKeyInfo | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [sessionUserToken]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim(),
          merchantAddress: wallet?.address,
        }),
      });
      const data = await res.json();
      if (data.rawKey) {
        setGeneratedKey(data.rawKey);
        setNewKeyName("");
        void fetchKeys();
      }
    } catch (err) {
      console.error("Failed to create key", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await fetch(`/api/keys/${keyToDelete.id}`, {
        method: "DELETE",
      });
      setKeyToDelete(null);
      void fetchKeys();
    } catch (err) {
      console.error("Failed to delete key", err);
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

  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return keys;
    const q = searchQuery.toLowerCase().trim();
    return keys.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.prefix.toLowerCase().includes(q) ||
        k.mask.toLowerCase().includes(q)
    );
  }, [keys, searchQuery]);

  const stats = useMemo(() => {
    const total = keys.length;
    const recentlyUsed = keys.filter((k) => k.lastUsedAt !== null).length;
    return {
      total,
      recentlyUsed,
    };
  }, [keys]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">API Keys</h1>
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
              {stats.total} Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create and manage secure API keys to authenticate with Arca services.
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
              setGeneratedKey(null);
              setNewKeyName("");
              setCreateOpen(true);
            }}
            size="sm"
            className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 rounded-lg"
          >
            <Plus className="size-3.5" />
            New API Key
          </Button>
        </div>
      </div>

      {/* ── Summary Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Keys */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Active Keys
            </span>
            <Key className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.total}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Valid credentials registered
            </p>
          </div>
        </div>

        {/* Recently Used */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Utilized Keys
            </span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
              {stats.recentlyUsed}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Accessed protocol endpoints
            </p>
          </div>
        </div>

        {/* Auth Header */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Auth Header
            </span>
            <Terminal className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-base font-bold font-mono tracking-tight text-foreground leading-none">
              x-api-key
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Passed via HTTPS headers
            </p>
          </div>
        </div>

        {/* Cryptographic Standard */}
        <div className="rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Security Standard
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          </div>
          <div>
            <p className="text-base font-bold font-mono tracking-tight text-foreground leading-none">
              SHA-256
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Hashed at rest & one-time reveal
            </p>
          </div>
        </div>
      </div>

      {/* ── Content Section ───────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center rounded-xl border border-border/20 bg-muted/10">
          <p className="text-xs text-muted-foreground animate-pulse font-mono uppercase tracking-widest">
            Loading API keys…
          </p>
        </div>
      ) : keys.length === 0 ? (
        <div className="py-20 px-6 rounded-xl bg-muted/20 border border-border/20 flex flex-col items-center text-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="size-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">No API keys yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6">
            Generate your first API key to start integrating your backends and applications with Arca.
          </p>
          <Button
            onClick={() => {
              setGeneratedKey(null);
              setNewKeyName("");
              setCreateOpen(true);
            }}
            size="sm"
            className="h-8.5 px-4 text-xs font-semibold rounded-lg gap-1.5"
          >
            <Plus className="size-3.5" />
            Create First Key
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search keys by name or prefix..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8.5 text-xs bg-muted/20 border-border/40 focus:border-foreground/40 rounded-lg"
              />
            </div>

            <div className="text-xs text-muted-foreground font-mono self-start sm:self-center">
              Showing {filteredKeys.length} of {keys.length} keys
            </div>
          </div>

          {/* Table or Empty Search Results */}
          {filteredKeys.length === 0 ? (
            <div className="py-14 text-center rounded-xl border border-border/20 bg-muted/10 p-6 flex flex-col items-center justify-center">
              <Search className="size-6 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No matching keys found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                No API keys match your search criteria. Try a different query.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-4 h-8 text-xs gap-1.5 rounded-lg"
              >
                <RotateCcw size={12} /> Clear Search
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/30 bg-muted/10 overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/40 border-b border-border/20">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pl-4">
                        Key Name
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3">
                        Key Token
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[160px]">
                        Created Date
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 w-[160px]">
                        Last Used
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 pr-4 text-right w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((key) => {
                      const displayMask = `${key.prefix}••••${key.mask}`;
                      const isCopied = copiedMaskId === key.id;

                      return (
                        <TableRow
                          key={key.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="py-3.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Key size={13} />
                              </div>
                              <span className="font-semibold text-xs text-foreground truncate max-w-[200px] sm:max-w-xs">
                                {key.name}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3.5">
                            <div className="inline-flex items-center gap-1.5 bg-muted/30 border border-border/30 px-2.5 py-1 rounded-lg">
                              <code className="font-mono text-xs text-foreground font-medium select-all">
                                {displayMask}
                              </code>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(displayMask, () => {
                                    setCopiedMaskId(key.id);
                                    setTimeout(() => setCopiedMaskId(null), 2000);
                                  })
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
                                title="Copy masked key"
                              >
                                {isCopied ? (
                                  <Check className="size-3 text-primary" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          </TableCell>

                          <TableCell className="py-3.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className="shrink-0 text-muted-foreground/60" />
                              <span>
                                {new Date(key.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3.5 text-xs text-muted-foreground">
                            {key.lastUsedAt ? (
                              new Date(key.lastUsedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            ) : (
                              <span className="text-muted-foreground/50 italic">Never</span>
                            )}
                          </TableCell>

                          <TableCell className="py-3.5 pr-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setKeyToDelete(key)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                              title="Revoke Key"
                            >
                              <Trash2 size={13} className="mr-1" />
                              Revoke
                            </Button>
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
      )}

      {/* ── Create Key Dialog ────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setGeneratedKey(null);
            setNewKeyName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Key className="size-4 text-primary" />
              {generatedKey ? "Key Generated Successfully" : "Create API Key"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {generatedKey
                ? "Copy your secret API key now. For security purposes, it will never be displayed again."
                : "Give your API key a recognizable name describing where it will be used."}
            </DialogDescription>
          </DialogHeader>

          {generatedKey ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Generated Secret Key</label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/40">
                  <code className="text-xs font-mono font-bold break-all flex-1 text-foreground select-all">
                    {generatedKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedKey, () => {
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      })
                    }
                    className="h-8 px-2.5 text-xs gap-1.5 rounded-lg shrink-0"
                  >
                    {copiedKey ? (
                      <>
                        <Check size={13} className="text-primary" />
                        <span className="text-primary font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl p-3">
                <AlertTriangle className="size-4 text-destructive" />
                <div>
                  <AlertTitle className="text-xs font-semibold text-destructive">
                    One-time display
                  </AlertTitle>
                  <AlertDescription className="text-[11px] text-muted-foreground mt-0.5">
                    We cannot recover this key once this modal is closed. Store it securely in your secret manager.
                  </AlertDescription>
                </div>
              </Alert>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
                <Button
                  onClick={() => {
                    setGeneratedKey(null);
                    setCreateOpen(false);
                  }}
                  className="h-8.5 px-4 text-xs font-semibold rounded-lg w-full sm:w-auto"
                >
                  Done — I have saved this key
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label htmlFor="key-name-input" className="text-xs font-semibold text-foreground">
                  Key Name
                </label>
                <Input
                  id="key-name-input"
                  placeholder="e.g. Production Backend, Stripe Sync"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-8.5 text-xs bg-muted/20 border-border/40 focus:border-foreground/40 rounded-lg font-medium"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                  autoFocus
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateOpen(false)}
                  disabled={isCreating}
                  className="h-8.5 px-3 text-xs rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName.trim()}
                  className="h-8.5 px-4 text-xs font-semibold rounded-lg"
                >
                  {isCreating ? "Generating…" : "Generate Key"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Revoke Key Dialog ────────────────────────────────────── */}
      <Dialog
        open={!!keyToDelete}
        onOpenChange={(open) => {
          if (!open) setKeyToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl p-6">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              Revoke API Key
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to revoke{" "}
              <strong className="text-foreground font-semibold">
                &ldquo;{keyToDelete?.name}&rdquo;
              </strong>{" "}
              ({keyToDelete?.prefix}••••{keyToDelete?.mask})?
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed my-2">
            This action is permanent and cannot be undone. Any external service or server using this credential will immediately be rejected with an unauthorized response.
          </p>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-3 border-t border-border/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setKeyToDelete(null)}
              className="h-8.5 px-3 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteKey}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg"
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
