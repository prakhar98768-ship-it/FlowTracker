"use client";

import { SUBJECT_CONFIG, SubjectId } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { PlannerTask } from "@/lib/types";

interface Props {
  task: PlannerTask;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

/** Single planner task row with checkbox, subject dot, and delete button */
export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="glass rounded-xl p-3.5 flex items-center gap-3 group"
    >
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={(checked) => onToggle(task.id, checked === true)}
      />
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: SUBJECT_CONFIG[task.subject]?.color }}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.is_completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.chapter_name}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase">
          {SUBJECT_CONFIG[task.subject]?.label}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </Button>
    </motion.div>
  );
}
