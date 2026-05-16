"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/ProgressRing";
import { GlassCard } from "@/components/GlassCard";
import type { SubjectStats } from "@/lib/types";

interface Props {
  subjectStats: SubjectStats[];
}

export function SubjectProgressCard({ subjectStats }: Props) {
  return (
    <GlassCard delay={0.2}>
      <h2 className="text-sm font-semibold mb-4">Subject Progress</h2>
      <div className="flex items-center justify-around">
        {subjectStats.map((s) => (
          <Link key={s.subject} href={`/subjects/${s.subject}`}>
            <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
              <ProgressRing
                percentage={s.progress}
                size={80}
                strokeWidth={6}
                color={s.color}
              />
              <span className="text-xs font-medium">{s.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {s.completed}/{s.total} done
              </span>
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
