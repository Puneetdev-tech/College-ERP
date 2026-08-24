import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// API Routes
app.use("/api", routes);

// Serve React Production Build
const frontendPath = path.join(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Global Error Handler
// Controllers use errRes() for expected errors; this catches any unhandled exceptions.
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err);

  // Map Prisma known error codes to appropriate HTTP statuses
  let status = err.status || 500;
  if (err.code === "P2025") status = 404; // Record not found
  if (err.code === "P2002") status = 409; // Unique constraint violation
  if (err.code === "P2003") status = 400; // Foreign key constraint failed

  res.status(status).json({
    success: false,
    message: err.message || "An unexpected error occurred. Please try again.",
    error:   process.env.NODE_ENV !== "production" ? err.message : undefined
  });
});

export default app;