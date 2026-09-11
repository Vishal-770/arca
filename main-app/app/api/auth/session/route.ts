import { NextRequest, NextResponse } from "next/server";
import {
  getServerSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/server-auth";
import { createPublicClient, http } from "viem";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { toCircleSmartAccount } from "@circle-fin/modular-wallets-core";
import { arcTestnet } from "@/lib/bridge_config";

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

const sharedArcClient = createPublicClient({
  transport: http(arcTestnet.rpcUrls.default.http[0] || "https://rpc.testnet.arc.network"),
});

/**
 * Verifies that the provided WebAuthn credential deterministically derives
 * the target Circle MSCA smart account address.
 */
async function verifySmartAccountCredential(
  username: string,
  walletAddress: string,
  credential: { id: string; publicKey: string }
): Promise<boolean> {
  try {
    if (!credential?.id || !credential?.publicKey) return false;
    const owner = toWebAuthnAccount({
      credential: {
        id: credential.id,
        publicKey: credential.publicKey as `0x${string}`,
      },
    });
    const smartAccount = await toCircleSmartAccount({
      client: sharedArcClient as any,
      owner,
      name: username,
    });
    return smartAccount.address.toLowerCase() === walletAddress.toLowerCase();
  } catch (err) {
    console.error("[verifySmartAccountCredential] error:", err);
    return false;
  }
}

/**
 * GET /api/auth/session
 * Checks if the current request has a valid server session cookie or Bearer token.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: "No active session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        walletAddress: session.walletAddress,
        expiresAt: session.expiresAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/auth/session]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/auth/session
 * Establishes an httpOnly secure session cookie for an authenticated user.
 * Body: { username: string, walletAddress: string, credential?: { id: string, publicKey: string } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, walletAddress, credential } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Valid username is required" },
        { status: 400 }
      );
    }

    if (
      !walletAddress ||
      typeof walletAddress !== "string" ||
      !isValidEthereumAddress(walletAddress.trim())
    ) {
      return NextResponse.json(
        { error: "Valid Ethereum wallet address is required" },
        { status: 400 }
      );
    }

    const normalizedUserId = username.trim().toLowerCase();
    const normalizedWalletAddress = walletAddress.trim().toLowerCase();

    // Verify smart account ownership via WebAuthn credential
    if (credential && credential.id && credential.publicKey) {
      const isValid = await verifySmartAccountCredential(
        normalizedUserId,
        normalizedWalletAddress,
        credential
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Unauthorized: Provided WebAuthn credential does not match the wallet address" },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: WebAuthn credential verification required in production" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        userId: normalizedUserId,
        walletAddress: normalizedWalletAddress,
      },
    });

    // Mint the httpOnly session cookie
    setSessionCookie(response, {
      userId: normalizedUserId,
      walletAddress: normalizedWalletAddress,
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/session]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie on logout.
 */
export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out" });
    clearSessionCookie(response);
    return response;
  } catch (err) {
    console.error("[DELETE /api/auth/session]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
