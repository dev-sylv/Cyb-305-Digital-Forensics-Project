import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/authRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  cors({
    origin: ["https://chainlock-app.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/evidence", evidenceRoutes);

app.get("/api/chainlock", (_req, res) => {
  res.json({ status: "ok" });
});

// Global error handler — must be last
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    if (err.name === "MulterError") {
      if (err.message === "File too large") {
        return res.status(413).json({ error: "File exceeds 20MB limit" });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err.message === "Unsupported file type") {
      return res.status(400).json({ error: "Unsupported file type" });
    }
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`ChainLock server running on port ${PORT}`);
});

export default app;
