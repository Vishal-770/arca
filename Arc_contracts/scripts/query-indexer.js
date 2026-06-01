async function main() {
  const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1704298/arca/v0.0.2";
  console.log(`Querying Graph Subgraph Indexer at: ${SUBGRAPH_URL}\n`);

  const query = `
    query {
      _meta {
        block {
          number
          hash
        }
        hasIndexingErrors
      }
      plans(orderBy: createdAt, orderDirection: desc) {
        id
        active
        duration
        ipfsHash
        createdAt
        seller {
          id
        }
      }
      tiers(orderBy: id, orderDirection: asc) {
        id
        tierId
        price
        label
        active
        plan {
          id
        }
      }
    }
  `;

  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      return;
    }

    const meta = result.data ? result.data._meta : null;
    if (meta) {
      console.log(`Indexer Sync Progress:`);
      console.log(`- Synced Block Number:  ${meta.block.number}`);
      console.log(`- Synced Block Hash:    ${meta.block.hash}`);
      console.log(`- Has Indexing Errors:  ${meta.hasIndexingErrors}\n`);
    }

    const { plans = [], tiers = [] } = result.data || {};
    console.log(`Indexed Plans found: ${plans.length}`);
    console.log(`Indexed Tiers found: ${tiers.length}\n`);

    if (plans.length === 0) {
      console.log("No plans are currently indexed by the subgraph.");
      return;
    }

    plans.forEach((plan, index) => {
      console.log(`--------------------------------------------------`);
      console.log(`Indexed Plan #${index + 1}`);
      console.log(`Plan ID:    ${plan.id}`);
      console.log(`Active:     ${plan.active}`);
      console.log(`Duration:   ${plan.duration} seconds (${(Number(plan.duration) / 86400).toFixed(2)} days)`);
      console.log(`IPFS Hash:  ${plan.ipfsHash}`);
      console.log(`Seller ID:  ${plan.seller ? plan.seller.id : "None"}`);
      console.log(`Created At: ${new Date(Number(plan.createdAt) * 1000).toLocaleString()}`);

      const planTiers = tiers.filter(t => t.plan && t.plan.id.toLowerCase() === plan.id.toLowerCase());
      if (planTiers.length > 0) {
        console.log("Pricing Tiers:");
        planTiers.forEach(t => {
          const priceFormatted = (Number(t.price) / 1000000).toFixed(2);
          console.log(`  - Tier #${t.tierId} [${t.label}]: $${priceFormatted} USDC (Active: ${t.active})`);
        });
      } else {
        console.log("No pricing tiers found for this plan in indexer.");
      }
      console.log(`--------------------------------------------------\n`);
    });

  } catch (error) {
    console.error("Failed to query indexer:", error);
  }
}

main();
