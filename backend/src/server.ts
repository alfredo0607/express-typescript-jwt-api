import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const server = app.listen(env.PORT, () => {
    console.log(`✓ Server running on http://localhost:${env.PORT}`);
    console.log(`✓ Docs available at http://localhost:${env.PORT}/api/docs`);
    console.log(`✓ Cors available at ${env.cors.origins.join(", ")}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("Fatal error during bootstrap:", err);
  process.exit(1);
});
