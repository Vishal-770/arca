/**
 * Centralized Error Parsing & Formatting Utility
 * Converts raw blockchain, WebAuthn, bundler, and network errors
 * into human-readable, user-friendly messages.
 */

export function formatTransactionError(error: unknown): string {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  // Extract raw error string and name
  let rawMsg = "";
  let errorName = "";

  if (typeof error === "string") {
    rawMsg = error;
  } else if (error instanceof Error) {
    rawMsg = error.message || "";
    errorName = error.name || "";
  } else if (typeof error === "object") {
    const errObj = error as Record<string, unknown>;
    rawMsg =
      typeof errObj.message === "string"
        ? errObj.message
        : typeof errObj.shortMessage === "string"
        ? errObj.shortMessage
        : typeof errObj.details === "string"
        ? errObj.details
        : JSON.stringify(error);
    if (typeof errObj.name === "string") {
      errorName = errObj.name;
    }
  }

  const lower = (rawMsg + " " + errorName).toLowerCase();

  // 1. User Cancellation / Rejection (WebAuthn, biometric prompt, wallet popup)
  if (
    errorName === "NotAllowedError" ||
    errorName === "AbortError" ||
    lower.includes("notallowederror") ||
    lower.includes("aborterror") ||
    lower.includes("operation either timed out or was not allowed") ||
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("user canceled") ||
    lower.includes("user cancelled") ||
    lower.includes("cancelled by user") ||
    lower.includes("canceled by user") ||
    lower.includes("transaction was cancelled") ||
    lower.includes("transaction was canceled") ||
    lower.includes("declined the request") ||
    lower.includes("request was rejected") ||
    lower.includes("signature denied")
  ) {
    return "Transaction cancelled. The authorization prompt was closed or declined.";
  }

  // 2. Insufficient Funds / Gas
  if (
    lower.includes("insufficient funds") ||
    lower.includes("insufficient balance") ||
    lower.includes("exceeds balance") ||
    lower.includes("transfer amount exceeds balance") ||
    lower.includes("aa21") ||
    lower.includes("didn't pay prefund")
  ) {
    return "Insufficient balance to cover the payment amount and network gas.";
  }

  // 3. Smart Contract / On-Chain Reverts
  if (
    lower.includes("execution reverted") ||
    lower.includes("aa23") ||
    lower.includes("aa33") ||
    lower.includes("reverted by contract") ||
    lower.includes("revert")
  ) {
    if (lower.includes("alreadysubscribed") || lower.includes("already subscribed")) {
      return "You already have an active subscription for this plan.";
    }
    if (lower.includes("planinactive") || lower.includes("plan is inactive")) {
      return "This subscription plan is currently paused or inactive.";
    }
    if (lower.includes("tierinactive") || lower.includes("tier is inactive")) {
      return "The selected subscription tier is currently inactive.";
    }
    if (lower.includes("allowance") || lower.includes("insufficient allowance")) {
      return "Token allowance error. Please approve the transaction in your wallet.";
    }
    return "Transaction could not be processed on-chain. Please verify details and try again.";
  }

  // 4. Session / Authentication
  if (
    lower.includes("no active smart account session") ||
    lower.includes("register or login first") ||
    lower.includes("unauthorized") ||
    lower.includes("session expired")
  ) {
    return "Your wallet session has expired. Please sign in with your passkey again.";
  }

  // 5. Network / Timeout
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network error") ||
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("etimedout") ||
    lower.includes("econnrefused") ||
    lower.includes("connection reset")
  ) {
    return "Network connection issue. Please check your internet connection and try again.";
  }

  // 6. Bundler / RPC Gas Estimation
  if (lower.includes("gas price too low") || lower.includes("maxfeepergas")) {
    return "Network gas fee estimation fluctuated. Please retry the transaction.";
  }

  // 7. Filter out raw technical hex dumps, JSON objects, or very long stack traces
  const hasLongHex = /0x[a-fA-F0-9]{8,}/.test(rawMsg);
  const isJsonBlob = rawMsg.trim().startsWith("{") && rawMsg.trim().endsWith("}");
  const isTooLong = rawMsg.length > 140;

  if (hasLongHex || isJsonBlob || isTooLong) {
    return "Something went wrong while processing your request. Please try again.";
  }

  // Clean, short message that is already user-facing
  const cleaned = rawMsg.replace(/^(Error:\s*)/i, "").trim();
  if (cleaned.length > 0 && cleaned.length < 120) {
    return cleaned;
  }

  return "Something went wrong. Please try again.";
}
