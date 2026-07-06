-- Defense-in-depth RLS hardening for direct Supabase access.
-- The backend still enforces ownership because it uses the service-role client.

drop policy if exists "user subjects own read" on public.user_subjects;
create policy "user subjects own or teaching subject read"
on public.user_subjects for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.lessons l
    where l.subject_id = user_subjects.subject_id
      and l.created_by = auth.uid()
  )
  or exists (
    select 1
    from public.subject_quizzes q
    where q.subject_id = user_subjects.subject_id
      and q.created_by = auth.uid()
  )
);

drop policy if exists "lessons read enrolled or professor" on public.lessons;
create policy "lessons read enrolled or creator"
on public.lessons for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.user_subjects us
    where us.user_id = auth.uid() and us.subject_id = lessons.subject_id
  )
);

drop policy if exists "lessons professor write" on public.lessons;
create policy "lessons creator write"
on public.lessons for all
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

drop policy if exists "lesson variants read enrolled or professor" on public.lesson_variants;
create policy "lesson variants read enrolled or lesson creator"
on public.lesson_variants for select
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_variants.lesson_id
      and (
        l.created_by = auth.uid()
        or exists (
          select 1 from public.user_subjects us
          where us.user_id = auth.uid() and us.subject_id = l.subject_id
        )
      )
  )
);

drop policy if exists "lesson variants professor write" on public.lesson_variants;
create policy "lesson variants lesson creator write"
on public.lesson_variants for all
to authenticated
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_variants.lesson_id
      and l.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_variants.lesson_id
      and l.created_by = auth.uid()
  )
);

drop policy if exists "subject quizzes read enrolled or creator" on public.subject_quizzes;
create policy "subject quizzes read enrolled or creator"
on public.subject_quizzes for select
to authenticated
using (
  created_by = auth.uid()
  or (
    status = 'ready'
    and exists (
      select 1 from public.user_subjects us
      where us.user_id = auth.uid() and us.subject_id = subject_quizzes.subject_id
    )
  )
);

drop policy if exists "subject quizzes creator write" on public.subject_quizzes;
create policy "subject quizzes creator write"
on public.subject_quizzes for all
to authenticated
using (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'PROFESSOR'
  )
);

drop policy if exists "quiz lessons read enrolled or quiz creator" on public.quiz_lessons;
create policy "quiz lessons read enrolled or quiz creator"
on public.quiz_lessons for select
to authenticated
using (
  exists (
    select 1
    from public.subject_quizzes q
    where q.id = quiz_lessons.quiz_id
      and (
        q.created_by = auth.uid()
        or (
          q.status = 'ready'
          and exists (
            select 1 from public.user_subjects us
            where us.user_id = auth.uid() and us.subject_id = q.subject_id
          )
        )
      )
  )
);

drop policy if exists "quiz lessons quiz creator write" on public.quiz_lessons;
create policy "quiz lessons quiz creator write"
on public.quiz_lessons for all
to authenticated
using (
  exists (
    select 1 from public.subject_quizzes q
    where q.id = quiz_lessons.quiz_id and q.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.subject_quizzes q
    where q.id = quiz_lessons.quiz_id and q.created_by = auth.uid()
  )
);

drop policy if exists "quiz questions quiz creator read" on public.quiz_questions;
create policy "quiz questions quiz creator read"
on public.quiz_questions for select
to authenticated
using (
  exists (
    select 1 from public.subject_quizzes q
    where q.id = quiz_questions.quiz_id and q.created_by = auth.uid()
  )
);

drop policy if exists "quiz questions quiz creator write" on public.quiz_questions;
create policy "quiz questions quiz creator write"
on public.quiz_questions for all
to authenticated
using (
  exists (
    select 1 from public.subject_quizzes q
    where q.id = quiz_questions.quiz_id and q.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.subject_quizzes q
    where q.id = quiz_questions.quiz_id and q.created_by = auth.uid()
  )
);

drop policy if exists "quiz attempts own read" on public.quiz_attempts;
create policy "quiz attempts own or quiz creator read"
on public.quiz_attempts for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.subject_quizzes q
    where q.id = quiz_attempts.quiz_id and q.created_by = auth.uid()
  )
);

drop policy if exists "quiz attempt answers own or quiz creator read" on public.quiz_attempt_answers;
create policy "quiz attempt answers own or quiz creator read"
on public.quiz_attempt_answers for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_attempts qa
    join public.subject_quizzes q on q.id = qa.quiz_id
    where qa.id = quiz_attempt_answers.attempt_id
      and (qa.student_id = auth.uid() or q.created_by = auth.uid())
  )
);

drop policy if exists "quiz attempt answers student write own" on public.quiz_attempt_answers;
create policy "quiz attempt answers student write own"
on public.quiz_attempt_answers for all
to authenticated
using (
  exists (
    select 1 from public.quiz_attempts qa
    where qa.id = quiz_attempt_answers.attempt_id
      and qa.student_id = auth.uid()
      and qa.status = 'in_progress'
  )
)
with check (
  exists (
    select 1 from public.quiz_attempts qa
    where qa.id = quiz_attempt_answers.attempt_id
      and qa.student_id = auth.uid()
      and qa.status = 'in_progress'
  )
);
