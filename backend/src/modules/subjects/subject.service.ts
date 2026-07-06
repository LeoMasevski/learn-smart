import { supabaseAdmin } from "../../config/supabase";

export async function getAllSubjects() {
  return await supabaseAdmin
    .from("subjects")
    .select(`
      *,
      professor:profiles!subjects_created_by_fkey (
        id,
        full_name
      )
    `)
    .order("created_at", { ascending: false });
}

export async function getSubjectsByProfessorId(professorId: string) {
  return await supabaseAdmin
    .from("subjects")
    .select(`
      *,
      professor:profiles!subjects_created_by_fkey (
        id,
        full_name
      )
    `)
    .eq("created_by", professorId)
    .order("created_at", { ascending: false });
}

export async function getSubjectById(id: string) {
  return await supabaseAdmin
    .from("subjects")
    .select(`
      *,
      professor:profiles!subjects_created_by_fkey (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single();
}

export async function getSubjectByIdForProfessor(id: string, professorId: string) {
  return await supabaseAdmin
    .from("subjects")
    .select(`
      *,
      professor:profiles!subjects_created_by_fkey (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .eq("created_by", professorId)
    .single();
}

export async function createSubject(
  name: string,
  createdBy: string,
  description?: string
) {
  return await supabaseAdmin
    .from("subjects")
    .insert({
      name,
      created_by: createdBy,
      description,
    })
    .select()
    .single();
}

export async function updateSubject(
  id: string,
  professorId: string,
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
    .eq("created_by", professorId)
    .select()
    .single();
}

export async function deleteSubject(id: string, professorId: string) {
  return await supabaseAdmin
    .from("subjects")
    .delete()
    .eq("id", id)
    .eq("created_by", professorId)
    .select()
    .single();
}
