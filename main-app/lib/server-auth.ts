import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export interface SessionPayload {
  userId: string;
  walletAddress: string;
  issuedAt: number;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = "arca_session";
export const DEFAULT_SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    return "arca-production-session-secret-key-default-v1";
  }
  return secret;
}

function base64UrlEncode(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token (JWT structure).
 */
export function createSessionToken(
  data: { userId: string; walletAddress: string },
  expiresInSeconds: number = DEFAULT_SESSION_DURATION
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: SessionPayload = {
    userId: data.userId.trim().toLowerCase(),
    walletAddress: data.walletAddress.trim().toLowerCase(),
    issuedAt: now,
    expiresAt: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(signingInput)
    .digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 session token.
 * Returns the payload if valid and not expired, or null if invalid/tampered.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(signingInput)
      .digest();
    const providedSignature = Buffer.from(
      encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    if (
      expectedSignature.length !== providedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, providedSignature)
    ) {
      return null;
    }

    const payloadText = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadText) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.expiresAt || payload.expiresAt < now) {
      return null; // Expired
    }

    if (!payload.userId || !payload.walletAddress) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session from either:
 * 1. The httpOnly `arca_session` cookie.
 * 2. An `Authorization: Bearer <token>` header.
 */
export async function getServerSession(
  req: NextRequest | Request
): Promise<SessionPayload | null> {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    const verified = verifySessionToken(bearerToken);
    if (verified) return verified;
  }

  // Check httpOnly cookie
  let cookieToken: string | undefined;
  if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    cookieToken = (req as NextRequest).cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    // Parse cookie from raw headers if NextRequest cookie getter is not present
    const rawCookie = req.headers.get("cookie");
    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
      if (match) {
        cookieToken = decodeURIComponent(match[1]);
      }
    }
  }

  if (cookieToken) {
    return verifySessionToken(cookieToken);
  }

  return null;
}

/**
 * Attaches the httpOnly session cookie to an outgoing Next.js response.
 */
export function setSessionCookie(
  res: NextResponse,
  data: { userId: string; walletAddress: string },
  expiresInSeconds: number = DEFAULT_SESSION_DURATION
): string {
  const token = createSessionToken(data, expiresInSeconds);
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds,
  });
  return token;
}

/**
 * Deletes the httpOnly session cookie from an outgoing Next.js response.
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
