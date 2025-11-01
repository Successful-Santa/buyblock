import fs from "fs";
import path from "path";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const Land = await ethers.getContractFactory("LandRegistryWithSig");
  // use deployer as registrar in local dev (in production you'd pass a multisig/KMS address)
  const land = await Land.deploy(deployer.address);
  await land.waitForDeployment();
  console.log("LandRegistryWithSig deployed to:", await land.getAddress());

  const network = await ethers.provider.getNetwork();
  const out = {
    address: await land.getAddress(),
    chainId: network.chainId
  };

  const deploymentsDir = path.resolve(__dirname, "..", "..", "deployments");
  try { fs.mkdirSync(deploymentsDir, { recursive: true }); } catch {}
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.chainId}.json`), 
    JSON.stringify(
      { 
        address: out.address, 
        chainId: Number(out.chainId)
      }, 
      null, 
      2
    )
  );
  console.log("Wrote deployment info to deployments/");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
