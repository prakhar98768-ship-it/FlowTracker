"use client";

import { format, isToday, isBefore, startOfDay } from "date-fns";
import { SubjectId, SUBJECT_CONFIG, SUBJECTS } from "@/lib/constants";
import { SubjectCell } from "./SubjectCell";
import { DndContext, DragEndEvent, pointerWithin } from "@dnd-kit/core";
import type { TimetableTask } from "@/app/timetable/page";
import { RefObject } from "react";

interface Props {
  dates: Date[];
  tasks: TimetableTask[];
  onToggleComplete: (task: TimetableTask, completed: boolean) => void;
  onAddTask: (date: Date, subject: SubjectId, chapterName: string) => void;
  onDeleteTask: (taskId: string) => void;
  isEditMode: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  todayRowRef?: RefObject<HTMLDivElement | null>;
}

export function TimeTable({ dates, tasks, onToggleComplete, onAddTask, onDeleteTask, isEditMode, onDragEnd, todayRowRef }: Props) {
  const today = startOfDay(new Date());

  return (
    <DndContext onDragEnd={onDragEnd} collisionDetection={pointerWithin}>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-[160px_1fr_1fr_1fr] border-b border-border/50 bg-muted/20 sticky top-0 z-10">
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

          {/* Rows — each date is independent, tasks stay on their original date */}
          <div className="divide-y divide-border/50">
            {dates.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              // Only show tasks whose date matches this exact row — NO merging
              const dayTasks = tasks.filter((t) => t.date === dateStr);
              const isCurrentDay = isToday(date);
              const isPastDate = isBefore(startOfDay(date), today);
              const hasOverdue = isPastDate && dayTasks.some((t) => !t.is_completed);

              return (
                <div
                  key={dateStr}
                  ref={isCurrentDay ? todayRowRef : undefined}
                  className={`grid grid-cols-[160px_1fr_1fr_1fr] transition-colors hover:bg-muted/10 ${
                    isCurrentDay
                      ? "bg-primary/5 ring-1 ring-primary/20"
                      : isPastDate
                      ? "bg-muted/5 opacity-80"
                      : ""
                  }`}
                >
                  {/* Date Column */}
                  <div className="p-4 border-r border-border/50">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-medium ${
                        isCurrentDay ? "text-primary" : isPastDate ? "text-muted-foreground" : ""
                      }`}>
                        {isCurrentDay ? "Today" : format(date, "EEE, MMM d")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                      </span>
                      {/* Overdue badge for past dates with incomplete tasks */}
                      {hasOverdue && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 w-fit mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Overdue
                        </span>
                      )}
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
                        onDeleteTask={onDeleteTask}
                        isEditMode={isEditMode}
                        isPastDate={isPastDate}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
