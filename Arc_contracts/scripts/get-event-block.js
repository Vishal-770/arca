const { ethers } = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xf9E298Fb973077C70278C657C543502345e7E75F";
  const gateway = await ethers.getContractAt("SubscriptionGateway", CONTRACT_ADDRESS);

  const filter = gateway.filters.PlanCreated();
  const currentBlock = await ethers.provider.getBlockNumber();
  const startBlock = Math.max(0, currentBlock - 9000);
  
  console.log(`Scanning blocks ${startBlock} to ${currentBlock}...`);
  const events = await gateway.queryFilter(filter, startBlock, "latest");
  
  if (events.length === 0) {
    console.log("No PlanCreated events found in this block range.");
    return;
  }

  events.forEach((event, i) => {
    console.log(`Event #${i + 1}:`);
    console.log(`- Block Number: ${event.blockNumber}`);
    console.log(`- Transaction Hash: ${event.transactionHash}`);
    console.log(`- Plan ID: ${event.args.planId}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
