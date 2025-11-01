import { create as createIpfsClient } from "ipfs-http-client";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_PROJECT_SECRET;
let client;

if (projectId && projectSecret) {
  const auth = `Basic ${Buffer.from(projectId + ":" + projectSecret).toString(
    "base64"
  )}`;
  client = createIpfsClient({
    url: process.env.IPFS_URL || "https://ipfs.infura.io:5001",
    headers: { authorization: auth },
  });
} else {
  client = createIpfsClient({
    url: process.env.IPFS_URL || "http://127.0.0.1:5001",
  });
}

async function uploadBuffer(buffer) {
  const { cid } = await client.add(buffer);
  return cid.toString();
}

async function fetchJson(cid) {
  const chunks = [];
  for await (const chunk of client.cat(cid)) {
    chunks.push(chunk);
  }
  const buf = Buffer.concat(chunks);
  return JSON.parse(buf.toString());
}

export { uploadBuffer, fetchJson };
