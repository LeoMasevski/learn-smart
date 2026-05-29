import { supabaseAdmin } from "../../config/supabase";

type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

export async function createLessonVariant(
  lessonId: string,
  learningType: LearningType,
  contentBlocks: unknown
) {
  return await supabaseAdmin
    .from("lesson_variants")
    .upsert(
      {
        lesson_id: lessonId,
        learning_type: learningType,
        content_blocks: contentBlocks,
        generated_at: new Date().toISOString(),
      },
      {
        onConflict: "lesson_id,learning_type",
      }
    )
    .select()
    .single();
}

export async function getLessonVariantsByLessonId(lessonId: string) {
  return await supabaseAdmin
    .from("lesson_variants")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("generated_at", { ascending: false });
}

export async function getLessonVariantByLearningType(
  lessonId: string,
  learningType: LearningType
) {
  return await supabaseAdmin
    .from("lesson_variants")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("learning_type", learningType)
    .single();
}