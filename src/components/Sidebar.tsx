"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Beaker,
  Atom,
  Leaf,
  Table,
} from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects/biology", label: "Biology", icon: Leaf },
  { href: "/subjects/physics", label: "Physics", icon: Atom },
  { href: "/subjects/chemistry", label: "Chemistry", icon: Beaker },
  { href: "/timetable", label: "Time Table", icon: Table },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border/50 bg-card/50 backdrop-blur-sm h-dvh sticky top-0">
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-biology to-physics flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-base">StudyFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">NEET 2026 Prep</p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
