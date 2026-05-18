"use client";

import { useState } from "react";
import { format } from "date-fns";
import { SubjectId, SUBJECT_CONFIG } from "@/lib/constants";
import { SYLLABUS } from "@/lib/syllabus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { TimetableTask } from "@/app/timetable/page";
import { DraggableTaskCard } from "./DraggableTaskCard";

interface Props {
  date: Date;
  subject: SubjectId;
  tasks: TimetableTask[];
  onToggleComplete: (task: TimetableTask, completed: boolean) => void;
  onAddTask: (date: Date, subject: SubjectId, chapterName: string) => void;
  onDeleteTask: (taskId: string) => void;
  isEditMode: boolean;
  isPastDate?: boolean;
}

export function SubjectCell({ date, subject, tasks, onToggleComplete, onAddTask, onDeleteTask, isEditMode, isPastDate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const dateStr = format(date, "yyyy-MM-dd");
  const containerId = `${dateStr}_${subject}`;

  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
  });

  const chapters = SYLLABUS.find((s) => s.subject === subject);
  const allChapters = chapters ? [...chapters.class11, ...chapters.class12] : [];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 h-full min-h-[100px] p-1 rounded-lg transition-colors ${
        isOver && isEditMode ? "bg-primary/10 ring-1 ring-primary/30" : ""
      }`}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            isEditMode={isEditMode}
            isOverdue={isPastDate && !task.is_completed}
          />
        ))}
      </SortableContext>

      {/* Add Button / Select */}
      <div className="mt-auto pt-2">
        {isAdding ? (
          <Select
            onValueChange={(val: string | null) => {
              if (val) {
                onAddTask(date, subject, val);
                setIsAdding(false);
              }
            }}
            onOpenChange={(open) => {
              if (!open) setIsAdding(false);
            }}
            defaultOpen
          >
            <SelectTrigger className="h-8 text-xs border-dashed bg-transparent shadow-none">
              <SelectValue placeholder="Select chapter..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 w-56">
              {allChapters.map((ch) => (
                <SelectItem key={ch} value={ch} className="text-xs">
                  {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full p-1.5 rounded-md hover:bg-muted/50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chapter</span>
          </button>
        )}
      </div>
    </div>
  );
}
