import { supabaseAdmin } from "../../config/supabase";

export async function getUserSubjects(userId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .select(`
      enrolled_at,
      subjects (
        id,
        name,
        description,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });
}

export async function enrollUserInSubject(userId: string, subjectId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .upsert(
      {
        user_id: userId,
        subject_id: subjectId,
      },
      {
        onConflict: "user_id,subject_id",
      }
    )
    .select()
    .single();
}

export async function removeUserFromSubject(userId: string, subjectId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .delete()
    .eq("user_id", userId)
    .eq("subject_id", subjectId)
    .select()
    .single();
}