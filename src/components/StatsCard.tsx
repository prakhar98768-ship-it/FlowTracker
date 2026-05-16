"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function StatsCard({ title, value, subtitle, icon, color, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass rounded-xl p-4 hover:scale-[1.02] transition-transform",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold" style={color ? { color } : undefined}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
