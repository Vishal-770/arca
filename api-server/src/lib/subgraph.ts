import dotenv from "dotenv";

dotenv.config();

const SUBGRAPH_URL = process.env.SUBGRAPH_URL || process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";

if (!SUBGRAPH_URL) {
  console.warn("WARNING: SUBGRAPH_URL is not defined in environment variables");
}

export class SubgraphError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "SubgraphError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

type GraphQlError = {
  message: string;
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: GraphQlError[];
};

export async function querySubgraph<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new SubgraphError(
      "Subgraph URL is not configured",
      "SUBGRAPH_NOT_CONFIGURED",
      500
    );
  }

  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new SubgraphError(
      `Subgraph responded with status ${response.status}`,
      "SUBGRAPH_UNAVAILABLE",
      502,
      { status: response.status }
    );
  }

  const payload = (await response.json()) as GraphQlResponse<T>;

  if (payload.errors?.length) {
    throw new SubgraphError(
      "Subgraph returned errors for the query",
      "SUBGRAPH_QUERY_ERROR",
      502,
      payload.errors.map((entry) => entry.message)
    );
  }

  if (!payload.data) {
    throw new SubgraphError(
      "Subgraph response did not include data",
      "SUBGRAPH_EMPTY_RESPONSE",
      502
    );
  }

  return payload.data;
}

export function toSecondsNow() {
  return Math.floor(Date.now() / 1000);
}

export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function maskAddress(address: string) {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function toLowerHex(value: string) {
  return value.toLowerCase();
}
