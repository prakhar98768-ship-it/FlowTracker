"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { StatsCard } from "@/components/StatsCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { SubjectBarChart } from "@/components/charts/SubjectBarChart";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { calcSubjectStats, calcOverallProgress } from "@/lib/stats";
import { TOTAL_CHAPTERS } from "@/lib/syllabus";
import { useUser } from "@/lib/hooks/useUser";
import { Target, CheckCircle2, BookOpen, Calendar } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import type { ChapterProgress, PlannerTask } from "@/lib/types";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { user, supabase } = useUser();
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [chaptersRes, tasksRes] = await Promise.all([
      supabase.from("chapter_progress").select("subject, progress, status, updated_at, class_number").eq("user_id", user.id),
      supabase.from("planner_tasks").select("date, is_completed, subject").eq("user_id", user.id),
    ]);
    if (chaptersRes.data) setChapters(chaptersRes.data as ChapterProgress[]);
    if (tasksRes.data) setTasks(tasksRes.data as PlannerTask[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Computed data
  const overallProgress = calcOverallProgress(chapters);
  const subjectStats = calcSubjectStats(chapters);
  const totalCompleted = chapters.filter((c) => c.status === "completed").length;
  const totalInProgress = chapters.filter((c) => c.status === "in_progress").length;
  const totalNotStarted = chapters.filter((c) => c.status === "not_started").length;

  const barData = subjectStats.map((s) => ({ name: s.label, value: s.progress, color: s.color }));

  const pieData = [
    { name: "Completed", value: totalCompleted, color: "#22c55e" },
    { name: "In Progress", value: totalInProgress, color: "#3b82f6" },
    { name: "Not Started", value: totalNotStarted, color: "#71717a" },
  ];

  // Weekly activity
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const weeklyData = last7Days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return { label: format(day, "EEE"), value: tasks.filter((t) => t.date === dayStr && t.is_completed).length };
  });

  // Estimated completion
  const chaptersPerWeek = totalCompleted > 0 ? Math.max(1, Math.round(totalCompleted / 4)) : 0;
  const weeksToComplete = chaptersPerWeek > 0 ? Math.ceil((TOTAL_CHAPTERS - totalCompleted) / chaptersPerWeek) : 0;

  // Class-wise
  const classData = [11, 12].map((classNum) => {
    const cls = chapters.filter((c) => c.class_number === classNum);
    const completed = cls.filter((c) => c.status === "completed").length;
    return {
      name: `Class ${classNum}`,
      completed,
      total: cls.length,
      progress: cls.length ? Math.round(cls.reduce((s, c) => s + c.progress, 0) / cls.length) : 0,
    };
  });

  if (loading) return <AppShell><LoadingSpinner /></AppShell>;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader title="Analytics" description="Detailed progress insights" />

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Overall" value={`${overallProgress}%`} icon={<Target className="w-4 h-4 text-muted-foreground" />} />
          <StatsCard title="Completed" value={`${totalCompleted}/${TOTAL_CHAPTERS}`} icon={<CheckCircle2 className="w-4 h-4 text-biology" />} color="#22c55e" />
          <StatsCard title="Active" value={totalInProgress} subtitle="in progress" icon={<BookOpen className="w-4 h-4 text-physics" />} color="#3b82f6" />
          <StatsCard title="Est. Completion" value={weeksToComplete > 0 ? `${weeksToComplete}w` : "—"} subtitle={weeksToComplete > 0 ? `~${weeksToComplete} weeks left` : "Start studying!"} icon={<Calendar className="w-4 h-4 text-chemistry" />} color="#f97316" />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <GlassCard delay={0.2}>
            <h2 className="text-sm font-semibold mb-4">Subject Progress</h2>
            <SubjectBarChart data={barData} height={200} layout="vertical" />
          </GlassCard>
          <GlassCard delay={0.3}>
            <h2 className="text-sm font-semibold mb-4">Completion Status</h2>
            <StatusPieChart data={pieData} />
          </GlassCard>
        </div>

        {/* Weekly Activity */}
        <GlassCard delay={0.4}>
          <h2 className="text-sm font-semibold mb-4">Weekly Activity</h2>
          <ActivityChart data={weeklyData} dataLabel="Tasks Completed" />
        </GlassCard>

        {/* Class-wise Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {classData.map((d) => (
            <motion.div key={d.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{d.name}</p>
              <ProgressRing percentage={d.progress} size={70} strokeWidth={5} color="#8b5cf6" />
              <p className="text-xs text-muted-foreground mt-2">{d.completed}/{d.total} chapters</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
