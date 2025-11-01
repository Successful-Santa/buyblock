import express from "express";
import { query } from "../db.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Search and filter parcels
router.get("/parcels/search", async (req, res) => {
  try {
    const {
      owner,
      status,
      minValue,
      maxValue,
      minArea,
      maxArea,
      location,
      verified,
    } = req.query;

    let sql = "SELECT * FROM parcels WHERE 1=1";
    const params = [];

    if (owner) {
      sql += " AND owner = ?";
      params.push(owner);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (minValue) {
      sql += " AND value >= ?";
      params.push(minValue);
    }
    if (maxValue) {
      sql += " AND value <= ?";
      params.push(maxValue);
    }
    if (minArea) {
      sql += " AND area >= ?";
      params.push(minArea);
    }
    if (maxArea) {
      sql += " AND area <= ?";
      params.push(maxArea);
    }
    if (location) {
      sql += " AND location LIKE ?";
      params.push(`%${location}%`);
    }
    if (verified !== undefined) {
      sql += " AND is_verified = ?";
      params.push(verified === "true");
    }

    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property history (transfers, valuations, disputes)
router.get("/parcels/:parcelId/history", async (req, res) => {
  try {
    const { parcelId } = req.params;

    // Get ownership history
    const ownershipSql = `
            SELECT * FROM ownership_history 
            WHERE parcel_id = ? 
            ORDER BY changed_at DESC
        `;
    const { rows: ownershipHistory } = await query(ownershipSql, [parcelId]);

    // Get valuation history
    const valuationSql = `
            SELECT * FROM property_valuations 
            WHERE parcel_id = ? 
            ORDER BY valuation_date DESC
        `;
    const { rows: valuationHistory } = await query(valuationSql, [parcelId]);

    // Get dispute history
    const disputeSql = `
            SELECT * FROM property_disputes 
            WHERE parcel_id = ? 
            ORDER BY dispute_date DESC
        `;
    const { rows: disputeHistory } = await query(disputeSql, [parcelId]);

    res.json({
      ownershipHistory,
      valuationHistory,
      disputeHistory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload property documents
router.post(
  "/parcels/:parcelId/documents",
  upload.single("document"),
  async (req, res) => {
    try {
      const { parcelId } = req.params;
      const { documentType } = req.body;
      const documentUri = req.file.path;

      const sql = `
            INSERT INTO property_documents (
                parcel_id, document_type, document_uri
            ) VALUES (?, ?, ?)
        `;
      await query(sql, [parcelId, documentType, documentUri]);

      res.json({ message: "Document uploaded successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Add property valuation
router.post("/parcels/:parcelId/valuations", async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { value, valuationType, appraiser } = req.body;

    const sql = `
            INSERT INTO property_valuations (
                parcel_id, value, valuation_type, appraiser
            ) VALUES (?, ?, ?, ?)
        `;
    await query(sql, [parcelId, value, valuationType, appraiser]);

    // Update current value in parcels table
    await query("UPDATE parcels SET value = ? WHERE parcel_id = ?", [
      value,
      parcelId,
    ]);

    res.json({ message: "Valuation added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Raise a dispute
router.post("/parcels/:parcelId/disputes", async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { disputeType, description, disputedBy } = req.body;

    // Start a database transaction
    await query("BEGIN TRANSACTION");

    // Add dispute record
    const disputeSql = `
            INSERT INTO property_disputes (
                parcel_id, dispute_type, description, disputed_by
            ) VALUES (?, ?, ?, ?)
        `;
    await query(disputeSql, [parcelId, disputeType, description, disputedBy]);

    // Update parcel status
    await query("UPDATE parcels SET status = ? WHERE parcel_id = ?", [
      "disputed",
      parcelId,
    ]);

    // Commit transaction
    await query("COMMIT");

    res.json({ message: "Dispute raised successfully" });
  } catch (error) {
    await query("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
});

// Get analytics for a property
router.get("/parcels/:parcelId/analytics", async (req, res) => {
  try {
    const { parcelId } = req.params;

    // Get valuation trends
    const valuationSql = `
            SELECT value, valuation_date 
            FROM property_valuations 
            WHERE parcel_id = ? 
            ORDER BY valuation_date ASC
        `;
    const { rows: valuationTrends } = await query(valuationSql, [parcelId]);

    // Get nearby property values
    const nearbyValuesSql = `
            SELECT p.parcel_id, p.value, p.area
            FROM parcels p
            WHERE p.parcel_id != ? 
            AND p.value IS NOT NULL
            LIMIT 5
        `;
    const { rows: nearbyValues } = await query(nearbyValuesSql, [parcelId]);

    // Calculate price per square meter trends
    const pricePerArea = valuationTrends.map((v) => ({
      date: v.valuation_date,
      value: v.value,
      pricePerSqm: v.value / v.area,
    }));

    res.json({
      valuationTrends,
      nearbyValues,
      pricePerArea,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate property report
router.get("/parcels/:parcelId/report", async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { format = "json" } = req.query;

    // Gather all property information
    const [
      parcelInfo,
      ownershipHistory,
      valuationHistory,
      documents,
      disputes,
    ] = await Promise.all([
      query("SELECT * FROM parcels WHERE parcel_id = ?", [parcelId]),
      query("SELECT * FROM ownership_history WHERE parcel_id = ?", [parcelId]),
      query("SELECT * FROM property_valuations WHERE parcel_id = ?", [
        parcelId,
      ]),
      query("SELECT * FROM property_documents WHERE parcel_id = ?", [parcelId]),
      query("SELECT * FROM property_disputes WHERE parcel_id = ?", [parcelId]),
    ]);

    const report = {
      propertyDetails: parcelInfo.rows[0],
      ownershipHistory: ownershipHistory.rows,
      valuationHistory: valuationHistory.rows,
      documents: documents.rows,
      disputes: disputes.rows,
      generatedAt: new Date().toISOString(),
    };

    if (format === "pdf") {
      // TODO: Implement PDF generation
      res.status(501).json({ error: "PDF format not yet supported" });
    } else {
      res.json(report);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
