import { SubjectId, ChapterStatus } from "./constants";

/** Chapter progress row from Supabase */
export interface ChapterProgress {
  id: string;
  user_id: string;
  subject: SubjectId;
  class_number: number;
  chapter_name: string;
  progress: number;
  status: ChapterStatus;
  notes: string;
  last_studied: string | null;
  revision_done: boolean;
  questions_done: boolean;
  ncert_done: boolean;
  updated_at: string;
}

/** Planner task row from Supabase */
export interface PlannerTask {
  id: string;
  user_id: string;
  date: string;
  subject: SubjectId;
  chapter_name: string;
  is_completed: boolean;
  created_at: string;
}

/** Per-subject aggregated stats */
export interface SubjectStats {
  subject: SubjectId;
  label: string;
  color: string;
  progress: number;
  completed: number;
  total: number;
}
