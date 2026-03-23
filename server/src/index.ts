import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/chainlock", (_req, res) => {
  res.json({ status: "Chain Lock server up and running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`ChainLock server running on port ${PORT}`);
});

export default app;
