import { SUBJECT_CONFIG, SubjectId, SUBJECTS } from "./constants";
import type { ChapterProgress, SubjectStats } from "./types";

/** Calculate per-subject stats from chapter progress rows */
export function calcSubjectStats(chapters: Pick<ChapterProgress, "subject" | "progress" | "status">[]): SubjectStats[] {
  return SUBJECTS.map((subject) => {
    const sub = chapters.filter((c) => c.subject === subject);
    const completed = sub.filter((c) => c.status === "completed").length;
    const avg = sub.length
      ? Math.round(sub.reduce((s, c) => s + c.progress, 0) / sub.length)
      : 0;
    return {
      subject,
      label: SUBJECT_CONFIG[subject].label,
      color: SUBJECT_CONFIG[subject].color,
      progress: avg,
      completed,
      total: sub.length,
    };
  });
}

/** Overall average progress across all chapters */
export function calcOverallProgress(chapters: Pick<ChapterProgress, "progress">[]): number {
  if (!chapters.length) return 0;
  return Math.round(chapters.reduce((s, c) => s + c.progress, 0) / chapters.length);
}
