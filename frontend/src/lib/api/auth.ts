import { apiClient } from "./client";
import type { ApiResponse, AuthResponse, AuthTokens } from "@/types";

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      data,
    );
    return res.data.data!;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/auth/login",
      data,
    );
    return res.data.data!;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post("/api/auth/logout", { refreshToken });
  },

  refresh: async (refreshToken: string) => {
    const res = await apiClient.post<ApiResponse<AuthTokens>>(
      "/api/auth/refresh",
      {
        refreshToken,
      },
    );
    return res.data.data!;
  },
};
