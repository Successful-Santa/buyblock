import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const signer = signers[0];
  console.log("Registering parcels with", signer.address);

  // Read local DB
  const dbPath = path.resolve(__dirname, "../../backend/db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  
  // Get contract
  const network = await ethers.provider.getNetwork();
  const deploymentsPath = path.resolve(__dirname, "../../deployments");
  const deploymentFile = path.join(deploymentsPath, `${network.chainId}.json`);
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  
  const land = await ethers.getContractAt("LandRegistryWithSig", deployment.address);

  // Register each parcel
  for (const parcel of db.parcels) {
    console.log(`Registering parcel ${parcel.parcel_id}...`);
    const geoCid = parcel.geojson.properties.geoCid;
    const docHash = `0x${parcel.doc_hash}`;
    const owner = parcel.owner;
    
    try {
      // Check if already registered
      try {
        await land.getParcel(parcel.parcel_id);
        console.log(`Parcel ${parcel.parcel_id} already registered, skipping`);
        continue;
      } catch (e: any) {
        if (!e.message?.includes("Invalid parcel")) throw e;
      }

      const tx = await land.registerParcel(geoCid, docHash, owner);
      await tx.wait();
      console.log(`Registered parcel ${parcel.parcel_id}`);
    } catch (e: any) {
      console.error(`Failed to register parcel ${parcel.parcel_id}:`, e.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});