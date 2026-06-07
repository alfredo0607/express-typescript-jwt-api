import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getPublicKey } from "../config/jwt";
import { AppError } from "../utils/AppError";
import type { JwtPayload, AuthUser } from "../types";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, getPublicKey(), {
      algorithms: ["RS256"],
    }) as JwtPayload;

    req.user = { id: payload.sub, roles: payload.roles } satisfies AuthUser;

    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
