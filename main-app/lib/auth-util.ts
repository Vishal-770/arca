import { SessionPayload } from "./server-auth";

/**
 * Validates that the provided address belongs to the verified user session.
 * Replaces the previous insecure stub that unconditionally returned true.
 */
export async function validateWalletOwnership(
  userOrSession: string | SessionPayload,
  address: string
): Promise<boolean> {
  if (!userOrSession || !address) return false;

  const normalizedTarget = address.trim().toLowerCase();

  // If SessionPayload object is provided
  if (typeof userOrSession === "object" && "walletAddress" in userOrSession) {
    return userOrSession.walletAddress.toLowerCase() === normalizedTarget;
  }

  // If userOrSession is an Ethereum address string
  if (typeof userOrSession === "string" && userOrSession.startsWith("0x")) {
    return userOrSession.trim().toLowerCase() === normalizedTarget;
  }

  return false;
}

/**
 * Gets all wallet addresses associated with a user or session.
 */
export async function getUserAddresses(
  userOrSession: string | SessionPayload
): Promise<string[]> {
  if (!userOrSession) return [];

  if (typeof userOrSession === "object" && "walletAddress" in userOrSession) {
    return [userOrSession.walletAddress.toLowerCase()];
  }

  if (typeof userOrSession === "string" && userOrSession.startsWith("0x")) {
    return [userOrSession.trim().toLowerCase()];
  }

  return [];
}
