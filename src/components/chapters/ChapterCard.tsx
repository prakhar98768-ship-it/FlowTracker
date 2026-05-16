"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { STATUS_LABELS, ChapterStatus } from "@/lib/constants";

interface ChapterData {
  id: string;
  chapter_name: string;
  progress: number;
  status: ChapterStatus;
  notes: string;
  last_studied: string | null;
  revision_done: boolean;
  questions_done: boolean;
  ncert_done: boolean;
}

interface Props {
  chapter: ChapterData;
  color: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, updates: Partial<ChapterData>) => void;
  onDebouncedUpdate: (id: string, updates: Partial<ChapterData>) => void;
}

export function ChapterCard({
  chapter,
  color,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDebouncedUpdate,
}: Props) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Collapsed header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium truncate">
                {chapter.chapter_name}
              </span>
              <Badge
                variant={
                  chapter.status === "completed"
                    ? "default"
                    : chapter.status === "in_progress"
                    ? "secondary"
                    : "outline"
                }
                className="text-[10px] shrink-0"
              >
                {STATUS_LABELS[chapter.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${chapter.progress}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {chapter.progress}%
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-3">
              {/* Progress Slider */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Progress: {chapter.progress}%
                </label>
                <Slider
                  value={[chapter.progress]}
                  max={100}
                  step={5}
                  onValueChange={(val) =>
                    onDebouncedUpdate(chapter.id, {
                      progress: Array.isArray(val) ? val[0] : val,
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={chapter.ncert_done}
                    onCheckedChange={(checked) =>
                      onUpdate(chapter.id, { ncert_done: checked === true })
                    }
                  />
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  NCERT Done
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={chapter.questions_done}
                    onCheckedChange={(checked) =>
                      onUpdate(chapter.id, { questions_done: checked === true })
                    }
                  />
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Questions Done
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={chapter.revision_done}
                    onCheckedChange={(checked) =>
                      onUpdate(chapter.id, { revision_done: checked === true })
                    }
                  />
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Revision Done
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <textarea
                  value={chapter.notes || ""}
                  onChange={(e) =>
                    onDebouncedUpdate(chapter.id, { notes: e.target.value })
                  }
                  placeholder="Add study notes..."
                  className="w-full bg-muted/30 rounded-lg p-2.5 text-sm resize-none h-20 border-0 focus:ring-1 focus:ring-ring outline-none"
                />
              </div>

              {/* Last studied */}
              {chapter.last_studied && (
                <p className="text-[10px] text-muted-foreground">
                  Last studied:{" "}
                  {new Date(chapter.last_studied).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
