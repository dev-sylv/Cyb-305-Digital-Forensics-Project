import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/evidence", evidenceRoutes);

// Health check
app.get("/chainlock", (_req, res) => {
  res.json({ status: "Chain Lock server up and running" });
});

// Global error handler — must be last middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  // Handle Multer errors specifically
  if (err.name === "MulterError") {
    if (err.message === "File too large") {
      return res.status(413).json({ error: "File exceeds 20MB limit" });
    }
    return res.status(400).json({ error: err.message });
  }

  // Handle unsupported file type from fileFilter
  if (err.message === "Unsupported file type") {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`ChainLock server running on port ${PORT}`);
});

export default app;
