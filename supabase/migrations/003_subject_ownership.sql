-- Subject ownership and catalog visibility.
-- Students can read the full subject catalog.
-- Professors can read/write only subjects they created.

alter table public.subjects
  add column if not exists created_by uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subjects_created_by_fkey'
      and conrelid = 'public.subjects'::regclass
  ) then
    alter table public.subjects
      add constraint subjects_created_by_fkey
      foreign key (created_by)
      references public.profiles(id)
      on delete restrict;
  end if;
end $$;

-- Best-effort backfill for existing databases. If a subject has no lesson or
-- quiz creator, assign created_by manually or truncate data before setting NOT NULL.
update public.subjects s
set created_by = coalesce(
  (
    select l.created_by
    from public.lessons l
    where l.subject_id = s.id
    order by l.created_at asc
    limit 1
  ),
  (
    select q.created_by
    from public.subject_quizzes q
    where q.subject_id = s.id
    order by q.created_at asc
    limit 1
  )
)
where s.created_by is null;

do $$
begin
  if exists (select 1 from public.subjects where created_by is null) then
    raise exception
      'Some subjects still have no created_by owner. Truncate app data first or assign owners before applying subject ownership.';
  end if;
end $$;

alter table public.subjects
  alter column created_by set not null;

create index if not exists idx_subjects_created_by
  on public.subjects(created_by);

create index if not exists idx_lessons_subject_created_by
  on public.lessons(subject_id, created_by);

create index if not exists idx_subject_quizzes_subject_created_by
  on public.subject_quizzes(subject_id, created_by);

create index if not exists idx_subject_quizzes_subject_status
  on public.subject_quizzes(subject_id, status);

create or replace function public.current_user_role()
returns public.learnsmart_user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

drop policy if exists "profiles read own or professor" on public.profiles;
drop policy if exists "profiles read own or subject professor" on public.profiles;
create policy "profiles read own or subject professor"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or (
    public.current_user_role() = 'STUDENT'
    and exists (
      select 1
      from public.subjects s
      where s.created_by = profiles.id
    )
  )
  or exists (
    select 1
    from public.user_subjects us
    join public.subjects s on s.id = us.subject_id
    where us.user_id = profiles.id
      and s.created_by = auth.uid()
  )
);

drop policy if exists "subjects read authenticated" on public.subjects;
drop policy if exists "subjects read student catalog or creator" on public.subjects;
create policy "subjects read student catalog or creator"
on public.subjects for select
to authenticated
using (
  created_by = auth.uid()
  or public.current_user_role() = 'STUDENT'
);

drop policy if exists "subjects professor write" on public.subjects;
drop policy if exists "subjects professor creator write" on public.subjects;
create policy "subjects professor creator write"
on public.subjects for all
to authenticated
using (
  created_by = auth.uid()
  and public.current_user_role() = 'PROFESSOR'
)
with check (
  created_by = auth.uid()
  and public.current_user_role() = 'PROFESSOR'
);

drop policy if exists "user subjects own read" on public.user_subjects;
drop policy if exists "user subjects own or teaching subject read" on public.user_subjects;
drop policy if exists "user subjects own or subject creator read" on public.user_subjects;
create policy "user subjects own or subject creator read"
on public.user_subjects for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.subjects s
    where s.id = user_subjects.subject_id
      and s.created_by = auth.uid()
  )
);

drop policy if exists "lessons professor write" on public.lessons;
drop policy if exists "lessons creator write" on public.lessons;
drop policy if exists "lessons creator and subject owner write" on public.lessons;
create policy "lessons creator and subject owner write"
on public.lessons for all
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1
    from public.subjects s
    where s.id = lessons.subject_id
      and s.created_by = auth.uid()
  )
  and public.current_user_role() = 'PROFESSOR'
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.subjects s
    where s.id = lessons.subject_id
      and s.created_by = auth.uid()
  )
  and public.current_user_role() = 'PROFESSOR'
);

notify pgrst, 'reload schema';

drop policy if exists "subject quizzes creator write" on public.subject_quizzes;
drop policy if exists "subject quizzes creator and subject owner write" on public.subject_quizzes;
create policy "subject quizzes creator and subject owner write"
on public.subject_quizzes for all
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1
    from public.subjects s
    where s.id = subject_quizzes.subject_id
      and s.created_by = auth.uid()
  )
  and public.current_user_role() = 'PROFESSOR'
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.subjects s
    where s.id = subject_quizzes.subject_id
      and s.created_by = auth.uid()
  )
  and public.current_user_role() = 'PROFESSOR'
);
