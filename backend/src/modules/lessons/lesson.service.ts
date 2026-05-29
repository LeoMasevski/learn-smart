import { supabaseAdmin } from "../../config/supabase";

export async function getAllLessons() {
  return await supabaseAdmin
    .from("lessons")
    .select(`
      *,
      subjects (
        id,
        name
      )
    `)
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