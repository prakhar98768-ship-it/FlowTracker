"use client";

import { useState } from "react";
import { SubjectId, SUBJECT_CONFIG } from "@/lib/constants";
import { SYLLABUS } from "@/lib/syllabus";
import type { PlannerTask } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  date: Date;
  subject: SubjectId;
  tasks: PlannerTask[];
  onToggleComplete: (task: PlannerTask, completed: boolean) => void;
  onAddTask: (date: Date, subject: SubjectId, chapterName: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function SubjectCell({ date, subject, tasks, onToggleComplete, onAddTask, onDeleteTask }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const color = SUBJECT_CONFIG[subject].color;
  
  const chapters = SYLLABUS.find((s) => s.subject === subject);
  const allChapters = chapters ? [...chapters.class11, ...chapters.class12] : [];

  return (
    <div className="flex flex-col gap-2 h-full">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2 p-2 rounded-md text-sm transition-colors group ${
              task.is_completed ? "bg-muted/30" : "bg-card border border-border/50 shadow-sm"
            }`}
          >
            <Checkbox
              className="mt-0.5"
              checked={task.is_completed}
              onCheckedChange={(checked) => onToggleComplete(task, checked === true)}
              style={task.is_completed ? { backgroundColor: color, borderColor: color } : {}}
            />
            <span
              className={`flex-1 leading-snug ${
                task.is_completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.chapter_name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 shrink-0"
              onClick={() => onDeleteTask(task.id)}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

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
