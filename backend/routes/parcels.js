import express from "express";
import { query } from "../db.js";
import { getContract } from "../blockchain.js";

const router = express.Router();

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
