"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useUser } from "@/lib/hooks/useUser";
import { format, addDays, isSameDay } from "date-fns";
import type { PlannerTask } from "@/lib/types";
import { TimeTable } from "@/components/timetable/TimeTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TimeTablePage() {
  const { user, supabase } = useUser();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysToShow, setDaysToShow] = useState(7); // Show next 7 days by default

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("planner_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
    
    if (data) setTasks(data as PlannerTask[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("timetable_tasks_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "planner_tasks" },
        () => fetchTasks()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchTasks]);

  // Generate dates array starting from today
  const dates = Array.from({ length: daysToShow }).map((_, i) =>
    addDays(new Date(), i)
  );

  async function handleTaskComplete(task: PlannerTask, completed: boolean) {
    if (!user) return;
    
    // 1. Update planner_tasks
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: completed } : t))
    );
    await supabase.from("planner_tasks").update({ is_completed: completed }).eq("id", task.id);

    // 2. Also update chapter_progress globally
    const status = completed ? "completed" : "in_progress";
    const progress = completed ? 100 : 0; // fallback if un-completing
    
    await supabase
      .from("chapter_progress")
      .update({ progress, status, last_studied: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("subject", task.subject)
      .eq("chapter_name", task.chapter_name);
  }

  async function handleAddTask(date: Date, subject: string, chapterName: string) {
    if (!user) return;
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

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Time Table"
          description="Your scheduled chapters by date and subject"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDaysToShow((prev) => prev + 7)}
            >
              <Plus className="w-4 h-4 mr-2" /> Load More Days
            </Button>
          }
        />

        <div className="glass rounded-xl overflow-hidden border border-border/50">
          <TimeTable
            dates={dates}
            tasks={tasks}
            onToggleComplete={handleTaskComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    </AppShell>
  );
}
