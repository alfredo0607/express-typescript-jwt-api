import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { router as authRouter } from "./routes/auth.routes";
import { router as usersRouter } from "./routes/users.routes";
import { setupSwagger } from "./docs/swagger";

// Create Express application

const app: express.Application = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(
  cors({
    origin: env.cors.origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// 3. Rate limiter global (por IP)
app.use(globalRateLimiter);

// 4. Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 5. Request logging
app.use(morgan(env.logLevel));

// 6. Swagger docs
setupSwagger(app);

// 7. Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

// 8. Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 9. 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// 10. Global error handler
app.use(errorHandler);

export { app };
