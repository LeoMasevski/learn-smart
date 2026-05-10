import express from "express";
import cors from "cors";
import apiRoutes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running",
  });
});

app.use("/api", apiRoutes);

export default app;