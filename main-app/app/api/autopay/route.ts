import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { toLowerHex } from "@/lib/subgraph";
import { getServerSession } from "@/lib/server-auth";

/**
 * GET /api/autopay
 * Retrieves autopay pre-authorizations strictly for the authenticated subscriber's wallet.
 * CRITICAL SECURITY FIX: sessionPrivateKey is completely excluded from the response.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const subscriberLower = session.walletAddress;
    const { db } = await connectToDatabase();

    const settings = await db
      .collection("autopay_settings")
      .find(
        { subscriberAddress: subscriberLower },
        { projection: { sessionPrivateKey: 0 } } // NEVER return private keys
      )
      .toArray();

    return NextResponse.json({
      settings: settings.map((s) => ({
        id: s._id.toString(),
        subscriberAddress: s.subscriberAddress,
        planId: s.planId,
        enabled: s.enabled,
        tierId: s.tierId,
        buyerData: s.buyerData,
        signature: s.signature,
        nonce: s.nonce,
        deadline: s.deadline,
        currentExpiresAt: s.currentExpiresAt,
        sessionPublicKey: s.sessionPublicKey || "",
        maxCycles: s.maxCycles ?? 1,
        executedCycles: s.executedCycles ?? 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/autopay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/autopay
 * Configures or updates an autopay subscription pre-authorization.
 * Binds subscriberAddress strictly to the authenticated session wallet.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      planId,
      enabled,
      tierId,
      buyerData,
      signature,
      nonce,
      deadline,
      currentExpiresAt,
      sessionPublicKey,
      sessionPrivateKey,
      maxCycles,
    } = body;

    if (!planId || !tierId) {
      return NextResponse.json(
        { error: "planId and tierId are required" },
        { status: 400 }
      );
    }

    const subscriberLower = session.walletAddress;
    const planLower = toLowerHex(planId);

    const { db } = await connectToDatabase();

    const updateDoc: { $set: Record<string, unknown>; $setOnInsert: Record<string, unknown> } = {
      $set: {
        enabled: enabled ?? true,
        tierId: tierId,
        buyerData: buyerData || "",
        signature: signature || "",
        nonce: nonce ? Number(nonce) : 0,
        deadline: deadline ? Number(deadline) : 0,
        currentExpiresAt: currentExpiresAt ? Number(currentExpiresAt) : 0,
        sessionPublicKey: sessionPublicKey || "",
        maxCycles: maxCycles ? Number(maxCycles) : 1,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        subscriberAddress: subscriberLower,
        planId: planLower,
        executedCycles: 0,
        createdAt: new Date(),
      },
    };

    // Only update sessionPrivateKey if a new valid session key is provided
    if (sessionPrivateKey && typeof sessionPrivateKey === "string") {
      updateDoc.$set.sessionPrivateKey = sessionPrivateKey;
    }

    const result = await db.collection("autopay_settings").updateOne(
      { subscriberAddress: subscriberLower, planId: planLower },
      updateDoc,
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      upsertedId: result.upsertedId ? result.upsertedId.toString() : null,
    });
  } catch (err) {
    console.error("[POST /api/autopay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/autopay?planId=...
 * Revokes or deletes an autopay subscription pre-authorization.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const planId = req.nextUrl.searchParams.get("planId");
    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const subscriberLower = session.walletAddress;
    const planLower = toLowerHex(planId);

    const { db } = await connectToDatabase();

    const result = await db.collection("autopay_settings").deleteOne({
      subscriberAddress: subscriberLower,
      planId: planLower,
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("[DELETE /api/autopay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
