-- StudyFlow Tracker Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. Chapter progress table
create table if not exists public.chapter_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null check (subject in ('biology', 'physics', 'chemistry')),
  class_number int not null check (class_number in (11, 12)),
  chapter_name text not null,
  progress int default 0 check (progress >= 0 and progress <= 100),
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  notes text default '',
  last_studied timestamptz,
  revision_done boolean default false,
  questions_done boolean default false,
  ncert_done boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, subject, class_number, chapter_name)
);

alter table public.chapter_progress enable row level security;

create policy "Users can view own chapter progress" on public.chapter_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own chapter progress" on public.chapter_progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update own chapter progress" on public.chapter_progress
  for update using (auth.uid() = user_id);
create policy "Users can delete own chapter progress" on public.chapter_progress
  for delete using (auth.uid() = user_id);

create index idx_chapter_progress_user on public.chapter_progress(user_id);
create index idx_chapter_progress_subject on public.chapter_progress(user_id, subject);

-- 3. Planner tasks table
create table if not exists public.planner_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  subject text not null check (subject in ('biology', 'physics', 'chemistry')),
  chapter_name text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

alter table public.planner_tasks enable row level security;

create policy "Users can view own tasks" on public.planner_tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.planner_tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.planner_tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.planner_tasks
  for delete using (auth.uid() = user_id);

create index idx_planner_tasks_user_date on public.planner_tasks(user_id, date);

-- 4. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger chapter_progress_updated_at
  before update on public.chapter_progress
  for each row execute function public.update_updated_at();

-- 6. Enable realtime for chapter_progress and planner_tasks
alter publication supabase_realtime add table public.chapter_progress;
alter publication supabase_realtime add table public.planner_tasks;
