"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit3, Plus, Trash2, AlertCircle } from "lucide-react";
import { useCircleSDK } from "@/context/CircleSDKContext";
import { useDashboardContext } from "@/app/dashboard/_components/DashboardShell";
import { encodeFunctionData } from "viem";
import { SUBSCRIPTION_GATEWAY_ADDRESS, normalizeIpfsUri } from "@/lib/subscription";

type EditPlanDialogProps = {
  planId: string;
  durationSeconds: number;
  metadata: EditPlanMetadata;
  onSuccess?: () => void;
};

type FeatureState = {
  title: string;
  description: string;
};

type TierState = {
  label: string;
  price: string;
  features: FeatureState[];
};

type EditPlanMetadata = {
  name?: string;
  brand?: { name?: string; website?: string };
  tiers?: TierState[];
} | null;

export function EditPlanDialog({ planId, durationSeconds, metadata, onSuccess }: EditPlanDialogProps) {
  const { wallet } = useDashboardContext();
  const { executeTransaction } = useCircleSDK();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const usdcBalance = useMemo(() => {
    if (!wallet?.tokenBalances) return 0;
    const usdcToken = wallet.tokenBalances.find(
      (tb) => tb.symbol.toUpperCase() === "USDC"
    );
    return usdcToken ? parseFloat(usdcToken.amount) : 0;
  }, [wallet]);

  const hasMinUsdc = usdcBalance >= 0.01;

  // Form values
  const [durationDays, setDurationDays] = useState(
    Math.max(1, Math.floor(durationSeconds / 86400)).toString()
  );
  const [brandName, setBrandName] = useState(metadata?.brand?.name || metadata?.name || "");
  const [brandWebsite, setBrandWebsite] = useState(metadata?.brand?.website || "");
  const [tiers, setTiers] = useState<TierState[]>(metadata?.tiers || []);

  const handleFeatureChange = (
    tierIdx: number,
    featureIdx: number,
    field: keyof FeatureState,
    value: string
  ) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].features[featureIdx][field] = value;
    setTiers(newTiers);
  };

  const addFeature = (tierIdx: number) => {
    const newTiers = [...tiers];
    if (!newTiers[tierIdx].features) newTiers[tierIdx].features = [];
    newTiers[tierIdx].features.push({ title: "", description: "" });
    setTiers(newTiers);
  };

  const removeFeature = (tierIdx: number, featureIdx: number) => {
    const newTiers = [...tiers];
    newTiers[tierIdx].features.splice(featureIdx, 1);
    setTiers(newTiers);
  };

  const handleSave = async () => {
    if (!wallet?.address) {
      setError("Active wallet account not found");
      return;
    }

    if (usdcBalance < 0.01) {
      setError("Insufficient USDC balance. You need at least 0.01 USDC to pay network gas fees.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create new metadata payload
      const newMetadata = {
        type: "subscription-ui",
        version: "1.1",
        brand: {
          name: brandName,
          website: brandWebsite || "https://example.com",
        },
        tiers: tiers,
      };

      // 2. Upload to IPFS
      const uploadRes = await fetch("/api/subscription/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: newMetadata }),
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Failed to upload metadata");

      // 3. Directly update metadata on contract
      const subscriptionGatewayAbi = [
        {
          name: "updatePlanMetadata",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "planId", type: "bytes32" },
            { name: "durationSeconds", type: "uint32" },
            { name: "ipfsHash", type: "string" },
          ],
          outputs: [],
        },
      ] as const;

      const newDurationSeconds = Number(durationDays) * 86400;
      const normalizedIpfs = normalizeIpfsUri(uploadJson.ipfsHash);

      const txData = encodeFunctionData({
        abi: subscriptionGatewayAbi,
        functionName: "updatePlanMetadata",
        args: [planId as `0x${string}`, newDurationSeconds, normalizedIpfs],
      });

      await executeTransaction(
        [
          {
            to: SUBSCRIPTION_GATEWAY_ADDRESS as `0x${string}`,
            data: txData,
          },
        ],
        false,
        "Arc_Testnet"
      );

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8.5 text-xs px-3 gap-1.5 font-medium rounded-lg"
          >
            <Edit3 className="size-3.5 text-muted-foreground" />
            <span>Edit Plan</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col max-h-[85vh] rounded-2xl border border-border/40 bg-popover shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border/20 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Edit Plan Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Update plan name, website, billing cycle, and tier feature lists.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Scroll Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* General Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                General Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="brandName" className="text-xs font-medium text-foreground">
                    Plan Name
                  </label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Pro Membership"
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/40 font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="duration" className="text-xs font-medium text-foreground">
                    Billing Cycle (Days)
                  </label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="h-9 text-xs rounded-lg bg-muted/20 border-border/40 font-normal"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="brandWebsite" className="text-xs font-medium text-foreground">
                  Website URL
                </label>
                <Input
                  id="brandWebsite"
                  value={brandWebsite}
                  onChange={(e) => setBrandWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="h-9 text-xs rounded-lg bg-muted/20 border-border/40 font-normal"
                />
              </div>
            </div>

            <Separator className="border-border/20" />

            {/* Pricing Tiers & Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tier Features
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Prices are locked on-chain
                </span>
              </div>

              {tiers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No tiers found in metadata.</p>
              ) : (
                tiers.map((tier, tierIdx) => (
                  <div
                    key={tierIdx}
                    className="rounded-xl bg-muted/20 border border-border/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{tier.label}</span>
                        <Badge variant="secondary" className="text-[10px] font-mono font-medium">
                          ${tier.price} USDC
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {tier.features?.length || 0} features
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-1">
                      {tier.features?.map((feat, featIdx) => (
                        <div key={featIdx} className="flex items-center gap-2 bg-card/60 p-2 rounded-lg border border-border/20">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                              placeholder="Feature title"
                              value={feat.title}
                              onChange={(e) =>
                                handleFeatureChange(tierIdx, featIdx, "title", e.target.value)
                              }
                              className="h-7.5 text-xs rounded-md bg-muted/30 border-border/30 font-normal"
                            />
                            <Input
                              placeholder="Brief description (optional)"
                              value={feat.description}
                              onChange={(e) =>
                                handleFeatureChange(tierIdx, featIdx, "description", e.target.value)
                              }
                              className="h-7.5 text-xs rounded-md bg-muted/30 border-border/30 font-normal text-muted-foreground"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive shrink-0 rounded-md"
                            onClick={() => removeFeature(tierIdx, featIdx)}
                            title="Remove feature"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 gap-1.5 rounded-lg font-medium"
                      onClick={() => addFeature(tierIdx)}
                    >
                      <Plus className="size-3.5" /> Add Feature to {tier.label}
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Low Balance Warning */}
            {!hasMinUsdc && (
              <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs">
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Insufficient Gas Balance</p>
                  <p className="text-muted-foreground leading-relaxed">
                    You have <span className="font-mono font-semibold text-foreground">{usdcBalance.toFixed(4)} USDC</span>. At least 0.01 USDC is needed to cover transaction gas fees.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-border/20 bg-muted/20 shrink-0">
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="h-8 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!wallet?.address) {
                    setError("Active smart account wallet not found");
                    return;
                  }
                  if (usdcBalance < 0.01) {
                    setError("Insufficient USDC balance. You need at least 0.01 USDC to pay transaction gas fees.");
                    return;
                  }
                  setError(null);
                  setConfirmSaveOpen(true);
                }}
                disabled={loading || !hasMinUsdc}
                className="h-8 text-xs font-semibold px-4"
              >
                {loading ? "Processing…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog Before Write Operation */}
      <Dialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Plan Details?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              This will submit an on-chain transaction to update the plan metadata on Arc Testnet. Do you wish to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmSaveOpen(false)}
              disabled={loading}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={async () => {
                setConfirmSaveOpen(false);
                await handleSave();
              }}
              className="h-8 text-xs font-semibold px-4"
            >
              {loading ? "Submitting…" : "Yes, Update Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
