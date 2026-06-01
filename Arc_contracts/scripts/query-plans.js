const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xf9E298Fb973077C70278C657C543502345e7E75F";
  console.log(`Querying SubscriptionGateway contract at: ${CONTRACT_ADDRESS}\n`);

  // Get contract instance
  const gateway = await ethers.getContractAt("SubscriptionGateway", CONTRACT_ADDRESS);

  // 1. Fetch current planNonce
  const nonce = await gateway.planNonce();
  console.log(`Current Plan Nonce (Total Plans Created): ${nonce.toString()}`);

  // 2. Fetch all PlanCreated events within recent range
  console.log("Fetching PlanCreated events from blockchain (recent blocks)...");
  const filter = gateway.filters.PlanCreated();
  
  const currentBlock = await ethers.provider.getBlockNumber();
  const startBlock = Math.max(0, currentBlock - 9000);
  console.log(`Current block: ${currentBlock}. Querying logs from block ${startBlock} to ${currentBlock}...`);
  
  const events = await gateway.queryFilter(filter, startBlock, "latest");
  console.log(`Found ${events.length} PlanCreated events in this range.\n`);

  if (events.length === 0) {
    console.log("No plans have been registered on-chain recently.");
    return;
  }

  // 3. Print details for each plan
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const planId = event.args.planId;
    const seller = event.args.seller;
    const duration = Number(event.args.duration); // Convert BigInt to Number
    const ipfsHash = event.args.ipfsHash;

    console.log(`--------------------------------------------------`);
    console.log(`Plan #${i + 1}`);
    console.log(`Plan ID:    ${planId}`);
    console.log(`Seller:     ${seller}`);
    console.log(`Duration:   ${duration} seconds (${(duration / 86400).toFixed(2)} days)`);
    console.log(`IPFS Hash:  ${ipfsHash}`);

    // Query current on-chain state of this plan
    const planState = await gateway.plans(planId);
    console.log(`Active:     ${planState.active}`);
    console.log(`Tiers Count: ${planState.tierCount.toString()}`);

    const tierCount = Number(planState.tierCount);
    if (tierCount > 0) {
      console.log(`Tiers:`);
      for (let t = 0; t < tierCount; t++) {
        const tier = await gateway.getTier(planId, t);
        // Price is stored in 6 decimal places (USDC)
        const price = ethers.formatUnits(tier.price, 6);
        console.log(`  - Tier #${t} [${tier.label}]: $${price} USDC (Active: ${tier.active})`);
      }
    }
    console.log(`--------------------------------------------------\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
