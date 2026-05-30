import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sdkRouter from "./routes/sdk";
import v1Router from "./routes/v1";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
app.use(cors({ origin: "*" })); // Permissive CORS for direct dApp and developer fetches
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use("/api/sdk", sdkRouter);
app.use("/api/v1", v1Router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Universal Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚡ Arca SDK & Consumer API Gateway is running on port ${PORT}`);
});
