import dotenv from "dotenv";

dotenv.config();

export const ARC_CHAIN_ID = 5042002;
export const ARC_BLOCKCHAIN = "ARC-TESTNET";

export const SUBSCRIPTION_GATEWAY_ADDRESS =
  process.env.SUBSCRIPTION_GATEWAY_ADDRESS ??
  process.env.NEXT_PUBLIC_SUBSCRIPTION_GATEWAY_ADDRESS ??
  "0x094D8A6dEDF25ee8ccFe093ac48514B83b7e73D2";

export const ARC_USDC_ADDRESS =
  process.env.ARC_USDC_ADDRESS ??
  process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS ??
  "0x3600000000000000000000000000000000000000";

export const ARC_RPC_URL =
  process.env.ARC_RPC_URL ??
  process.env.NEXT_PUBLIC_ARC_RPC_URL ??
  "https://rpc.testnet.arc.network";

export const IPFS_GATEWAY_BASE =
  process.env.IPFS_GATEWAY_BASE ??
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE ??
  "https://ipfs.filebase.io/ipfs/";

export function normalizeIpfsUri(ipfsHash: string) {
  return ipfsHash.startsWith("ipfs://") ? ipfsHash : `ipfs://${ipfsHash}`;
}

export function ipfsHashToHttpUrl(ipfsHash: string) {
  const normalized = normalizeIpfsUri(ipfsHash);
  return `${IPFS_GATEWAY_BASE}${normalized.replace("ipfs://", "")}`;
}

export function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
