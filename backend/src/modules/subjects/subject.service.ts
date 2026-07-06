import { supabaseAdmin } from "../../config/supabase";

export async function getAllSubjects() {
  return await supabaseAdmin
    .from("subjects")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getSubjectById(id: string) {
  return await supabaseAdmin
    .from("subjects")
    .select("*")
    .eq("id", id)
    .single();
}

export async function createSubject(name: string, description?: string) {
  return await supabaseAdmin
    .from("subjects")
    .insert({
      name,
      description,
    })
    .select()
    .single();
}

export async function updateSubject(
  id: string,
  name?: string,
  description?: string
) {
  return await supabaseAdmin
    .from("subjects")
    .update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export async function deleteSubject(id: string) {
  return await supabaseAdmin
    .from("subjects")
    .delete()
    .eq("id", id)
    .select()
    .single();
}