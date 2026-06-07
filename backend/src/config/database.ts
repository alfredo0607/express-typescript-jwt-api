import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  min: env.db.poolMin,
  max: env.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function connectDatabase(): Promise<void> {
  const client = await pool.connect();

  client.release();
  console.log("✓ PostgreSQL connected");
}
