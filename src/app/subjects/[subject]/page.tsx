"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ChapterCard } from "@/components/chapters/ChapterCard";
import { SUBJECT_CONFIG, SubjectId, ChapterStatus } from "@/lib/constants";
import { SYLLABUS } from "@/lib/syllabus";
import { useUser } from "@/lib/hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import type { ChapterProgress } from "@/lib/types";

export default function SubjectPage() {
  const params = useParams();
  const subject = params.subject as SubjectId;
  const config = SUBJECT_CONFIG[subject];
  const { user, supabase } = useUser();

  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ChapterStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const fetchChapters = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chapter_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("subject", subject)
      .order("class_number")
      .order("chapter_name");
    if (data) setChapters(data as ChapterProgress[]);
    setLoading(false);
  }, [user, supabase, subject]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  // Realtime sync
  useEffect(() => {
    const channel = supabase
      .channel(`chapter_progress_${subject}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chapter_progress", filter: `subject=eq.${subject}` },
        (payload) => setChapters((prev) => prev.map((ch) => (ch.id === payload.new.id ? { ...ch, ...payload.new } : ch)))
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, subject]);

  async function updateChapter(id: string, updates: Partial<ChapterProgress>) {
    setChapters((prev) => prev.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch)));
    if (updates.progress !== undefined) {
      if (updates.progress === 100) updates.status = "completed";
      else if (updates.progress > 0) updates.status = "in_progress";
      else updates.status = "not_started";
      updates.last_studied = new Date().toISOString();
    }
    await supabase.from("chapter_progress").update(updates).eq("id", id);
  }

  function debouncedUpdate(id: string, updates: Partial<ChapterProgress>) {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    setChapters((prev) => prev.map((ch) => {
      if (ch.id !== id) return ch;
      const merged = { ...ch, ...updates };
      if (updates.progress !== undefined) {
        if (updates.progress === 100) merged.status = "completed";
        else if (updates.progress > 0) merged.status = "in_progress";
        else merged.status = "not_started";
      }
      return merged;
    }));
    debounceTimers.current[id] = setTimeout(() => updateChapter(id, updates), 400);
  }

  const filterChapters = (classNum: number) =>
    chapters
      .filter((ch) => ch.class_number === classNum)
      .filter((ch) => !search || ch.chapter_name.toLowerCase().includes(search.toLowerCase()))
      .filter((ch) => filter === "all" || ch.status === filter);

  const classProgress = (classNum: number) => {
    const cls = chapters.filter((ch) => ch.class_number === classNum);
    return cls.length ? Math.round(cls.reduce((s, c) => s + c.progress, 0) / cls.length) : 0;
  };

  const totalProgress = chapters.length
    ? Math.round(chapters.reduce((s, c) => s + c.progress, 0) / chapters.length) : 0;

  if (!config) return <AppShell><div className="text-center py-20 text-muted-foreground">Subject not found</div></AppShell>;
  if (loading) return <AppShell><LoadingSpinner /></AppShell>;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header + progress bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
            <h1 className="text-2xl font-bold">{config.label}</h1>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-semibold" style={{ color: config.color }}>{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{chapters.filter((c) => c.status === "completed").length} completed</span>
              <span>{chapters.filter((c) => c.status === "in_progress").length} in progress</span>
              <span>{chapters.filter((c) => c.status === "not_started").length} remaining</span>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search chapters..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as ChapterStatus | "all")} className="h-9 px-3 rounded-md border border-input bg-background text-sm">
            <option value="all">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Class Tabs with chapter cards */}
        <Tabs defaultValue="11" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="11">Class 11 — {classProgress(11)}%</TabsTrigger>
            <TabsTrigger value="12">Class 12 — {classProgress(12)}%</TabsTrigger>
          </TabsList>
          {[11, 12].map((classNum) => (
            <TabsContent key={classNum} value={String(classNum)} className="space-y-2">
              <AnimatePresence>
                {filterChapters(classNum).map((chapter, i) => (
                  <motion.div key={chapter.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                    <ChapterCard
                      chapter={chapter}
                      color={config.color}
                      isExpanded={expandedId === chapter.id}
                      onToggleExpand={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
                      onUpdate={updateChapter}
                      onDebouncedUpdate={debouncedUpdate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {filterChapters(classNum).length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  {search || filter !== "all" ? "No chapters match your search/filter" : "No chapters found"}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  );
}
