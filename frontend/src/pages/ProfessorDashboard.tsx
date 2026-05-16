import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Subject, Lesson } from "../types/professor";
import ProfessorSidebar from "../components/professor/ProfessorSidebar";
import ProfessorSubjectGrid from "../components/professor/ProfessorSubjectGrid";
import SubjectFormModal from "../components/professor/SubjectFormModal";
import LessonList from "../components/professor/LessonList";
import LessonFormModal from "../components/professor/LessonFormModal";

const ProfessorDashboard = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const fetchSubjects = async () => {
    const res = await api.get("/subjects");
    setSubjects(res.data);
  };

  const fetchLessons = async () => {
    const res = await api.get("/lessons");
    setLessons(res.data);
  };

  useEffect(() => {
    fetchSubjects();
    fetchLessons();
  }, []);

  const selectedLessons = lessons.filter(
    (lesson) => lesson.subject_id === selectedSubject?.id
  );

  const openCreateSubject = () => {
    setEditingSubject(null);
    setSubjectModalOpen(true);
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectModalOpen(true);
  };

  const deleteSubject = async (id: string) => {
    await api.delete(`/subjects/${id}`);
    setSelectedSubject(null);
    fetchSubjects();
  };

  const openCreateLesson = () => {
    setEditingLesson(null);
    setLessonModalOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  };

  const deleteLesson = async (id: string) => {
    await api.delete(`/lessons/${id}`);
    fetchLessons();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <ProfessorSidebar
        selectedSubject={selectedSubject}
        goHome={() => setSelectedSubject(null)}
      />

      <main className="flex-1 p-8">
        {!selectedSubject ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Profesor Dashboard
                </h1>
                <p className="text-slate-500">
                  Kreiranje, urejanje in brisanje predmetov.
                </p>
              </div>

              <button
                onClick={openCreateSubject}
                className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-violet-700"
              >
                + Dodaj predmet
              </button>
            </div>

            <ProfessorSubjectGrid
              subjects={subjects}
              onOpen={setSelectedSubject}
              onEdit={openEditSubject}
              onDelete={deleteSubject}
            />
          </>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="text-violet-600 font-semibold mb-4"
                >
                  ← Nazaj na predmete
                </button>

                <h1 className="text-3xl font-bold text-slate-900">
                  {selectedSubject.name}
                </h1>

                <p className="text-slate-500">
                  {selectedSubject.description || "Brez opisa."}
                </p>
              </div>

              <button
                onClick={openCreateLesson}
                className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-violet-700"
              >
                + Dodaj učno gradivo
              </button>
            </div>

            <LessonList
              lessons={selectedLessons}
              onEdit={openEditLesson}
              onDelete={deleteLesson}
            />
          </>
        )}
      </main>

      {subjectModalOpen && (
        <SubjectFormModal
          subject={editingSubject}
          onClose={() => setSubjectModalOpen(false)}
          onSaved={() => {
            setSubjectModalOpen(false);
            fetchSubjects();
          }}
        />
      )}

      {lessonModalOpen && selectedSubject && (
        <LessonFormModal
          subjectId={selectedSubject.id}
          lesson={editingLesson}
          onClose={() => setLessonModalOpen(false)}
          onSaved={() => {
            setLessonModalOpen(false);
            fetchLessons();
          }}
        />
      )}
    </div>
  );
};

export default ProfessorDashboard;