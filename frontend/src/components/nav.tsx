"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Users, LogOut, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Mi Perfil", icon: User },
];

const adminItems = [{ href: "/admin/users", label: "Usuarios", icon: Users }];

interface NavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Nav({ isOpen = false, onClose }: NavProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoggingOut } = useAuth();

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex flex-col w-64 p-4 shrink-0",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          "md:relative md:z-auto md:translate-x-0 md:h-auto md:min-h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "linear-gradient(180deg, #0f0f14 0%, #0c0c10 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "4px 0 24px -8px rgba(0,0,0,0.6)",
        }}
      >
      {/* Botón cerrar - solo móvil */}
      <button
        className="md:hidden absolute right-3 top-3 text-muted-foreground hover:text-foreground p-1 rounded"
        onClick={onClose}
        aria-label="Cerrar menú"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-1">
        <div
          className="flex items-center justify-center h-8 w-8 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #6366f1, #0891b2)",
            boxShadow: "0 0 16px -2px rgba(99,102,241,0.6)",
          }}
        >
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-sm text-foreground">JWT API</span>
          <p className="text-xs" style={{ color: "#71717a" }}>Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)",
                      borderLeft: "2px solid #6366f1",
                      paddingLeft: "10px",
                      boxShadow: "0 0 12px -4px rgba(99,102,241,0.4)",
                    }
                  : {}
              }
            >
              <Icon
                className="h-4 w-4"
                style={isActive ? { color: "#6366f1" } : {}}
              />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <Separator className="my-3 opacity-20" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "#3f3f46" }}>
              Admin
            </p>
            {adminItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(90deg, rgba(8,145,178,0.2) 0%, rgba(8,145,178,0.05) 100%)",
                          borderLeft: "2px solid #0891b2",
                          paddingLeft: "10px",
                          boxShadow: "0 0 12px -4px rgba(8,145,178,0.4)",
                        }
                      : {}
                  }
                >
                  <Icon
                    className="h-4 w-4"
                    style={isActive ? { color: "#06b6d4" } : {}}
                  />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer del nav */}
      <div
        className="pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-xs text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #0891b2)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
            <div className="flex gap-1 flex-wrap">
              {user?.roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
        </Button>
      </div>
    </aside>
    </>
  );
}
