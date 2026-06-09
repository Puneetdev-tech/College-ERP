import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

app.use(cors({ origin: "*" })); // LAN — allow all origins
app.use(express.json({ limit: "10mb" })); // for base64 photos/logos
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api", routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

export default app;
