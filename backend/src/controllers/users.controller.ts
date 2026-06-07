import { Request, Response, NextFunction } from "express";
import * as usersService from "../services/users.service";
import type { UpdateUserDto, CreateUserByAdminDto } from "../models/users.schemas";
import { AppError } from "../utils/AppError";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await usersService.createUser(req.body as CreateUserByAdminDto);
    res.status(201).json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw AppError.unauthorized();

    const user = await usersService.getProfile(req.user.id);

    res.json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await usersService.listUsers();

    res.json({ status: "success", data: users });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw AppError.unauthorized();

    const user = await usersService.updateUser(
      req.params["id"] as string,
      req.body as UpdateUserDto,
      req.user,
    );

    res.json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await usersService.deleteUser(req.params["id"] as string);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
