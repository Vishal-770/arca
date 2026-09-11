import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "@/lib/server-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Key ID is required" }, { status: 400 });
    }

    const userId = session.userId;
    const { db } = await connectToDatabase();

    // Soft delete / Revoke by setting revokedAt only if key belongs to this user
    const result = await db.collection("api_keys").updateOne(
      { _id: new ObjectId(id), userId },
      { $set: { revokedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Key not found or not owned by caller" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "API key revoked" });
  } catch (err) {
    console.error("[DELETE /api/keys/[id]]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
