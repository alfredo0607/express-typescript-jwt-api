import { apiClient } from "./client";
import type { ApiResponse, User, UserRole } from "@/types";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export const usersApi = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>("/api/users/me");
    return res.data.data!;
  },

  listUsers: async () => {
    const res = await apiClient.get<ApiResponse<User[]>>("/api/users");
    return res.data.data!;
  },

  createUser: async (data: CreateUserPayload) => {
    const res = await apiClient.post<ApiResponse<User>>("/api/users", data);
    return res.data.data!;
  },

  updateUser: async (id: string, data: UpdateUserPayload) => {
    const res = await apiClient.patch<ApiResponse<User>>(
      `/api/users/${id}`,
      data,
    );
    return res.data.data!;
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/api/users/${id}`);
  },
};
