import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { querySubgraph } from "@/lib/subgraph";
import { getServerSession } from "@/lib/server-auth";
import crypto from "crypto";

/**
 * Check if the authenticated user's wallet owns the specified planId via the Subgraph.
 */
async function verifyPlanOwnership(sellerWallet: string, planId: string): Promise<boolean> {
  if (!sellerWallet || !planId || planId === "all") return false;

  try {
    const planQuery = `
      query GetPlan($id: ID!) {
        plan(id: $id) {
          id
          seller {
            id
          }
        }
      }
    `;

    const data = await querySubgraph<{ plan: { id: string; seller: { id: string } } | null }>(
      planQuery,
      { id: planId.toLowerCase() }
    );

    const plan = data?.plan;
    if (!plan) return false;

    return plan.seller.id.toLowerCase() === sellerWallet.toLowerCase();
  } catch (err) {
    console.error("[verifyPlanOwnership]", err);
    return false;
  }
}

/**
 * GET /api/webhooks
 * Retrieves all webhooks for the authenticated merchant session.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const userId = session.userId;
    const { db } = await connectToDatabase();

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid webhook ID" }, { status: 400 });
      }
      const webhook = await db.collection("webhook_endpoints").findOne({
        _id: new ObjectId(id),
        userId,
      });
      if (!webhook) {
        return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
      }
      return NextResponse.json({
        webhook: {
          id: webhook._id.toString(),
          userId: webhook.userId,
          planId: webhook.planId,
          url: webhook.url,
          secret: webhook.secret,
          events: webhook.events,
          isActive: webhook.isActive,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt,
        },
      });
    }

    const webhooks = await db
      .collection("webhook_endpoints")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      webhooks: webhooks.map((w) => ({
        id: w._id.toString(),
        userId: w.userId,
        planId: w.planId,
        url: w.url,
        secret: w.secret,
        events: w.events,
        isActive: w.isActive,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/webhooks
 * Creates a new webhook endpoint. Enforces single webhook per plan per user.
 * Body: { url: string, planId: string, isActive?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const body = await req.json();
    const { url, planId, isActive = true } = body;

    if (!url || !planId) {
      return NextResponse.json({ error: "url and planId are required" }, { status: 400 });
    }

    // Validate HTTPS url
    try {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Destination URL must use the HTTPS protocol" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Invalid Destination URL format" }, { status: 400 });
    }

    const userId = session.userId;

    // Cryptographic plan ownership check using authenticated session's walletAddress
    const isOwner = await verifyPlanOwnership(session.walletAddress, planId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: Your authenticated wallet does not own this subscription plan." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    // Check unique webhook per plan constraint
    const existing = await db
      .collection("webhook_endpoints")
      .findOne({ userId, planId: planId.toLowerCase() });

    if (existing) {
      return NextResponse.json(
        { error: "A webhook is already configured for this plan. You may edit or delete it." },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
    const newWebhook = {
      userId,
      sellerAddress: session.walletAddress,
      planId: planId.toLowerCase(),
      url: url.trim(),
      secret,
      events: ["payment.succeeded"],
      isActive: !!isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("webhook_endpoints").insertOne(newWebhook);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newWebhook,
    });
  } catch (err) {
    console.error("[POST /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/webhooks
 * Updates an existing webhook endpoint's URL, Plan ID, or active status.
 * Body: { id: string, url: string, planId: string, isActive: boolean }
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const body = await req.json();
    const { id, url, planId, isActive } = body;

    if (!id || !url || !planId || isActive === undefined) {
      return NextResponse.json(
        { error: "id, url, planId, and isActive are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid webhook ID" }, { status: 400 });
    }

    // Validate HTTPS url
    try {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Destination URL must use the HTTPS protocol" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Invalid Destination URL format" }, { status: 400 });
    }

    const userId = session.userId;

    // Cryptographic plan ownership check
    const isOwner = await verifyPlanOwnership(session.walletAddress, planId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: Your authenticated wallet does not own this subscription plan." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    // Verify webhook exists and belongs to the authenticated user
    const webhookObjectId = new ObjectId(id);
    const targetWebhook = await db
      .collection("webhook_endpoints")
      .findOne({ _id: webhookObjectId, userId });

    if (!targetWebhook) {
      return NextResponse.json({ error: "Webhook not found or not owned by user" }, { status: 404 });
    }

    // Check unique webhook per plan constraint if changing plan ID
    if (targetWebhook.planId !== planId.toLowerCase()) {
      const duplicate = await db
        .collection("webhook_endpoints")
        .findOne({ userId, planId: planId.toLowerCase() });

      if (duplicate) {
        return NextResponse.json(
          { error: "A webhook is already configured for the new plan choice." },
          { status: 400 }
        );
      }
    }

    const updateDoc = {
      $set: {
        planId: planId.toLowerCase(),
        url: url.trim(),
        isActive: !!isActive,
        updatedAt: new Date(),
      },
    };

    await db.collection("webhook_endpoints").updateOne({ _id: webhookObjectId, userId }, updateDoc);

    return NextResponse.json({ success: true, message: "Webhook updated successfully" });
  } catch (err) {
    console.error("[PUT /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/webhooks?id=...
 * Deletes a webhook endpoint belonging to the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid webhook ID is required" }, { status: 400 });
    }

    const userId = session.userId;
    const { db } = await connectToDatabase();
    const result = await db.collection("webhook_endpoints").deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Webhook not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Webhook deleted" });
  } catch (err) {
    console.error("[DELETE /api/webhooks]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
