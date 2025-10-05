// =============================================
// File: src/app.js (excerpt)
// Mount EMR routes
// =============================================
import express from "express";
import cors from "cors";
import emrRoutes from "./routes/emrRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", emrRoutes);

export default app;