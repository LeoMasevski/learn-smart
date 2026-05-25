import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Subject, Lesson } from "../types/professor";

import ProfessorSidebar from "../components/professor/ProfessorSidebar";
import SubjectFormModal from "../components/professor/SubjectFormModal";
import LessonList from "../components/professor/LessonList";
import LessonFormModal from "../components/professor/LessonFormModal";
import ProfessorLessonVariantPreview from "../components/professor/ProfessorLessonVariantPreview";

const ProfessorDashboard = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

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

    if (previewLesson?.id === id) {
      setPreviewLesson(null);
    }

    fetchLessons();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <ProfessorSidebar
        selectedSubject={selectedSubject}
        goHome={() => {
          setSelectedSubject(null);
          setPreviewLesson(null);
        }}
      />

      <main className="flex-1 p-8">
        {!selectedSubject ? (
          <>
            <div className="mb-8 rounded-[32px] bg-white p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-slate-900">
                    Profesor Dashboard
                  </h1>

                  <p className="mt-3 text-base text-slate-500">
                    Upravljanje predmetov in učnega gradiva.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={openCreateSubject}
                    className="rounded-2xl bg-violet-500 px-6 py-3 text-white font-medium shadow-sm hover:bg-violet-600 transition"
                  >
                    + Dodaj predmet
                  </button>

                  <button
                    onClick={() => {
                      setEditingLesson(null);
                      setLessonModalOpen(true);
                    }}
                    className="rounded-2xl bg-white border border-violet-200 px-6 py-3 text-violet-700 font-medium shadow-sm hover:bg-violet-50 transition"
                  >
                    + Dodaj gradivo
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">Predmeti</p>

                <h3 className="mt-2 text-3xl font-medium text-slate-900">
                  {subjects.length}
                </h3>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">Učna gradiva</p>

                <h3 className="mt-2 text-3xl font-medium text-slate-900">
                  {lessons.length}
                </h3>
              </div>

              <div className="bg-pink-50 rounded-3xl p-6 shadow-sm border border-pink-100">
                <p className="text-pink-500 text-sm font-medium mb-2">
                  AI pomočnik
                </p>

                <h2 className="text-xl font-medium text-slate-900">
                  Pomoč pri pripravi gradiva
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {subjects.map((subject, index) => {
                const icons = ["💻", "🎨", "📚", "🧠"];
                const icon = icons[index % icons.length];

                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition duration-300"
                  >
                    <div className="h-32 bg-violet-100 p-6 flex items-start justify-between">
                      <span className="text-4xl">{icon}</span>

                      <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full text-slate-500 text-sm font-medium">
                        Predmet
                      </div>
                    </div>

                    <div className="p-6">
                      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                        {subject.name}
                      </h2>

                      <p className="text-slate-500 mb-6 text-sm min-h-[50px]">
                        {subject.description || "Brez opisa predmeta."}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setPreviewLesson(null);
                          }}
                          className="flex-1 bg-violet-500 hover:bg-violet-600 text-white py-3 rounded-2xl font-medium transition"
                        >
                          Odpri
                        </button>

                        <button
                          onClick={() => openEditSubject(subject)}
                          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                        >
                          Uredi
                        </button>

                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-500 font-medium transition"
                        >
                          Briši
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedSubject(null);
                setPreviewLesson(null);
              }}
              className="mb-5 text-violet-600 font-medium hover:text-violet-800"
            >
              ← Nazaj na predmete
            </button>

            <div className="mb-8 rounded-3xl bg-violet-50 p-8 shadow-sm border border-violet-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-violet-600">
                    Aktiven predmet
                  </span>

                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    {selectedSubject.name}
                  </h1>
                </div>

                <button
                  onClick={openCreateLesson}
                  className="rounded-2xl bg-violet-500 px-6 py-3 text-white font-medium shadow-sm hover:bg-violet-600 transition"
                >
                  + Dodaj gradivo
                </button>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-slate-900">
                Učno gradivo
              </h2>

              <p className="text-slate-500 text-sm">
                Prezentacije in dodatno gradivo za predmet.
              </p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <LessonList
                lessons={selectedLessons}
                onEdit={openEditLesson}
                onDelete={deleteLesson}
                onPreview={setPreviewLesson}
              />
            </div>

            {previewLesson && (
              <div className="mt-8 rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-violet-600 font-medium">
                      Predogled gradiva
                    </p>

                    <h2 className="text-2xl font-semibold text-slate-900">
                      {previewLesson.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setPreviewLesson(null)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600 hover:bg-slate-200"
                  >
                    Zapri
                  </button>
                </div>

                <ProfessorLessonVariantPreview
                  lessonId={previewLesson.id}
                  lessonTitle={previewLesson.title}
                />
              </div>
            )}
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

      {lessonModalOpen && (
        <LessonFormModal
          subjects={subjects}
          defaultSubjectId={selectedSubject?.id}
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