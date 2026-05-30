import { Request, Response, NextFunction } from "express";
import { connectToDatabase } from "../lib/db";
import { hashApiKey } from "../lib/api-keys";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  merchantAddress?: string | null;
}

export async function validateApiKeyMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    return res.status(401).json({
      error: "Missing or invalid x-api-key header",
      code: "MISSING_API_KEY",
    });
  }

  const normalizedKey = apiKey.trim();
  if (!normalizedKey.startsWith("mp_live_") && !normalizedKey.startsWith("mp_test_")) {
    return res.status(400).json({
      error: "Malformed API key",
      code: "INVALID_API_KEY_FORMAT",
    });
  }

  try {
    const { db } = await connectToDatabase();
    const hashedKey = hashApiKey(normalizedKey);

    const keyRecord = await db.collection("api_keys").findOne({
      keyHash: hashedKey,
      revokedAt: null
    });

    if (!keyRecord) {
      return res.status(401).json({
        error: "Unauthorized: Invalid or revoked API key",
        code: "UNAUTHORIZED",
      });
    }

    // Update lastUsedAt asynchronously
    db.collection("api_keys").updateOne(
      { _id: keyRecord._id },
      { $set: { lastUsedAt: new Date() } }
    ).catch(err => console.error("Failed to update lastUsedAt", err));

    req.userId = keyRecord.userId;
    req.merchantAddress = keyRecord.merchantAddress;
    next();
  } catch (err) {
    console.error("API Key Validation Error:", err);
    return res.status(503).json({
      error: "Authentication service unavailable",
      code: "AUTH_SERVICE_UNAVAILABLE",
    });
  }
}
