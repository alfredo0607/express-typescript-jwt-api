export type UserRole = "admin" | "user" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Pick<User, "id" | "name" | "email" | "roles">;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}
