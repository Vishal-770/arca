import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
import { toLowerHex } from "@/lib/subgraph";
import { getServerSession } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const userId = session.userId;
    const { db } = await connectToDatabase();

    const keys = await db.collection("api_keys")
      .find({ userId, revokedAt: null })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      keys: keys.map((k) => ({
        id: k._id.toString(),
        name: k.name,
        prefix: k.prefix,
        mask: k.mask,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/keys]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const body = await req.json();
    const { name, merchantAddress } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Security: Bound strictly to the authenticated session's wallet address
    if (merchantAddress && toLowerHex(merchantAddress) !== session.walletAddress) {
      return NextResponse.json(
        { error: "Forbidden: You cannot generate an API key for another merchant wallet" },
        { status: 403 }
      );
    }
    const assignedAddress = session.walletAddress;

    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);

    const { db } = await connectToDatabase();

    const newKey = {
      userId: session.userId,
      merchantAddress: assignedAddress,
      name: name.trim(),
      keyHash: hashedKey,
      prefix: rawKey.slice(0, 8),
      mask: rawKey.slice(-4),
      createdAt: new Date(),
      lastUsedAt: null,
      revokedAt: null,
    };

    const result = await db.collection("api_keys").insertOne(newKey);

    return NextResponse.json({
      id: result.insertedId.toString(),
      rawKey, // Returned once upon creation
    });
  } catch (err) {
    console.error("[POST /api/keys]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
