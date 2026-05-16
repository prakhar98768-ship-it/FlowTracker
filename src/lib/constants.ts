export const SUBJECTS = ["biology", "physics", "chemistry"] as const;
export type SubjectId = (typeof SUBJECTS)[number];

export const SUBJECT_CONFIG: Record<
  SubjectId,
  { label: string; color: string; lightColor: string; bgClass: string; textClass: string }
> = {
  biology: {
    label: "Biology",
    color: "#22c55e",
    lightColor: "#4ade80",
    bgClass: "bg-biology",
    textClass: "text-biology",
  },
  physics: {
    label: "Physics",
    color: "#3b82f6",
    lightColor: "#60a5fa",
    bgClass: "bg-physics",
    textClass: "text-physics",
  },
  chemistry: {
    label: "Chemistry",
    color: "#f97316",
    lightColor: "#fb923c",
    bgClass: "bg-chemistry",
    textClass: "text-chemistry",
  },
};

export const STATUS_OPTIONS = ["not_started", "in_progress", "completed"] as const;
export type ChapterStatus = (typeof STATUS_OPTIONS)[number];

export const STATUS_LABELS: Record<ChapterStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};
