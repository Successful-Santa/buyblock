import express from "express";
import multer from "multer";
import { uploadBuffer } from "../ipfs.js";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const cid = await uploadBuffer(req.file.buffer);
    res.json({ cid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
