import dotenv from "dotenv";
import { getContract, provider } from "./blockchain.js";
import { query } from "./db.js";

dotenv.config();

async function run() {
  const contract = getContract();
  // get last checkpoint
  const res = await query("SELECT block_number FROM checkpoints WHERE id=$1", [
    "block",
  ]);
  let fromBlock = res.rowCount ? parseInt(res.rows[0].block_number) + 1 : 0;

  console.log("Starting indexer from block", fromBlock);

  contract.on(
    "ParcelRegistered",
    async (parcelId, geoCid, docHash, owner, event) => {
      try {
        const block = event.blockNumber || (await provider.getBlockNumber());
        // upsert parcel into db (simple)
        const geojson = JSON.stringify({
          type: "Feature",
          properties: { geoCid },
          geometry: null,
        });
        await query(
          `INSERT INTO parcels(parcel_id, geojson, doc_hash, owner, registered_at) VALUES($1,$2,$3,$4,now()) ON CONFLICT (parcel_id) DO UPDATE SET owner = $4`,
          [
            parcelId.toString(),
            geojson,
            Buffer.from(docHash.slice(2), "hex"),
            owner,
          ]
        );
        await query(
          "INSERT INTO checkpoints(id, block_number) VALUES($1,$2) ON CONFLICT (id) DO UPDATE SET block_number = $2",
          ["block", block]
        );
        console.log("Imported parcel", parcelId.toString());
      } catch (e) {
        console.error(e);
      }
    }
  );

  contract.on(
    "OwnershipTransferred",
    async (parcelId, previousOwner, newOwner, event) => {
      try {
        const block = event.blockNumber || (await provider.getBlockNumber());
        await query(
          "INSERT INTO ownership_history(parcel_id, previous_owner, new_owner, changed_at) VALUES($1,$2,$3,now())",
          [parcelId.toString(), previousOwner, newOwner]
        );
        await query("UPDATE parcels SET owner=$1 WHERE parcel_id=$2", [
          newOwner,
          parcelId.toString(),
        ]);
        await query(
          "INSERT INTO checkpoints(id, block_number) VALUES($1,$2) ON CONFLICT (id) DO UPDATE SET block_number = $2",
          ["block", block]
        );
        console.log("Ownership transferred for", parcelId.toString());
      } catch (e) {
        console.error(e);
      }
    }
  );

  console.log("Indexer listening to events...");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
