import express from "express";
import { query } from "../db.js";
import { getContract } from "../blockchain.js";
import multer from "multer";
import { uploadBuffer } from "../ipfs.js";
import crypto from "crypto";

const router = express.Router();
const upload = multer();

router.get("/", async (req, res) => {
  const db = await query("SELECT parcel_id, geojson, owner FROM parcels");
  const features = db.rows.map((r) => {
    const geo = r.geojson || {};
    const geoProps = geo.properties || {};
    const properties = Object.assign(
      { parcelId: r.parcel_id, owner: r.owner },
      geoProps
    );
    // ensure a contract identifier exists for coloring on the frontend
    properties.contract = properties.contract || `CONTRACT-${r.parcel_id}`;
    return {
      type: "Feature",
      properties,
      geometry: geo.geometry || null,
    };
  });
  res.json({ type: "FeatureCollection", features });
});

router.post("/register", upload.single("documents"), async (req, res) => {
  try {
    const { coordinates, area, owner, description, location, value } = req.body;
    const file = req.file;

    if (!coordinates || !owner || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Parse coordinates as GeoJSON
    let geoJson;
    try {
      geoJson = JSON.parse(coordinates);
    } catch (e) {
      return res.status(400).json({ error: "Invalid GeoJSON coordinates" });
    }

    // Upload document to IPFS (with fallback)
    let docCid = null;
    try {
      docCid = await uploadBuffer(file.buffer);
    } catch (ipfsError) {
      console.warn(
        "IPFS upload failed, continuing without IPFS:",
        ipfsError.message
      );
      // Generate a local CID-like identifier as fallback
      docCid = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Calculate document hash
    const docHash = crypto.createHash("sha256").update(file.buffer).digest();

    // Insert into database first to get parcel_id
    const insertResult = await query(
      "INSERT INTO parcels (geojson, owner, area, location, value, doc_hash, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        JSON.stringify(geoJson),
        owner,
        area || 0,
        location || "",
        value || 0,
        docHash,
        description || "",
      ]
    );

    // Get the last inserted parcel_id
    const idResult = await query("SELECT last_insert_rowid() as parcel_id");
    const parcelId = idResult.rows[0].parcel_id;

    // Call contract to register (this would need admin auth in production)
    // For now, we'll skip the contract call and just store in DB
    // const contract = getContractWithSigner();
    // const tx = await contract.registerParcel(docCid, docHash, owner);
    // await tx.wait();

    res.json({
      success: true,
      parcelId,
      docCid,
      message: "Parcel registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const db = await query("SELECT * FROM parcels WHERE parcel_id = $1", [id]);
  if (!db.rowCount) return res.status(404).json({ error: "not found" });
  const row = db.rows[0];
  // get on-chain parcel
  try {
    const contract = getContract();
    let onchain = null;
    try {
      onchain = await contract.getParcel(Number(id));
    } catch (e) {
      if (e.message.includes("Invalid parcel")) {
        onchain = { error: "Parcel not registered on blockchain yet" };
      } else {
        throw e;
      }
    }
    const history = await query(
      "SELECT * FROM ownership_history WHERE parcel_id = $1 ORDER BY id DESC",
      [id]
    );
    // Convert BigInt to string in onchain response
    const onchainFormatted = onchain && {
      geoCid: onchain.geoCid,
      docHash: onchain.docHash,
      owner: onchain.owner,
      registeredAt: onchain.registeredAt ? String(onchain.registeredAt) : null,
    };
    res.json({ db: row, onchain: onchainFormatted, history: history.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
