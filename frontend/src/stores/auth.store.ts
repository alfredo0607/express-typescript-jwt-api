import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthResponse } from "@/types";
import { tokenStorage } from "@/lib/api/client";

interface AuthState {
  user: Pick<User, "id" | "name" | "email" | "roles"> | null;
  isAuthenticated: boolean;
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (response) => {
        tokenStorage.set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        set({ user: response.user, isAuthenticated: true });
      },

      clearAuth: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.roles.includes("admin") ?? false,
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
