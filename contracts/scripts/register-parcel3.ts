import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractAt(
    "LandRegistryWithSig",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  const geoCid = "ipfs://bafybeigdyrm3-bengaluru-003";
  const docHash = "0x2222222222222222222222222222222222222222222222222222222222222222";
  const owner = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Test account from Hardhat

  console.log("Registering parcel 3...");
  const tx = await contract.registerParcel(geoCid, docHash, owner);
  await tx.wait();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});