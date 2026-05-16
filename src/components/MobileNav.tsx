"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  BarChart3,
} from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/subjects/biology", label: "Subjects", icon: BookOpen },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === "/subjects/biology" && pathname.startsWith("/subjects"));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[4rem]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
