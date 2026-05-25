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