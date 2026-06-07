"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ message: string }> }
      | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(", ");
    if (data?.message) return data.message;
  }
  return fallback;
}

export function useAuth() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { user, isAuthenticated, setAuth, clearAuth, isAdmin } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: usersApi.getProfile,
    enabled: isAuthenticated,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data);
      toast.success(`Bienvenido, ${data.user.name}`);
      router.push("/dashboard");
    },
    onError: (error: unknown) =>
      toast.error(extractErrorMessage(error, "Credenciales incorrectas")),
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data);
      toast.success("Cuenta creada exitosamente");
      router.push("/dashboard");
    },
    onError: (error: unknown) =>
      toast.error(extractErrorMessage(error, "Error al crear la cuenta")),
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem("auth_refresh_token") ?? "";
      return authApi.logout(refreshToken);
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user,
    profile: profileQuery.data,
    isAuthenticated,
    isAdmin: isAdmin(),
    isLoadingProfile: profileQuery.isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
