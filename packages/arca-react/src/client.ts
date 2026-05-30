import { ARCA_PORTAL_URL } from "./constants";
import type { ArcaClientOptions, ArcaSubscriptionResult } from "./types";

export class ArcaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, options?: ArcaClientOptions) {
    this.apiKey = apiKey;
    this.baseUrl = (options?.baseUrl || ARCA_PORTAL_URL).replace(/\/$/, "");
  }

  async getSubscriptionStatus(planId: string, userId: string): Promise<ArcaSubscriptionResult> {
    if (!planId) throw new Error("planId is required");
    if (!userId) throw new Error("userId is required");

    const url = new URL(`${this.baseUrl}/api/sdk/plan/${planId}`);
    url.searchParams.set("userId", userId);

    const res = await fetch(url.toString(), {
      headers: { "x-api-key": this.apiKey }
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to fetch subscription status");
    }

    return (
      data?.subscription || {
        status: "NONE",
        remainingSeconds: 0,
        tierIds: []
      }
    );
  }
}

export function createArcaClient(apiKey: string, options?: ArcaClientOptions) {
  return new ArcaClient(apiKey, options);
}
