export type UserRole = "admin" | "user" | "viewer";

export interface JwtPayload {
  sub: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  roles: UserRole[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
