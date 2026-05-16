"use client";

import { format, isToday } from "date-fns";
import { SubjectId, SUBJECT_CONFIG, SUBJECTS } from "@/lib/constants";
import type { PlannerTask } from "@/lib/types";
import { SubjectCell } from "./SubjectCell";

interface Props {
  dates: Date[];
  tasks: PlannerTask[];
  onToggleComplete: (task: PlannerTask, completed: boolean) => void;
  onAddTask: (date: Date, subject: SubjectId, chapterName: string) => void;
}

export function TimeTable({ dates, tasks, onToggleComplete, onAddTask }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-[140px_1fr_1fr_1fr] border-b border-border/50 bg-muted/20 sticky top-0 z-10">
          <div className="p-4 font-semibold text-sm text-muted-foreground">Date</div>
          {SUBJECTS.map((subject) => (
            <div
              key={subject}
              className="p-4 font-semibold text-sm"
              style={{ color: SUBJECT_CONFIG[subject].color }}
            >
              {SUBJECT_CONFIG[subject].label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {dates.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayTasks = tasks.filter((t) => t.date === dateStr);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={dateStr}
                className={`grid grid-cols-[140px_1fr_1fr_1fr] transition-colors hover:bg-muted/10 ${
                  isCurrentDay ? "bg-primary/5" : ""
                }`}
              >
                {/* Date Column */}
                <div className="p-4 border-r border-border/50">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isCurrentDay ? "text-primary" : ""}`}>
                      {isCurrentDay ? "Today" : format(date, "EEE, MMM d")}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Subject Columns */}
                {SUBJECTS.map((subject) => (
                  <div key={subject} className="p-3 border-r border-border/50 last:border-0">
                    <SubjectCell
                      date={date}
                      subject={subject}
                      tasks={dayTasks.filter((t) => t.subject === subject)}
                      onToggleComplete={onToggleComplete}
                      onAddTask={onAddTask}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
