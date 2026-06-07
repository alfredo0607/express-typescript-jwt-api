import axios from "axios";
import type { ApiResponse, AuthTokens } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const TOKEN_KEY = "auth_access_token";
const REFRESH_KEY = "auth_refresh_token";

function setCookie(name: string, value: string) {
  // 1 día de vida — el refresh token rota y mantiene la sesión
  const expires = new Date(Date.now() + 86_400_000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const tokenStorage = {
  getAccess: () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  getRefresh: () =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,
  set: (tokens: AuthTokens) => {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    // Cookie necesaria para que el middleware de Next.js pueda leer el token server-side
    setCookie(TOKEN_KEY, tokens.accessToken);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    deleteCookie(TOKEN_KEY);
  },
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post<ApiResponse<AuthTokens>>(
        `${BASE_URL}/api/auth/refresh`,
        { refreshToken },
      );

      const tokens = data.data!;
      tokenStorage.set(tokens);

      refreshQueue.forEach((cb) => cb(tokens.accessToken));
      refreshQueue = [];

      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(original);
    } catch {
      tokenStorage.clear();
      refreshQueue = [];
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
