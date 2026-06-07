import type { UserRole } from "../types";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  roles: UserRole[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, "password_hash">;
