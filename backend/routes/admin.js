import express from "express";
import {
  getContractWithSigner,
  getContract,
  registrarSigner,
} from "../blockchain.js";
import { uploadBuffer } from "../ipfs.js";
import { query } from "../db.js";

const router = express.Router();

// Placeholder admin middleware - replace with real auth
function requireAdmin(req, res, next) {
  return next();
}

router.post("/register", requireAdmin, async (req, res) => {
  const { geoCid, docHashHex, initialOwner } = req.body;
  try {
    const contract = getContractWithSigner();
    const tx = await contract.registerParcel(geoCid, docHashHex, initialOwner);
    await tx.wait();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/executeSignedTransfer", requireAdmin, async (req, res) => {
  const { parcelId, to, nonce, deadline, signature } = req.body;
  try {
    // verify signature server-side using on-chain owner
    const contract = getContract();
    const p = await contract.getParcel(Number(parcelId));
    const owner = p[2];
    // EIP-712 verify: we simply forward to contract and let it validate
    if (!registrarSigner)
      return res.status(500).json({ error: "registrar signer not configured" });
    const contractWithSigner = getContractWithSigner();
    const tx = await contractWithSigner.executeTransferWithSig(
      Number(parcelId),
      to,
      Number(nonce),
      Number(deadline),
      signature
    );
    await tx.wait();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
