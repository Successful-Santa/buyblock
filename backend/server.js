import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import parcelsRouter from "./routes/parcels.js";
import adminRouter from "./routes/admin.js";
import uploadRouter from "./routes/upload.js";
import apiRouter from "./routes/api.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 150 }));

app.use("/api/parcels", parcelsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/upload", uploadRouter);
app.use("/api", apiRouter);

// simple health / root route to avoid "Cannot GET /" in the browser
app.get("/", (req, res) => {
  res.send("Land Registry Backend is running. Try /api/parcels for data.");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
