const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ethers = hre.ethers;
  const [deployer] = await ethers.getSigners();
  const deploymentsDir = path.resolve(__dirname, "..", "..", "deployments");
  const files = fs.readdirSync(deploymentsDir);
  const data = JSON.parse(fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8"));
  const address = data.address;

  const Land = await ethers.getContractFactory("LandRegistryWithSig");
  const land = Land.attach(address).connect(deployer);

  console.log("Registering sample parcels from", deployer.address, "to contract", address);

  const samples = [
    { geoCid: "ipfs://bafybeigdyrm1-mumbai-001", docHash: "0x" + "00".repeat(32) },
    { geoCid: "ipfs://bafybeigdyrm2-delhi-002", docHash: "0x" + "11".repeat(32) },
    { geoCid: "ipfs://bafybeigdyrm3-bengaluru-003", docHash: "0x" + "22".repeat(32) }
  ];

  for (const s of samples) {
    const tx = await land.registerParcel(s.geoCid, s.docHash, deployer.address);
    const receipt = await tx.wait();
    console.log("Registered", s.geoCid, "tx", receipt.transactionHash);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
