create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'learnsmart_user_role') then
    create type learnsmart_user_role as enum ('STUDENT', 'PROFESSOR');
  end if;

  if not exists (select 1 from pg_type where typname = 'learnsmart_learning_type') then
    create type learnsmart_learning_type as enum ('VISUAL', 'AUDITORY', 'KINESTHETIC');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 100),
  role learnsmart_user_role not null,
  learning_type learnsmart_learning_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null constraint subjects_created_by_fkey references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 150),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subjects (
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  original_content text not null,
  ai_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_variants (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  learning_type learnsmart_learning_type not null,
  content_blocks jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  unique (lesson_id, learning_type)
);

create table if not exists public.subject_quizzes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  time_limit_minutes integer not null default 15 check (time_limit_minutes between 1 and 240),
  question_count integer not null default 10 check (question_count between 1 and 100),
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'mixed')),
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_lessons (
  quiz_id uuid not null references public.subject_quizzes(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  primary key (quiz_id, lesson_id)
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.subject_quizzes(id) on delete cascade,
  question text not null,
  options jsonb,
  correct_answer text not null,
  question_type text not null check (question_type in ('multiple_choice', 'true_false')),
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.subject_quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  score integer check (score between 0 and 100),
  correct_count integer,
  total_count integer,
  time_taken_seconds integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.quiz_attempt_answers (
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null default false,
  primary key (attempt_id, question_id)
);

create or replace view public.quiz_results as
select
  qa.id,
  qa.quiz_id,
  qa.student_id,
  qa.score,
  qa.correct_count,
  qa.total_count,
  qa.started_at,
  qa.finished_at as completed_at
from public.quiz_attempts qa
where qa.status = 'completed';

create index if not exists idx_user_subjects_subject_id on public.user_subjects(subject_id);
create index if not exists idx_subjects_created_by on public.subjects(created_by);
create index if not exists idx_lessons_subject_id on public.lessons(subject_id);
create index if not exists idx_lesson_variants_lesson_id on public.lesson_variants(lesson_id);
create index if not exists idx_subject_quizzes_subject_id on public.subject_quizzes(subject_id);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_attempts_student_id on public.quiz_attempts(student_id);
create index if not exists idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_subjects_updated_at on public.subjects;
create trigger set_subjects_updated_at
before update on public.subjects
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_subject_quizzes_updated_at on public.subject_quizzes;
create trigger set_subject_quizzes_updated_at
before update on public.subject_quizzes
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.user_subjects enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_variants enable row level security;
alter table public.subject_quizzes enable row level security;
alter table public.quiz_lessons enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

create policy "profiles read own or professor"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

create policy "profiles update own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "subjects read student catalog or creator"
on public.subjects for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'STUDENT'
  )
);

create policy "subjects professor creator write"
on public.subjects for all
to authenticated
using (
  created_by = auth.uid()
  and
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
)
with check (
  created_by = auth.uid()
  and
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

create policy "user subjects own read"
on public.user_subjects for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

create policy "user subjects student enroll"
on public.user_subjects for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'STUDENT'
  )
);

create policy "user subjects student remove"
on public.user_subjects for delete
to authenticated
using (user_id = auth.uid());

create policy "lessons read enrolled or professor"
on public.lessons for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
  or exists (
    select 1 from public.user_subjects us
    where us.user_id = auth.uid() and us.subject_id = lessons.subject_id
  )
);

create policy "lessons professor write"
on public.lessons for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

create policy "lesson variants read enrolled or professor"
on public.lesson_variants for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_variants.lesson_id
    and (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'PROFESSOR'
      )
      or exists (
        select 1 from public.user_subjects us
        where us.user_id = auth.uid() and us.subject_id = l.subject_id
      )
    )
  )
);

create policy "lesson variants professor write"
on public.lesson_variants for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

create policy "quiz attempts own read"
on public.quiz_attempts for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

create policy "quiz attempts student write"
on public.quiz_attempts for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());
