import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";

/**
 * GET /api/webhooks/logs?endpointId=...
 * Retrieves the 50 most recent webhook delivery logs strictly scoped to the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const endpointId = req.nextUrl.searchParams.get("endpointId");
    const userId = session.userId;

    const { db } = await connectToDatabase();

    const query: Record<string, unknown> = { userId };
    if (endpointId) {
      query.webhookEndpointId = endpointId;
    }

    // Retrieve the 50 most recent logs matching the authenticated user
    const logs = await db
      .collection("webhook_logs")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l._id.toString(),
        webhookEndpointId: l.webhookEndpointId,
        userId: l.userId,
        planId: l.planId,
        url: l.url,
        event: l.event,
        payload: l.payload,
        status: l.status,
        statusText: l.statusText,
        responseBody: l.responseBody,
        durationMs: l.durationMs,
        txHash: l.txHash,
        timestamp: l.timestamp,
      })),
    });
  } catch (err) {
    console.error("[GET /api/webhooks/logs]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
