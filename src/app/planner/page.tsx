"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TaskItem } from "@/components/planner/TaskItem";
import { AddTaskDialog } from "@/components/planner/AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useUser } from "@/lib/hooks/useUser";
import { SubjectId } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CalendarDays } from "lucide-react";
import { format, addDays, isSameDay, isToday } from "date-fns";
import type { PlannerTask } from "@/lib/types";

export default function PlannerPage() {
  const { user, supabase } = useUser();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("planner_tasks").select("*").eq("user_id", user.id).order("created_at");
    if (data) setTasks(data as PlannerTask[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("planner_tasks_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "planner_tasks" }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchTasks]);

  const selectedTasks = tasks.filter((t) => isSameDay(new Date(t.date + "T00:00:00"), selectedDate));
  const datesWithTasks = tasks.reduce<Record<string, number>>((acc, t) => { acc[t.date] = (acc[t.date] || 0) + 1; return acc; }, {});

  async function addTask(subject: SubjectId, chapter: string, date: Date) {
    if (!user) return;
    await supabase.from("planner_tasks").insert({
      user_id: user.id,
      date: format(date, "yyyy-MM-dd"),
      subject,
      chapter_name: chapter,
      is_completed: false,
    });
    fetchTasks();
  }

  async function toggleTask(id: string, completed: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: completed } : t)));
    await supabase.from("planner_tasks").update({ is_completed: completed }).eq("id", id);
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("planner_tasks").delete().eq("id", id);
  }

  async function carryForward() {
    if (!user) return;
    const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    const incomplete = tasks.filter((t) => t.date === yesterday && !t.is_completed);
    if (!incomplete.length) return;
    await supabase.from("planner_tasks").insert(
      incomplete.map((t) => ({ user_id: user.id, date: today, subject: t.subject, chapter_name: t.chapter_name, is_completed: false }))
    );
    fetchTasks();
  }

  if (loading) return <AppShell><LoadingSpinner /></AppShell>;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">
        <PageHeader
          title="Planner"
          description="Schedule your daily study tasks"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={carryForward}>Carry Forward</Button>
              <AddTaskDialog defaultDate={selectedDate} onAdd={addTask} />
            </>
          }
        />

        <div className="grid lg:grid-cols-[320px,1fr] gap-5">
          {/* Calendar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{ hasTasks: (date) => !!datesWithTasks[format(date, "yyyy-MM-dd")] }}
              modifiersClassNames={{ hasTasks: "font-bold" }}
              className="w-full"
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              <span>Bold dates have scheduled tasks</span>
            </div>
          </motion.div>

          {/* Task list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{isToday(selectedDate) ? "Today" : format(selectedDate, "EEE, MMM d")}</h2>
              <span className="text-xs text-muted-foreground">{selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}</span>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No tasks for this day</p>
              </div>
            ) : (
              <AnimatePresence>
                {selectedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
