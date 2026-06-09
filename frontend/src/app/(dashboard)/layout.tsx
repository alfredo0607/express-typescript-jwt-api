"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Shield } from "lucide-react";
import { Nav } from "@/components/nav";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Nav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{
            background: "#09090b",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            className="text-muted-foreground hover:text-foreground p-1 rounded"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center h-7 w-7 rounded-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #0891b2)" }}
            >
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">JWT API</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
