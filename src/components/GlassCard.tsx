"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Animated glassmorphism card wrapper */
export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={cn("glass rounded-xl p-5", className)}
    >
      {children}
    </motion.div>
  );
}
