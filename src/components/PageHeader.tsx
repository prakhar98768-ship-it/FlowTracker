"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

/** Consistent page header with title + description + optional action buttons */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between gap-4"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
}
