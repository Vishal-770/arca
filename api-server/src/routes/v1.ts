import { Router, Response as ExpressResponse } from "express";
import { validateApiKeyMiddleware, AuthenticatedRequest } from "../middlewares/auth";
import { querySubgraph, SubgraphError, toLowerHex } from "../lib/subgraph";
import { ipfsHashToHttpUrl, isAddressLike } from "../lib/subscription";

const router = Router();

function isHexId(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value) || /^0x[a-fA-F0-9]{64}$/.test(value);
}

type MerchantAddressResult =
  | { ok: true; merchantAddress: string }
  | { ok: false; status: number; error: string; code: string };

function requireMerchantAddress(merchantAddress?: string | null): MerchantAddressResult {
  if (!merchantAddress) {
    return {
      ok: false,
      status: 404,
      error: "No wallet address associated with this key",
      code: "WALLET_NOT_FOUND",
    };
  }

  if (!isAddressLike(merchantAddress)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid wallet address on API key",
      code: "INVALID_WALLET_ADDRESS",
    };
  }

  return { ok: true, merchantAddress };
}

// Apply API Key authentication middleware to all /v1 endpoints
router.use(validateApiKeyMiddleware);

/* ── Typings & GraphQL Queries ── */
interface SubgraphPlanIdOnly {
  id: string;
}

interface PlanMetadataResponse {
  id: string;
  seller: { id: string };
  ipfsHash: string;
}

interface SubscriptionState {
  id: string;
  subscriber: { id: string };
  status: string;
  lastEndTime: string;
  totalSpent: string;
  lastBuyerData: string;
}

interface PlanCheck {
  id: string;
  seller: { id: string };
}

interface PlanAnalytics {
  id: string;
  seller: { id: string };
  duration: string;
  active: boolean;
  subscriptionCount: number;
  totalGrossVolume: string;
  totalFeesCollected: string;
  lastSubscriptionAt: string | null;
  createdAt: string;
  updatedAt: string;
  tiers: {
    tierId: string;
    price: string;
    label: string;
    active: boolean;
  }[];
}

interface SellerAnalytics {
  id: string;
  planCount: number;
  activePlanCount: number;
  subscriptionCount: number;
  totalGrossRevenue: string;
  totalNetRevenue: string;
  totalFeeContributed: string;
}

const PLANS_QUERY = `
  query MerchantPlans($seller: String!) {
    plans(where: { seller: $seller }) {
      id
    }
  }
`;

const PLAN_METADATA_QUERY = `
  query PlanMetadata($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      ipfsHash
    }
  }
`;

const PLAN_CHECK_QUERY = `
  query CheckPlanOwner($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
    }
  }
`;

const PLAN_SUBSCRIBERS_QUERY = `
  query PlanSubscribers($planId: String!) {
    subscriptionStates(where: { plan: $planId }, orderBy: lastEndTime, orderDirection: desc) {
      id
      subscriber { id }
      status
      lastEndTime
      totalSpent
      lastBuyerData
    }
  }
`;

const PLAN_ANALYTICS_QUERY = `
  query PlanAnalytics($id: ID!) {
    plan(id: $id) {
      id
      seller { id }
      duration
      active
      subscriptionCount
      totalGrossVolume
      totalFeesCollected
      lastSubscriptionAt
      createdAt
      updatedAt
      tiers {
        tierId
        price
        label
        active
      }
    }
  }
`;

const SELLER_ANALYTICS_QUERY = `
  query SellerMetrics($id: Bytes!) {
    seller(id: $id) {
      id
      planCount
      activePlanCount
      subscriptionCount
      totalGrossRevenue
      totalNetRevenue
      totalFeeContributed
    }
  }
`;

/* ── Routes ── */

// GET /api/v1/wallet
router.get("/wallet", async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const { merchantAddress } = req;

  const walletResult = requireMerchantAddress(merchantAddress);
  if (!walletResult.ok) {
    return res.status(walletResult.status).json({
      error: walletResult.error,
      code: walletResult.code,
    });
  }

  return res.json({
    success: true,
    walletAddress: walletResult.merchantAddress,
  });
});

