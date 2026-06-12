import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { Subject, Lesson } from "../types/professor";

import ProfessorSidebar from "../components/professor/ProfessorSidebar";
import SubjectFormModal from "../components/professor/SubjectFormModal";
import LessonList from "../components/professor/LessonList";
import LessonFormModal from "../components/professor/LessonFormModal";
import ProfessorLessonVariantPreview from "../components/professor/ProfessorLessonVariantPreview";
import ProfessorStudentsView from "../components/professor/ProfessorStudentsView";
import ProfessorQuizList from "../components/professor/ProfessorQuizList";
import ProfessorSubjectStatistics from "../components/professor/ProfessorSubjectStatistics";
import { getSubjectIcon } from "../utils/subjectIcons";

const SUBJECT_STYLES = [
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-sky-100", text: "text-sky-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-600" },
];

const ProfessorDashboard = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");
  const [lessonsError, setLessonsError] = useState("");

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [generatingVariantsId, setGeneratingVariantsId] = useState<string | undefined>(undefined);
  const [subjectTab, setSubjectTab] = useState<"gradivo" | "studenti" | "kvizi" | "statistika">("gradivo");
  const [totalStudents, setTotalStudents] = useState<number | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      setSubjectsError("");
      const res = await api.get("/subjects");
      setSubjects(res.data);
    } catch {
      setSubjectsError("Napaka pri nalaganju predmetov.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      setLessonsError("");
      const res = await api.get("/lessons");
      setLessons(res.data);
    } catch {
      setLessonsError("Napaka pri nalaganju gradiv.");
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchTotalStudents = async (subjectList: typeof subjects) => {
    if (subjectList.length === 0) { setTotalStudents(0); return; }
    try {
      const results = await Promise.all(
        subjectList.map((s) => api.get(`/subjects/${s.id}/students`))
      );
      const ids = new Set<string>();
      results.forEach((r) => r.data.students?.forEach((st: { id: string }) => ids.add(st.id)));
      setTotalStudents(ids.size);
    } catch {
      setTotalStudents(null);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchLessons();
  }, []);

  useEffect(() => {
    if (!loadingSubjects) fetchTotalStudents(subjects);
  }, [loadingSubjects, subjects]);

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
    if (previewLesson?.id === id) setPreviewLesson(null);
    fetchLessons();
  };

  const generateVariants = async (lesson: Lesson) => {
    setGeneratingVariantsId(lesson.id);
    try {
      await api.post(`/lessons/${lesson.id}/generate-variants`);
      await fetchLessons();
    } catch {
      setLessonsError("Napaka pri generiranju variant. Poskusi znova.");
    } finally {
      setGeneratingVariantsId(undefined);
    }
  };

  // ── Home view ────────────────────────────────────────────────────────────────
  const renderHome = () => (
    <>
      {/* Header */}
      <div className="mb-6 rounded-[32px] bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">Profesor Dashboard</h1>
            <p className="mt-2 text-base text-slate-500">Upravljanje predmetov in učnega gradiva.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={openCreateSubject}
              className="rounded-2xl bg-violet-500 px-6 py-3 text-white font-semibold shadow-sm hover:bg-violet-600 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Dodaj predmet
            </button>
            <button
              onClick={openCreateLesson}
              className="rounded-2xl bg-white border border-violet-200 px-6 py-3 text-violet-700 font-semibold shadow-sm hover:bg-violet-50 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Dodaj gradivo
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Predmeti</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            {loadingSubjects ? (
              <span className="inline-block w-10 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              subjects.length
            )}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Učna gradiva</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            {loadingLessons ? (
              <span className="inline-block w-10 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              lessons.length
            )}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Vpisani študenti</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            {totalStudents === null ? (
              <span className="inline-block w-10 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              totalStudents
            )}
          </h3>
          <p className="mt-1 text-xs text-slate-400">Unikatnih po vseh predmetih</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl p-6 shadow-sm text-white">
          <p className="text-violet-100 text-sm font-medium mb-1">✨ AI pomočnik</p>
          <h2 className="text-lg font-semibold">Generiranje učnih variant</h2>
          <p className="mt-1 text-violet-200 text-xs">Vizualni · Slušni · Kinestetični</p>
        </div>
      </div>

      {/* Subjects error */}
      {subjectsError && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
          <span className="font-medium">{subjectsError}</span>
          <button onClick={fetchSubjects} className="ml-auto text-sm font-semibold underline hover:no-underline">
            Poskusi znova
          </button>
        </div>
      )}

      {/* Subjects loading skeleton */}
      {loadingSubjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 animate-pulse">
              <div className="h-32 bg-slate-100" />
              <div className="p-6">
                <div className="h-6 bg-slate-100 rounded-lg mb-3 w-3/4" />
                <div className="h-4 bg-slate-50 rounded mb-2 w-full" />
                <div className="h-4 bg-slate-50 rounded mb-6 w-2/3" />
                <div className="flex gap-3">
                  <div className="flex-1 h-11 bg-slate-100 rounded-2xl" />
                  <div className="w-16 h-11 bg-slate-50 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl bg-white border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center text-3xl">🎓</div>
          <p className="text-slate-700 font-semibold text-xl">Nimate še predmetov</p>
          <p className="text-slate-400 text-sm text-center max-w-sm">
            Začnite z dodajanjem prvega predmeta in nato ustvarite AI-generirano učno gradivo.
          </p>
          <button
            onClick={openCreateSubject}
            className="mt-2 rounded-2xl bg-violet-500 px-7 py-3 text-white font-semibold shadow-sm hover:bg-violet-600 transition"
          >
            + Dodaj prvi predmet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((subject, index) => {
            const { bg, text } = SUBJECT_STYLES[index % SUBJECT_STYLES.length];
            const SubjectIcon = getSubjectIcon(subject.name, index);
            const subjectLessonCount = lessons.filter((l) => l.subject_id === subject.id).length;

            return (
              <div
                key={subject.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition duration-300 flex flex-col"
              >
                <div className={`h-28 ${bg} p-5 flex items-start justify-between`}>
                  <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <SubjectIcon className={`w-7 h-7 ${text}`} strokeWidth={2.25} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-slate-600 text-xs font-semibold">
                      Predmet
                    </span>
                    <span className="bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-slate-600 text-xs font-semibold">
                      {subjectLessonCount} {subjectLessonCount === 1 ? "gradivo" : "gradiva"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{subject.name}</h2>
                  <p className="text-slate-500 mb-5 text-sm flex-1 min-h-[40px]">
                    {subject.description || "Brez opisa predmeta."}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setPreviewLesson(null);
                      }}
                      className="flex-1 bg-violet-500 hover:bg-violet-600 text-white py-2.5 rounded-2xl font-semibold transition text-sm"
                    >
                      Odpri
                    </button>
                    <button
                      onClick={() => openEditSubject(subject)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition text-sm"
                    >
                      Uredi
                    </button>
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-500 font-semibold transition text-sm"
                    >
                      Briši
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ── Subject detail view ──────────────────────────────────────────────────────
  const renderSubjectDetail = () => {
    if (!selectedSubject) return null;

    return (
      <>
        {/* Back + header */}
        <button
          onClick={() => {
            setSelectedSubject(null);
            setPreviewLesson(null);
            setSubjectTab("gradivo");
          }}
          className="mb-5 inline-flex items-center gap-1.5 text-violet-600 font-semibold hover:text-violet-800 transition text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Nazaj na predmete
        </button>

        <div className="mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-8 shadow-md text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-violet-200 text-sm font-medium">Aktiven predmet</span>
              <h1 className="mt-1 text-3xl font-bold">{selectedSubject.name}</h1>
              {selectedSubject.description && (
                <p className="mt-2 text-violet-100 text-sm">{selectedSubject.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                  {selectedLessons.length} {selectedLessons.length === 1 ? "gradivo" : "gradiva"}
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                  ✨ AI variante
                </span>
              </div>
            </div>

            <button
              onClick={openCreateLesson}
              className="shrink-0 rounded-2xl bg-white text-violet-700 px-6 py-3 font-semibold shadow-sm hover:bg-violet-50 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Dodaj gradivo
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
          {(["gradivo", "kvizi", "studenti", "statistika"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setSubjectTab(tab); setPreviewLesson(null); }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                subjectTab === tab
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "gradivo" ? "📚 Učno gradivo" : tab === "kvizi" ? "🧠 Kvizi" : tab === "studenti" ? "👥 Študenti" : "📊 Statistika"}
            </button>
          ))}
        </div>

        {subjectTab === "gradivo" && (
          <>
            {/* Lessons section */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Učno gradivo</h2>
                <p className="text-slate-500 text-sm">Prezentacije in dodatno gradivo za predmet.</p>
              </div>
              {selectedLessons.length > 0 && (
                <span className="text-sm text-slate-400 font-medium">
                  {selectedLessons.length} {selectedLessons.length === 1 ? "gradivo" : "gradiva"}
                </span>
              )}
            </div>

            {/* Lessons error */}
            {lessonsError && (
              <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-red-600 flex items-center gap-3">
                <span className="font-medium">{lessonsError}</span>
                <button onClick={fetchLessons} className="ml-auto text-sm font-semibold underline">
                  Poskusi znova
                </button>
              </div>
            )}

            {loadingLessons ? (
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-slate-50 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <LessonList
                  lessons={selectedLessons}
                  onEdit={openEditLesson}
                  onDelete={deleteLesson}
                  onPreview={setPreviewLesson}
                  onGenerateVariants={generateVariants}
                  generatingVariantsId={generatingVariantsId}
                  activePreviewId={previewLesson?.id}
                />
              </div>
            )}

            {/* AI Preview panel */}
            {previewLesson && (
              <div className="mt-6 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-0.5">
                      ✨ AI Predogled
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">
                      {previewLesson.title.replace("[Prezentacija] ", "").replace("[Dodatno gradivo] ", "")}
                    </h2>
                  </div>
                  <button
                    onClick={() => setPreviewLesson(null)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium text-sm transition flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Zapri
                  </button>
                </div>
                <div className="p-6">
                  <ProfessorLessonVariantPreview
                    lessonId={previewLesson.id}
                    lessonTitle={previewLesson.title}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {subjectTab === "kvizi" && (
          <ProfessorQuizList subjectId={selectedSubject.id} lessons={selectedLessons} />
        )}

        {subjectTab === "studenti" && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Vpisani študenti</h2>
              <p className="text-slate-500 text-sm">Pregled učnih tipov in analitika za predmet.</p>
            </div>
            <ProfessorStudentsView subjectId={selectedSubject.id} />
          </>
        )}

        {subjectTab === "statistika" && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Uspeh študentov</h2>
              <p className="text-slate-500 text-sm">Pregled napredka in uspešnosti reševanja kvizov za vsakega študenta.</p>
            </div>
            <ProfessorSubjectStatistics subjectId={selectedSubject.id} />
          </>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <ProfessorSidebar
        selectedSubject={selectedSubject}
        subjects={subjects}
        onSelectSubject={(s) => {
          setSelectedSubject(s);
          setPreviewLesson(null);
          setSubjectTab("gradivo");
        }}
        goHome={() => {
          setSelectedSubject(null);
          setPreviewLesson(null);
          setSubjectTab("gradivo");
        }}
        onCreateSubject={openCreateSubject}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {!selectedSubject ? renderHome() : renderSubjectDetail()}
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
