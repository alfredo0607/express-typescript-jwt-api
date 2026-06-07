import "dotenv/config";

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
  PORT: parseInt(optionalEnv("PORT", "3000"), 10),

  db: {
    host: optionalEnv("DB_HOST", "localhost"),
    port: parseInt(optionalEnv("DB_PORT", "5432"), 10),
    name: optionalEnv("DB_NAME", "jwt_api_db"),
    user: optionalEnv("DB_USER", "postgres"),
    password: optionalEnv("DB_PASSWORD", ""),
    poolMin: parseInt(optionalEnv("DB_POOL_MIN", "2"), 10),
    poolMax: parseInt(optionalEnv("DB_POOL_MAX", "10"), 10),
  },

  redis: {
    host: optionalEnv("REDIS_HOST", "localhost"),
    port: parseInt(optionalEnv("REDIS_PORT", "6379"), 10),
    password: process.env["REDIS_PASSWORD"] || undefined,
  },

  jwt: {
    privateKeyPath: optionalEnv("JWT_PRIVATE_KEY_PATH", "./keys/private.pem"),
    publicKeyPath: optionalEnv("JWT_PUBLIC_KEY_PATH", "./keys/public.pem"),
    accessTokenExpiry: optionalEnv("JWT_ACCESS_TOKEN_EXPIRY", "15m"),
    refreshTokenExpiry: parseInt(
      optionalEnv("JWT_REFRESH_TOKEN_EXPIRY", "604800"),
      10,
    ),
  },

  rateLimit: {
    windowMs: parseInt(optionalEnv("RATE_LIMIT_WINDOW_MS", "900000"), 10),
    maxRequests: parseInt(optionalEnv("RATE_LIMIT_MAX_REQUESTS", "100000"), 10),
    loginMax: parseInt(optionalEnv("LOGIN_RATE_LIMIT_MAX", "150"), 10),
  },

  cors: {
    origins: optionalEnv("CORS_ORIGIN", "http://localhost:3001").split(","),
  },

  logLevel: optionalEnv("LOG_LEVEL", "dev"),
} as const;

export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
