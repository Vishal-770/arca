import { Router, Request, Response } from "express";
import { querySubgraph, SubgraphError, toLowerHex, toNumber, toSecondsNow } from "../lib/subgraph";
import { ipfsHashToHttpUrl } from "../lib/subscription";

const router = Router();

function isHexId(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value) || /^0x[a-fA-F0-9]{64}$/.test(value);
}

type SubgraphPlanTier = {
  tierId: string;
  price: string;
  label: string;
  active: boolean;
};

type SubgraphPlan = {
  id: string;
  duration: string;
  ipfsHash: string;
  active: boolean;
  tiers: SubgraphPlanTier[];
  seller: { id: string };
};

type SubgraphSubscriptionState = {
  status: string;
  lastEndTime: string;
  lastTierId?: string | null;
};

type SubgraphSubscribed = {
  tierId: string;
  endTime: string;
};

type PlanMetadataTier = {
  label: string;
  features?: { title: string; description: string }[];
};

type PlanMetadata = {
  name?: string;
  brand?: { name?: string; website?: string };
  tiers?: PlanMetadataTier[];
};

/* ── Queries ── */
const PLAN_QUERY = `
  query GetPlan($planId: ID!) {
    plan(id: $planId) {
      id
      duration
      ipfsHash
      active
      tiers(where: { active: true }) {
        tierId
        price
        label
        active
      }
      seller { id }
    }
  }
`;

const SUB_QUERY = `
  query SubscriptionsByUserId($planId: Bytes!, $userId: String!) {
    subscriptionStates(
      where: { plan_: { id: $planId }, lastBuyerData: $userId }
      first: 1
      orderBy: updatedAt
      orderDirection: desc
    ) {
      status
      lastEndTime
      lastTierId
    }
    subscribeds(
      where: { planId: $planId, buyerData: $userId }
    ) {
      tierId
      endTime
    }
  }
`;

// GET /api/sdk/plan/:planId
router.get("/plan/:planId", async (req: Request, res: Response) => {
  const { planId } = req.params;
  const userId = req.query.userId as string | undefined;
  const apiKey = req.headers["x-api-key"] as string | undefined;

  try {
    // 1. API Key Validation
    if (!apiKey || (!apiKey.startsWith("mp_live_") && !apiKey.startsWith("mp_test_"))) {
      return res.status(401).json({
        error: "Invalid or missing Arca API Key",
        code: "UNAUTHORIZED",
      });
    }

    if (!planId || !isHexId(planId)) {
      return res.status(400).json({
        error: "Invalid planId format",
        code: "INVALID_PLAN_ID",
      });
    }

    const normalizedUserId = userId?.trim();
    if (userId !== undefined) {
      if (!normalizedUserId || normalizedUserId.length > 256) {
        return res.status(400).json({
          error: "Invalid userId",
          code: "INVALID_USER_ID",
        });
      }
    }

    // 2. Fetch Plan Data from Subgraph
    const planData = await querySubgraph<{ plan: SubgraphPlan | null }>(PLAN_QUERY, {
      planId: toLowerHex(planId),
    });

    if (!planData.plan) {
      return res.status(404).json({
        error: "Plan not found",
        code: "PLAN_NOT_FOUND",
      });
    }

    // 3. Fetch Plan Metadata from IPFS
    let metadata: PlanMetadata | null = null;
    try {
      const response = await fetch(ipfsHashToHttpUrl(planData.plan.ipfsHash));
      metadata = response.ok ? ((await response.json()) as PlanMetadata) : null;
    } catch (err) {
      console.warn("Failed to fetch plan metadata from IPFS:", err);
      metadata = null;
    }

    // 4. Optional: Check Subscription by userId
    let subscription = null;
    if (normalizedUserId) {
      const subData = await querySubgraph<{
        subscriptionStates: SubgraphSubscriptionState[];
        subscribeds: SubgraphSubscribed[];
      }>(SUB_QUERY, {
        planId: toLowerHex(planId),
        userId: normalizedUserId,
      });

      if (subData.subscriptionStates?.[0]) {
        const entry = subData.subscriptionStates[0];
        const lastEndTime = toNumber(entry.lastEndTime);
        const now = toSecondsNow();
        const remainingSeconds = Math.max(lastEndTime - now, 0);
        const isStateActive = remainingSeconds > 0 && entry.status === "ACTIVE";

        // Filter active tiers
        const activeSubs = (subData.subscribeds ?? []).filter(sub => toNumber(sub.endTime) >= now);
        const tierIds = Array.from(new Set(activeSubs.map(sub => sub.tierId)));

        // Ensure lastTierId is in active list if state is active
        if (isStateActive && entry.lastTierId && !tierIds.includes(entry.lastTierId)) {
          tierIds.push(entry.lastTierId);
        }

        const isActive = isStateActive || tierIds.length > 0;

        subscription = {
          status: isActive ? "ACTIVE" : "EXPIRED",
          remainingSeconds,
          tierId: entry.lastTierId,
          tierIds,
        };
      }
    }

    return res.json({
      plan: {
        id: planData.plan.id,
        name: metadata?.name || planData.plan.id,
        duration: planData.plan.duration,
        brand: metadata?.brand,
        tiers: planData.plan.tiers.map((tier) => {
          const mTier = metadata?.tiers?.find((mt) => mt.label === tier.label);
          return {
            id: tier.tierId,
            label: tier.label,
            price: tier.price,
            features: mTier?.features || [],
          };
        }),
      },
      subscription,
    });
  } catch (err) {
    console.error("[GET /api/sdk/plan/:planId]", err);

    if (err instanceof SubgraphError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

export default router;
