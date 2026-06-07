import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import type { UserRole } from "../types";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized();

    const hasRole = req.user.roles.some((r) => roles.includes(r));

    if (!hasRole) throw AppError.forbidden();

    next();
  };
}
