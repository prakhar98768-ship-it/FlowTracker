"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import type { TimetableTask } from "@/app/timetable/page";
import { SUBJECT_CONFIG } from "@/lib/constants";

interface Props {
  task: TimetableTask;
  onToggleComplete: (task: TimetableTask, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  isEditMode: boolean;
}

export function DraggableTaskCard({ task, onToggleComplete, onDeleteTask, isEditMode }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const color = SUBJECT_CONFIG[task.subject].color;
  const isCompleted = task.is_completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex flex-col gap-2 p-2.5 rounded-lg text-sm transition-colors border shadow-sm ${
        isCompleted
          ? "bg-muted/40 border-transparent opacity-80"
          : "bg-card border-border/50"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        {isEditMode && (
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        {!isEditMode && (
          <Checkbox
            className="mt-0.5 shrink-0"
            checked={isCompleted}
            onCheckedChange={(checked) => onToggleComplete(task, checked === true)}
            style={isCompleted ? { backgroundColor: color, borderColor: color } : {}}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <span
            className={`font-medium leading-tight ${
              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {task.chapter_name}
          </span>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-muted/50 rounded-full h-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">
              {task.progress}%
            </span>
          </div>
        </div>

        {/* Delete Button */}
        {isEditMode && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDeleteTask(task.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {isCompleted && !isEditMode && (
        <div className="absolute -top-1 -right-1 bg-background rounded-full">
          <CheckCircle2 className="w-4 h-4" style={{ color }} />
        </div>
      )}
    </div>
  );
}
