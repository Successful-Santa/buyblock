import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { uploadBuffer } from "../ipfs.js";
import { getContractWithSigner } from "../blockchain.js";

async function main() {
  const filePath = process.argv[2];
  const owner = process.argv[3];
  if (!filePath || !owner) {
    console.log("Usage: node register_sample.js <file> <ownerAddress>");
    process.exit(1);
  }
  const buf = fs.readFileSync(filePath);
  const cid = await uploadBuffer(buf);
  console.log("Uploaded to IPFS CID:", cid);
  // compute docHash
  const docHash = "0x" + Buffer.from("doc-placeholder").toString("hex");
  const contract = getContractWithSigner();
  const tx = await contract.registerParcel(cid, docHash, owner);
  await tx.wait();
  console.log("Registered parcel on-chain");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
