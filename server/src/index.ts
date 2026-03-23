import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";

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

// Start server
app.listen(PORT, () => {
  console.log(`ChainLock server running on port ${PORT}`);
});

export default app;
