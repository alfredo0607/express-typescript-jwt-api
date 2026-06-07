import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import type { LoginDto, RegisterDto, RefreshDto } from "../models/auth.schemas";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body as RegisterDto);

    res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginDto);

    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshDto;

    const result = await authService.refresh(refreshToken);

    res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as RefreshDto;

    await authService.logout(refreshToken);

    res.json({ status: "success", message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}
