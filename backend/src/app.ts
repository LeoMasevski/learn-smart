import express from "express";
import cors from "cors";
import apiRoutes from "./routes";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { rateLimit, securityHeaders } from "./middleware/security.middleware";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.nodeEnv === "production" ? 1 : false);

app.use(securityHeaders);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (env.corsAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        Object.assign(new Error("Origin is not allowed by CORS"), {
          status: 403,
        })
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 600,
  })
);
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    keyPrefix: "api",
  })
);

// test route
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running",
  });
});

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
