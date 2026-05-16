"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-end gap-2 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
