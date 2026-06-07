import bcrypt from "bcrypt";
import * as userRepo from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import type {
  UpdateUserDto,
  AdminUpdateUserDto,
  CreateUserByAdminDto,
} from "../models/users.schemas";
import type { AuthUser } from "../types";

export async function getProfile(userId: string) {
  const user = await userRepo.findById(userId);

  if (!user) throw AppError.notFound("User not found");

  const { password_hash: _, ...publicUser } = user;

  return publicUser;
}

export async function listUsers() {
  return userRepo.findAll();
}

export async function createUser(dto: CreateUserByAdminDto) {
  const existing = await userRepo.findByEmail(dto.email);
  if (existing) throw AppError.conflict("Email already in use");

  const passwordHash = await bcrypt.hash(dto.password, 12);
  const user = await userRepo.create({
    name: dto.name,
    email: dto.email,
    passwordHash,
    role: dto.role,
  });

  const { password_hash: _, ...publicUser } = user;
  return publicUser;
}

export async function updateUser(
  targetId: string,
  dto: AdminUpdateUserDto | UpdateUserDto,
  requester: AuthUser,
) {
  const isAdmin = requester.roles.includes("admin");
  const isOwner = requester.id === targetId;

  if (!isAdmin && !isOwner) throw AppError.forbidden();

  if (dto.email) {
    const existing = await userRepo.findByEmail(dto.email);

    if (existing && existing.id !== targetId)
      throw AppError.conflict("Email already in use");
  }

  const adminDto = dto as AdminUpdateUserDto;
  const updated = await userRepo.update(targetId, {
    name: dto.name,
    email: dto.email,
    ...(isAdmin && adminDto.role !== undefined ? { role: adminDto.role } : {}),
    ...(isAdmin && adminDto.is_active !== undefined
      ? { is_active: adminDto.is_active }
      : {}),
  });

  if (!updated) throw AppError.notFound("User not found");

  const { password_hash: _, ...publicUser } = updated;

  return publicUser;
}

export async function deleteUser(targetId: string) {
  const deleted = await userRepo.remove(targetId);
  if (!deleted) throw AppError.notFound("User not found");
}
