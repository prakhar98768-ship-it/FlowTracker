"use client";

import Link from "next/link";
import { SUBJECT_CONFIG } from "@/lib/constants";
import { GlassCard } from "@/components/GlassCard";
import type { PlannerTask } from "@/lib/types";

interface Props {
  tasks: PlannerTask[];
}

export function TodaysTasks({ tasks }: Props) {
  return (
    <GlassCard delay={0.4}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Today&apos;s Tasks</h2>
        <Link
          href="/planner"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View Planner →
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No tasks scheduled for today.{" "}
          <Link href="/planner" className="text-primary hover:underline">
            Add some
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: SUBJECT_CONFIG[task.subject]?.color }}
              />
              <span
                className={`text-sm flex-1 ${
                  task.is_completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.chapter_name}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-medium">
                {SUBJECT_CONFIG[task.subject]?.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
