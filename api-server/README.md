# Arca API Server

Express API gateway that serves SDK read endpoints and merchant analytics endpoints for the Arca Protocol.

## Features

- SDK-facing plan lookup with optional subscription state.
- Merchant API for wallet, plans, subscribers, and analytics.
- API key authentication for all `/api/v1/*` endpoints.
- Subgraph integration for onchain data and IPFS metadata lookups.
- Health check endpoint.

## Base URL

- Local: `http://localhost:3001`

## Authentication

- Send `x-api-key` header.
- Supported key prefixes: `mp_live_` and `mp_test_`.

## Error Format

Most errors are returned as:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Health

- `GET /health`

Response:

```json
{
  "status": "OK",
  "timestamp": "2026-05-30T00:00:00.000Z"
}
```

### SDK

#### Get plan (SDK)

- `GET /api/sdk/plan/:planId`
- Headers: `x-api-key`
- Query: `userId` (optional)

Response:

```json
{
  "plan": {
    "id": "0x...",
    "name": "My Plan",
    "duration": "2592000",
    "brand": {
      "name": "Acme",
      "website": "https://acme.example"
    },
    "tiers": [
      {
        "id": "0x...",
        "label": "Pro",
        "price": "1000000",
        "features": [
          { "title": "Feature", "description": "Details" }
        ]
      }
    ]
  },
  "subscription": {
    "status": "ACTIVE",
    "remainingSeconds": 1234,
    "tierId": "0x...",
    "tierIds": ["0x..."]
  }
}
```

Notes:
- `subscription` is only included when `userId` is provided and a subscription state is found.

### Merchant API (v1)

All routes below require `x-api-key` and validate the key against MongoDB.

#### Get wallet

- `GET /api/v1/wallet`

Response:

```json
{
  "success": true,
  "walletAddress": "0x..."
}
```

#### List plans

- `GET /api/v1/plans`

Response:

```json
{
  "success": true,
  "plans": ["0x...", "0x..."]
}
```

#### Get plan metadata

- `GET /api/v1/plans/:id`

Response:

```json
{
  "success": true,
  "planId": "0x...",
  "metadata": {
    "name": "My Plan",
    "tiers": []
  }
}
```

#### List plan subscribers

- `GET /api/v1/plans/:id/subscribers`

Response:

```json
{
  "success": true,
  "subscribers": [
    {
      "subscriptionId": "0x...",
      "buyerAddress": "0x...",
      "buyerData": "user-123",
      "status": "ACTIVE",
      "lastEndTime": "1717000000",
      "totalSpent": "1000000"
    }
  ]
}
```

#### Plan analytics

- `GET /api/v1/plans/:id/analytics`

Response:

```json
{
  "success": true,
  "analytics": {
    "planId": "0x...",
    "active": true,
    "subscriptionCount": 10,
    "totalGrossVolume": "10000000",
    "totalFeesCollected": "100000",
    "netRevenue": "9900000",
    "lastSubscriptionAt": "1717000000",
    "createdAt": "1716000000",
    "updatedAt": "1717000000",
    "tiers": [
      { "tierId": "0x...", "price": "1000000", "label": "Pro", "active": true }
    ]
  }
}
```

#### Seller analytics

- `GET /api/v1/analytics`

Response:

```json
{
  "success": true,
  "analytics": {
    "sellerId": "0x...",
    "planCount": 2,
    "activePlanCount": 1,
    "subscriptionCount": 10,
    "totalGrossRevenue": "10000000",
    "totalNetRevenue": "9900000",
    "totalFeeContributed": "100000"
  }
}
```

## Status Codes

- `200` Success
- `400` Invalid input
- `401` Unauthorized (missing/invalid API key)
- `403` Forbidden (plan ownership mismatch)
- `404` Not found
- `502` Subgraph upstream error
- `503` Auth service unavailable
- `500` Internal server error

## Environment Variables

Required:
- `MONGODB_URI`
- `MONGODB_DB`

Recommended:
- `SUBGRAPH_URL` (or `NEXT_PUBLIC_SUBGRAPH_URL`)
- `IPFS_GATEWAY_BASE`
- `PORT`

## Scripts

- `pnpm dev` - run with `ts-node-dev`
- `pnpm build` - bundle with `tsup`
- `pnpm start` - run compiled build
