import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { getPrivateKey } from "../config/jwt";
import * as userRepo from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import type { LoginDto, RegisterDto } from "../models/auth.schemas";
import type { JwtPayload } from "../types";

const REFRESH_PREFIX = "refresh:";

function generateAccessToken(
  userId: string,
  roles: JwtPayload["roles"],
): string {
  return jwt.sign(
    { sub: userId, roles } satisfies Omit<JwtPayload, "iat" | "exp">,
    getPrivateKey(),
    {
      algorithm: "RS256",
      expiresIn: env.jwt.accessTokenExpiry as jwt.SignOptions["expiresIn"],
    },
  );
}

async function storeRefreshToken(userId: string): Promise<string> {
  const token = uuidv4();

  await redis.set(
    `${REFRESH_PREFIX}${token}`,
    userId,
    "EX",
    env.jwt.refreshTokenExpiry,
  );

  return token;
}

export async function register(dto: RegisterDto) {
  const existing = await userRepo.findByEmail(dto.email);

  if (existing) throw AppError.conflict("Email already in use");

  const passwordHash = await bcrypt.hash(dto.password, 12);

  const user = await userRepo.create({
    name: dto.name,
    email: dto.email,
    passwordHash,
  });

  const accessToken = generateAccessToken(user.id, user.roles);

  const refreshToken = await storeRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(dto: LoginDto) {
  const user = await userRepo.findByEmail(dto.email);

  if (!user || !user.is_active)
    throw AppError.unauthorized("Invalid credentials");

  const valid = await bcrypt.compare(dto.password, user.password_hash);

  if (!valid) throw AppError.unauthorized("Invalid credentials");

  const accessToken = generateAccessToken(user.id, user.roles);
  const refreshToken = await storeRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(token: string) {
  const userId = await redis.get(`${REFRESH_PREFIX}${token}`);

  if (!userId) throw AppError.unauthorized("Invalid or expired refresh token");

  const pipeline = redis.pipeline();
  pipeline.del(`${REFRESH_PREFIX}${token}`);

  await pipeline.exec();

  const user = await userRepo.findById(userId);

  if (!user || !user.is_active)
    throw AppError.unauthorized("User not found or inactive");

  const accessToken = generateAccessToken(user.id, user.roles);
  const refreshToken = await storeRefreshToken(user.id);

  return { accessToken, refreshToken };
}

export async function logout(token: string): Promise<void> {
  await redis.del(`${REFRESH_PREFIX}${token}`);
}
