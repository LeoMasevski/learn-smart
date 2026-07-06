import { supabaseAdmin } from "../../config/supabase";

export async function getAllLessons() {
  return await supabaseAdmin
    .from("lessons")
    .select(`
      *,
      subjects (
        id,
        name
      ),
      lesson_variants (
        learning_type,
        content_blocks
      )
    `)
    .order("created_at", { ascending: false });
}

export async function getLessonsByCreatorId(createdBy: string) {
  return await supabaseAdmin
    .from("lessons")
    .select(`
      *,
      subjects (
        id,
        name
      ),
      lesson_variants (
        learning_type,
        content_blocks
      )
    `)
    .eq("created_by", createdBy)
    .order("created_at", { ascending: false });
}

export async function getLessonById(id: string) {
  return await supabaseAdmin
    .from("lessons")
    .select(`
      *,
      subjects (
        id,
        name
      )
    `)
    .eq("id", id)
    .single();
}

export async function createLesson(
  subjectId: string,
  createdBy: string,
  title: string,
  originalContent: string,
  aiInstructions?: string
) {
  return await supabaseAdmin
    .from("lessons")
    .insert({
      subject_id: subjectId,
      created_by: createdBy,
      title,
      original_content: originalContent,
      ai_instructions: aiInstructions || null,
    })
    .select()
    .single();
}

export async function updateLesson(
  id: string,
  subjectId?: string,
  title?: string,
  originalContent?: string,
  aiInstructions?: string
) {
  return await supabaseAdmin
    .from("lessons")
    .update({
      ...(subjectId !== undefined && { subject_id: subjectId }),
      ...(title !== undefined && { title }),
      ...(originalContent !== undefined && {
        original_content: originalContent,
      }),
      ...(aiInstructions !== undefined && {
        ai_instructions: aiInstructions || null,
      }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export async function deleteLesson(id: string) {
  return await supabaseAdmin
    .from("lessons")
    .delete()
    .eq("id", id)
    .select()
    .single();
}

export async function getLessonsBySubjectId(subjectId: string) {
  return await supabaseAdmin
    .from("lessons")
    .select(`
      *,
      subjects (
        id,
        name
      )
    `)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });
}

export async function getLessonsBySubjectIdForProfessor(
  subjectId: string,
  createdBy: string
) {
  return await supabaseAdmin
    .from("lessons")
    .select(`
      *,
      subjects (
        id,
        name
      )
    `)
    .eq("subject_id", subjectId)
    .eq("created_by", createdBy)
    .order("created_at", { ascending: false });
}

export async function getLessonsByIdsForProfessor(
  lessonIds: string[],
  subjectId: string,
  createdBy: string
) {
  if (lessonIds.length === 0) return { data: [], error: null };

  return await supabaseAdmin
    .from("lessons")
    .select("id, subject_id, created_by")
    .eq("subject_id", subjectId)
    .eq("created_by", createdBy)
    .in("id", lessonIds);
}
