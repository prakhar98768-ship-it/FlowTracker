"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format, addDays, isSameDay, isToday } from "date-fns";
import { SubjectId } from "@/lib/constants";
import { SYLLABUS } from "@/lib/syllabus";

interface Props {
  defaultDate?: Date;
  onAdd: (subject: SubjectId, chapter: string, date: Date) => void;
}

export function AddTaskDialog({ defaultDate, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<SubjectId>("biology");
  const [chapter, setChapter] = useState("");
  const [date, setDate] = useState<Date>(defaultDate ?? new Date());

  const chapters = SYLLABUS.find((s) => s.subject === subject);
  const allChapters = chapters ? [...chapters.class11, ...chapters.class12] : [];

  function handleAdd() {
    if (!chapter) return;
    onAdd(subject, chapter, date);
    setOpen(false);
    setChapter("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
      >
        <Plus className="w-4 h-4" /> Add Task
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Study Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="flex items-center gap-2">
              <Button
                variant={isToday(date) ? "default" : "outline"}
                size="sm"
                onClick={() => setDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant={isSameDay(date, addDays(new Date(), 1)) ? "default" : "outline"}
                size="sm"
                onClick={() => setDate(addDays(new Date(), 1))}
              >
                Tomorrow
              </Button>
              <input
                type="date"
                value={format(date, "yyyy-MM-dd")}
                onChange={(e) => setDate(new Date(e.target.value + "T00:00:00"))}
                className="h-8 px-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={subject}
              onValueChange={(v) => {
                setSubject(v as SubjectId);
                setChapter("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chapter */}
          <div className="space-y-2">
            <Label>Chapter</Label>
            <Select value={chapter} onValueChange={(v) => setChapter(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {allChapters.map((ch) => (
                  <SelectItem key={ch} value={ch}>
                    {ch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAdd} disabled={!chapter} className="w-full">
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