// GET /api/v1/plans
router.get("/plans", async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const { merchantAddress } = req;

  const walletResult = requireMerchantAddress(merchantAddress);
  if (!walletResult.ok) {
    return res.status(walletResult.status).json({
      error: walletResult.error,
      code: walletResult.code,
    });
  }

  try {
    const seller = toLowerHex(walletResult.merchantAddress);
    const data = await querySubgraph<{ plans: SubgraphPlanIdOnly[] }>(PLANS_QUERY, {
      seller,
    });

    const planIds = (data.plans ?? []).map((plan) => plan.id);

    return res.json({
      success: true,
      plans: planIds,
    });
  } catch (err) {
    console.error("[GET /api/v1/plans]", err);

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

// GET /api/v1/plans/:id
router.get("/plans/:id", async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const { merchantAddress } = req;
  const { id } = req.params;

  const walletResult = requireMerchantAddress(merchantAddress);
  if (!walletResult.ok) {
    return res.status(walletResult.status).json({
      error: walletResult.error,
      code: walletResult.code,
    });
  }

  if (!id || !isHexId(id)) {
    return res.status(400).json({
      error: "Invalid plan id",
      code: "INVALID_PLAN_ID",
    });
  }

  try {
    const seller = toLowerHex(walletResult.merchantAddress);
    const planId = toLowerHex(id);

    const data = await querySubgraph<{ plan: PlanMetadataResponse | null }>(PLAN_METADATA_QUERY, {
      id: planId,
    });

    const plan = data.plan;

    if (!plan) {
      return res.status(404).json({
        error: "Plan not found",
        code: "PLAN_NOT_FOUND",
      });
    }

    if (plan.seller.id.toLowerCase() !== seller) {
      return res.status(403).json({
        error: "Forbidden: You do not own this plan",
        code: "FORBIDDEN",
      });
    }

    let metadata = null;
    try {
      const response = await fetch(ipfsHashToHttpUrl(plan.ipfsHash));
      metadata = response.ok ? await response.json() : null;
    } catch (err) {
      console.warn("Failed to fetch plan metadata from IPFS:", err);
      metadata = null;
    }

    return res.json({
      success: true,
      planId: plan.id,
      metadata,
    });
  } catch (err) {
    console.error("[GET /api/v1/plans/:id]", err);

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

// GET /api/v1/plans/:id/subscribers
router.get("/plans/:id/subscribers", async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const { merchantAddress } = req;
  const { id } = req.params;

  const walletResult = requireMerchantAddress(merchantAddress);
  if (!walletResult.ok) {
    return res.status(walletResult.status).json({
      error: walletResult.error,
      code: walletResult.code,
    });
  }

  if (!id || !isHexId(id)) {
    return res.status(400).json({
      error: "Invalid plan id",
      code: "INVALID_PLAN_ID",
    });
  }

  try {
    const seller = toLowerHex(walletResult.merchantAddress);
    const planId = toLowerHex(id);

    // 1. Verify owner
    const checkData = await querySubgraph<{ plan: PlanCheck | null }>(PLAN_CHECK_QUERY, {
      id: planId,
    });

    if (!checkData.plan) {
      return res.status(404).json({
        error: "Plan not found",
        code: "PLAN_NOT_FOUND",
      });
    }

    if (checkData.plan.seller.id.toLowerCase() !== seller) {
      return res.status(403).json({
        error: "Forbidden: You do not own this plan",
        code: "FORBIDDEN",
      });
    }

    // 2. Fetch subscribers
    const data = await querySubgraph<{ subscriptionStates: SubscriptionState[] }>(PLAN_SUBSCRIBERS_QUERY, {
      planId,
    });

    const subscribers = (data.subscriptionStates ?? []).map((state) => ({
      subscriptionId: state.id,
      buyerAddress: state.subscriber.id,
      buyerData: state.lastBuyerData,
      status: state.status,
      lastEndTime: state.lastEndTime,
      totalSpent: state.totalSpent,
    }));

    return res.json({
      success: true,
      subscribers,
    });
  } catch (err) {
    console.error("[GET /api/v1/plans/:id/subscribers]", err);

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

// GET /api/v1/plans/:id/analytics
router.get("/plans/:id/analytics", async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const { merchantAddress } = req;
  const { id } = req.params;

  const walletResult = requireMerchantAddress(merchantAddress);
  if (!walletResult.ok) {
    return res.status(walletResult.status).json({
      error: walletResult.error,
      code: walletResult.code,
    });
  }

  if (!id || !isHexId(id)) {
    return res.status(400).json({
      error: "Invalid plan id",
      code: "INVALID_PLAN_ID",
    });
  }

  try {
    const seller = toLowerHex(walletResult.merchantAddress);
    const planId = toLowerHex(id);

    const data = await querySubgraph<{ plan: PlanAnalytics | null }>(PLAN_ANALYTICS_QUERY, {
      id: planId,
    });

    const plan = data.plan;

    if (!plan) {
      return res.status(404).json({
        error: "Plan not found",
        code: "PLAN_NOT_FOUND",
      });
    }

    if (plan.seller.id.toLowerCase() !== seller) {
      return res.status(403).json({
        error: "Forbidden: You do not own this plan",
        code: "FORBIDDEN",
      });
    }

    return res.json({
      success: true,
      analytics: {
        planId: plan.id,
        active: plan.active,
        subscriptionCount: plan.subscriptionCount,
        totalGrossVolume: plan.totalGrossVolume,
        totalFeesCollected: plan.totalFeesCollected,
        netRevenue: (BigInt(plan.totalGrossVolume) - BigInt(plan.totalFeesCollected)).toString(),
        lastSubscriptionAt: plan.lastSubscriptionAt,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        tiers: plan.tiers,
      },
    });
  } catch (err) {
    console.error("[GET /api/v1/plans/:id/analytics]", err);

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

// GET /api/v1/analytics
router.get("/analytics", async (req: AuthenticatedRequest, res: ExpressResponse) => {
  const { merchantAddress } = req;

  const walletResult = requireMerchantAddress(merchantAddress);
  if (!walletResult.ok) {
    return res.status(walletResult.status).json({
      error: walletResult.error,
      code: walletResult.code,
    });
  }

  try {
    const sellerId = toLowerHex(walletResult.merchantAddress);
    const data = await querySubgraph<{ seller: SellerAnalytics | null }>(SELLER_ANALYTICS_QUERY, {
      id: sellerId,
    });

    const seller = data.seller;

    if (!seller) {
      return res.json({
        success: true,
        analytics: {
          sellerId,
          planCount: 0,
          activePlanCount: 0,
          subscriptionCount: 0,
          totalGrossRevenue: "0",
          totalNetRevenue: "0",
          totalFeeContributed: "0",
        },
      });
    }

    return res.json({
      success: true,
      analytics: {
        sellerId: seller.id,
        planCount: seller.planCount,
        activePlanCount: seller.activePlanCount,
        subscriptionCount: seller.subscriptionCount,
        totalGrossRevenue: seller.totalGrossRevenue,
        totalNetRevenue: seller.totalNetRevenue,
        totalFeeContributed: seller.totalFeeContributed,
      },
    });
  } catch (err) {
    console.error("[GET /api/v1/analytics]", err);

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
