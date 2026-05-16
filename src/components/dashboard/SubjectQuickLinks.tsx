"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SubjectStats } from "@/lib/types";

interface Props {
  subjectStats: SubjectStats[];
}

export function SubjectQuickLinks({ subjectStats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {subjectStats.map((s) => (
        <Link key={s.subject} href={`/subjects/${s.subject}`}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="glass rounded-xl p-4 text-center cursor-pointer"
            style={{ borderColor: `${s.color}20` }}
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold mt-1" style={{ color: s.color }}>
              {s.total - s.completed}
            </p>
            <p className="text-[10px] text-muted-foreground">remaining</p>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
