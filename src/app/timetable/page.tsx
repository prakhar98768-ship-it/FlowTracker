"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useUser } from "@/lib/hooks/useUser";
import { format, addDays, subDays, parseISO, eachDayOfInterval, isToday } from "date-fns";
import type { PlannerTask, ChapterProgress } from "@/lib/types";
import { TimeTable } from "@/components/timetable/TimeTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Check, ChevronUp, ChevronDown } from "lucide-react";
import { DragEndEvent } from "@dnd-kit/core";

export type TimetableTask = PlannerTask & { progress: number };

export default function TimeTablePage() {
  const { user, supabase } = useUser();
  const [tasks, setTasks] = useState<TimetableTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastDaysExtra, setPastDaysExtra] = useState(0);
  const [futureDaysExtra, setFutureDaysExtra] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const todayRowRef = useRef<HTMLDivElement>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    // Fetch ALL planner tasks — no date filtering, preserving full history
    const { data: plannerData } = await supabase
      .from("planner_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
      
    // Fetch chapter progress to get the completion percentage
    const { data: progressData } = await supabase
      .from("chapter_progress")
      .select("subject, chapter_name, progress")
      .eq("user_id", user.id);
      
    if (plannerData) {
      // Map tasks with progress — NO date reassignment, NO carry-forward
      const combined = plannerData.map((task) => {
        const prog = progressData?.find(
          (p) => p.subject === task.subject && p.chapter_name === task.chapter_name
        );
        // Preserve the original date exactly as stored in the database
        return { ...task, progress: prog?.progress || 0 };
      });
      setTasks(combined as TimetableTask[]);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const channel = supabase
      .channel("timetable_tasks_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "planner_tasks" }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchTasks]);

  // Build date range: from earliest task date (or 7 days ago) through 7 days in the future
  // Each date is independent — tasks stay on their originally scheduled date
  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the earliest task date so we always show historical rows
    let earliestDate = subDays(today, 7);
    if (tasks.length > 0) {
      const taskDates = tasks.map((t) => parseISO(t.date));
      const minTaskDate = new Date(Math.min(...taskDates.map((d) => d.getTime())));
      if (minTaskDate < earliestDate) {
        earliestDate = minTaskDate;
      }
    }

    // Extend range based on user-requested extra days
    const rangeStart = subDays(earliestDate, pastDaysExtra);
    const rangeEnd = addDays(today, 7 + futureDaysExtra);

    return eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  }, [tasks, pastDaysExtra, futureDaysExtra]);

  // Scroll to today's row on first load
  useEffect(() => {
    if (!loading && todayRowRef.current) {
      todayRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  async function handleTaskComplete(task: PlannerTask, completed: boolean) {
    if (!user) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_completed: completed, progress: completed ? 100 : 0 } : t)));
    await supabase.from("planner_tasks").update({ is_completed: completed }).eq("id", task.id);
    const status = completed ? "completed" : "in_progress";
    await supabase.from("chapter_progress").update({ progress: completed ? 100 : 0, status, last_studied: new Date().toISOString() })
      .eq("user_id", user.id).eq("subject", task.subject).eq("chapter_name", task.chapter_name);
  }

  async function handleAddTask(date: Date, subject: string, chapterName: string) {
    if (!user) return;
    // Task is permanently assigned to this specific date
    await supabase.from("planner_tasks").insert({
      user_id: user.id,
      date: format(date, "yyyy-MM-dd"),
      subject,
      chapter_name: chapterName,
      is_completed: false,
    });
    fetchTasks();
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from("planner_tasks").delete().eq("id", taskId);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !user) return;

    const taskId = active.id as string;
    const overId = over.id as string; // Format: "YYYY-MM-DD_subject"

    // If dropped on the same container it started in, do nothing
    if (active.data.current?.sortable?.containerId === overId) return;

    const [newDateStr, newSubject] = overId.split("_");
    
    // Manual drag = manual date reassignment (user-initiated only)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, date: newDateStr, subject: newSubject as any };
        }
        return t;
      })
    );

    await supabase.from("planner_tasks").update({ date: newDateStr, subject: newSubject }).eq("id", taskId);
  }

  if (loading) return <AppShell><LoadingSpinner /></AppShell>;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Time Table"
          description="Your study schedule — tasks stay on their scheduled date"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant={isEditMode ? "default" : "secondary"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className={isEditMode ? "bg-primary" : ""}
              >
                {isEditMode ? <Check className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                {isEditMode ? "Done Editing" : "Edit Mode"}
              </Button>
            </div>
          }
        />

        {/* Load Previous Days */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setPastDaysExtra((prev) => prev + 7)}
          >
            <ChevronUp className="w-4 h-4 mr-1" /> Load Earlier Days
          </Button>
        </div>

        <div className="glass rounded-xl overflow-hidden border border-border/50">
          <TimeTable
            dates={dates}
            tasks={tasks}
            onToggleComplete={handleTaskComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            isEditMode={isEditMode}
            onDragEnd={handleDragEnd}
            todayRowRef={todayRowRef}
          />
        </div>

        {/* Load Future Days */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setFutureDaysExtra((prev) => prev + 7)}
          >
            <ChevronDown className="w-4 h-4 mr-1" /> Load More Future Days
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
