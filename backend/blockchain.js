import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC);

const deploymentsPath = path.resolve(process.cwd(), "../deployments");
let contractAddress = process.env.CONTRACT_ADDRESS;
let chainId = process.env.CHAIN_ID;
if (!contractAddress) {
  try {
    const files = fs.readdirSync(deploymentsPath);
    const last = files[0];
    const data = JSON.parse(
      fs.readFileSync(path.join(deploymentsPath, last), "utf8")
    );
    contractAddress = data.address;
    chainId = data.chainId;
  } catch (e) {
    // ignore
  }
}

const abiPath = path.resolve(process.cwd(), "src/abis/LandRegistry.json");
let abi = [];
try {
  abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
} catch {}

const registrarKey = process.env.REGISTRAR_PRIVATE_KEY || null;
let registrarSigner = null;
if (registrarKey) {
  const wallet = new ethers.Wallet(registrarKey, provider);
  registrarSigner = wallet;
}

function getContract() {
  if (!contractAddress) throw new Error("Contract address not set");
  return new ethers.Contract(contractAddress, abi, provider);
}

function getContractWithSigner() {
  if (!registrarSigner) throw new Error("Registrar signer not configured");
  return new ethers.Contract(contractAddress, abi, registrarSigner);
}

export { provider, getContract, getContractWithSigner, registrarSigner };
