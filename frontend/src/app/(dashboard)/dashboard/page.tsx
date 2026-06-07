"use client";

import { Shield, User, Clock, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { profile, isLoadingProfile, isAdmin } = useAuth();

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {profile?.name ?? "—"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estado de cuenta</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
              <User className="h-4 w-4" style={{ color: "#6366f1" }} />
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant={profile?.is_active ? "default" : "destructive"}>
              {profile?.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Roles asignados</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(8,145,178,0.12)" }}>
              <Shield className="h-4 w-4" style={{ color: "#06b6d4" }} />
            </div>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {profile?.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Miembro desde</CardTitle>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
              <Clock className="h-4 w-4" style={{ color: "#6366f1" }} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card style={{ background: "rgba(8,145,178,0.06)", borderColor: "rgba(8,145,178,0.2)" }}>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Key className="h-4 w-4" style={{ color: "#06b6d4" }} />
            <CardTitle className="text-sm font-medium" style={{ color: "#22d3ee" }}>
              Acceso de administrador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tienes acceso al panel de administración. Gestiona usuarios desde
              la sección <strong className="text-foreground">Admin → Usuarios</strong>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
