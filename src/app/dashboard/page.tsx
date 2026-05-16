"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { StatsCard } from "@/components/StatsCard";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { GlassCard } from "@/components/GlassCard";
import { SubjectBarChart } from "@/components/charts/SubjectBarChart";
import { SubjectProgressCard } from "@/components/dashboard/SubjectProgressCard";
import { TodaysTasks } from "@/components/dashboard/TodaysTasks";
import { SubjectQuickLinks } from "@/components/dashboard/SubjectQuickLinks";
import { TOTAL_CHAPTERS } from "@/lib/syllabus";
import { calcSubjectStats, calcOverallProgress } from "@/lib/stats";
import { useUser } from "@/lib/hooks/useUser";
import { BookOpen, Target, Flame, CheckCircle2 } from "lucide-react";
import type { ChapterProgress, PlannerTask } from "@/lib/types";

export default function DashboardPage() {
  const { user, supabase } = useUser();
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  const [todayTasks, setTodayTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [chaptersRes, tasksRes] = await Promise.all([
      supabase.from("chapter_progress").select("subject, progress, status").eq("user_id", user.id),
      supabase
        .from("planner_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split("T")[0]),
    ]);
    if (chaptersRes.data) setChapters(chaptersRes.data as ChapterProgress[]);
    if (tasksRes.data) setTodayTasks(tasksRes.data as PlannerTask[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalProgress = calcOverallProgress(chapters);
  const completedCount = chapters.filter((c) => c.status === "completed").length;
  const inProgressCount = chapters.filter((c) => c.status === "in_progress").length;
  const subjectStats = calcSubjectStats(chapters);
  const chartData = subjectStats.map((s) => ({ name: s.label, value: s.progress, color: s.color }));

  if (loading) {
    return <AppShell><LoadingSpinner /></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader title="Dashboard" description="Your NEET preparation overview" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Overall Progress" value={`${totalProgress}%`} subtitle={`${TOTAL_CHAPTERS} total chapters`} icon={<Target className="w-4 h-4 text-muted-foreground" />} />
          <StatsCard title="Completed" value={completedCount} subtitle={`of ${TOTAL_CHAPTERS} chapters`} icon={<CheckCircle2 className="w-4 h-4 text-biology" />} color="#22c55e" />
          <StatsCard title="In Progress" value={inProgressCount} subtitle="chapters active" icon={<BookOpen className="w-4 h-4 text-physics" />} color="#3b82f6" />
          <StatsCard title="Today's Tasks" value={`${todayTasks.filter((t) => t.is_completed).length}/${todayTasks.length}`} subtitle="completed today" icon={<Flame className="w-4 h-4 text-chemistry" />} color="#f97316" />
        </div>

        {/* Subject Progress + Chart */}
        <div className="grid lg:grid-cols-2 gap-4">
          <SubjectProgressCard subjectStats={subjectStats} />
          <GlassCard delay={0.3}>
            <h2 className="text-sm font-semibold mb-4">Comparison</h2>
            <SubjectBarChart data={chartData} />
          </GlassCard>
        </div>

        <TodaysTasks tasks={todayTasks} />
        <SubjectQuickLinks subjectStats={subjectStats} />
      </div>
    </AppShell>
  );
}
