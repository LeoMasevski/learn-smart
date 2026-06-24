import { useEffect, useState, useCallback } from "react";
import { api } from "../api/api";
import type { Subject, Lesson } from "../types/professor";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Brain,
  Users,
  BarChart3,
  Menu,
  AlertCircle,
  X,
} from "lucide-react";

import ProfessorSidebar from "../components/professor/ProfessorSidebar";
import SubjectFormModal from "../components/professor/SubjectFormModal";
import LessonList from "../components/professor/LessonList";
import LessonFormModal from "../components/professor/LessonFormModal";
import ProfessorLessonVariantPreview from "../components/professor/ProfessorLessonVariantPreview";
import ProfessorStudentsView from "../components/professor/ProfessorStudentsView";
import ProfessorQuizList from "../components/professor/ProfessorQuizList";
import ProfessorSubjectStatistics from "../components/professor/ProfessorSubjectStatistics";
import ConfirmDialog from "../components/professor/ConfirmDialog";
import Toast from "../components/professor/Toast";
import { getSubjectIcon } from "../utils/subjectIcons";

const SUBJECT_STYLES = [
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-sky-100", text: "text-sky-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-600" },
];

type ConfirmState = {
  type: "subject" | "lesson";
  id: string;
  name: string;
};

type ToastState = {
  message: string;
  type: "success" | "error" | "info";
};

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
  const [generationWatchUntil, setGenerationWatchUntil] = useState<number | null>(null);
  const [subjectTab, setSubjectTab] = useState<"gradivo" | "studenti" | "kvizi" | "statistika">("gradivo");
  const [totalStudents, setTotalStudents] = useState<number | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState["type"] = "success") => {
    setToast({ message, type });
  }, []);

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

  const fetchLessons = async (options: { silent?: boolean } = {}) => {
    try {
      if (!options.silent) {
        setLoadingLessons(true);
      }
      setLessonsError("");
      const res = await api.get("/lessons");
      setLessons(res.data);
    } catch {
      setLessonsError("Napaka pri nalaganju gradiv.");
    } finally {
      if (!options.silent) {
        setLoadingLessons(false);
      }
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

  useEffect(() => {
    if (!generationWatchUntil) return;

    const intervalId = window.setInterval(() => {
      if (Date.now() > generationWatchUntil) {
        setGenerationWatchUntil(null);
        window.clearInterval(intervalId);
        return;
      }

      fetchLessons({ silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [generationWatchUntil]);

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

  const requestDeleteSubject = (subject: Subject) => {
    setConfirmState({ type: "subject", id: subject.id, name: subject.name });
  };

  const requestDeleteLesson = (id: string, name: string) => {
    setConfirmState({ type: "lesson", id, name });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState) return;
    const { type, id, name } = confirmState;
    setConfirmState(null);

    try {
      if (type === "subject") {
        await api.delete(`/subjects/${id}`);
        setSelectedSubject(null);
        fetchSubjects();
        showToast(`Predmet "${name}" je bil izbrisan.`);
      } else {
        await api.delete(`/lessons/${id}`);
        if (previewLesson?.id === id) setPreviewLesson(null);
        fetchLessons();
        showToast(`Gradivo "${name}" je bilo izbrisano.`);
      }
    } catch {
      showToast("Napaka pri brisanju. Poskusi znova.", "error");
    }
  };

  const openCreateLesson = () => {
    setEditingLesson(null);
    setLessonModalOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  };

  const generateVariants = async (lesson: Lesson) => {
    setGeneratingVariantsId(lesson.id);
    try {
      await api.post(`/lessons/${lesson.id}/generate-variants`);
      setGenerationWatchUntil(Date.now() + 2 * 60 * 1000);
      await fetchLessons({ silent: true });
      showToast("Generiranje AI variant je v teku...", "info");
    } catch {
      showToast("Napaka pri generiranju variant. Poskusi znova.", "error");
    } finally {
      setGeneratingVariantsId(undefined);
    }
  };

  const renderHome = () => (
    <>
      {/* Header */}
      <div className="mb-6 rounded-[28px] bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900">Profesor Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Upravljanje predmetov in učnega gradiva.</p>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-3">
            <button
              onClick={openCreateSubject}
              className="flex-1 sm:flex-none rounded-2xl bg-violet-500 px-4 sm:px-6 py-2.5 sm:py-3 text-white font-semibold shadow-sm hover:bg-violet-600 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              Dodaj predmet
            </button>
            <button
              onClick={openCreateLesson}
              className="flex-1 sm:flex-none rounded-2xl bg-white border border-violet-200 px-4 sm:px-6 py-2.5 sm:py-3 text-violet-700 font-semibold shadow-sm hover:bg-violet-50 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              Dodaj gradivo
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-500">Predmeti</p>
          <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
            {loadingSubjects ? (
              <span className="inline-block w-10 h-7 sm:h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              subjects.length
            )}
          </h3>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-500">Učna gradiva</p>
          <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
            {loadingLessons ? (
              <span className="inline-block w-10 h-7 sm:h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              lessons.length
            )}
          </h3>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-slate-200 col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm text-slate-500">Vpisani študenti</p>
          <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
            {totalStudents === null ? (
              <span className="inline-block w-10 h-7 sm:h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              totalStudents
            )}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Unikatnih po vseh predmetih</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm text-white col-span-2 sm:col-span-1">
          <p className="text-violet-100 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} /> AI pomočnik
          </p>
          <h2 className="text-sm sm:text-lg font-semibold">Generiranje učnih variant</h2>
          <p className="mt-1 text-violet-200 text-xs">Vizualni · Slušni · Kinestetični</p>
        </div>
      </div>

      {/* Subjects error */}
      {subjectsError && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 sm:px-5 py-4 text-red-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span className="font-medium text-sm">{subjectsError}</span>
          <button onClick={fetchSubjects} className="ml-auto text-sm font-semibold underline hover:no-underline shrink-0">
            Poskusi znova
          </button>
        </div>
      )}

      {/* Subjects loading skeleton */}
      {loadingSubjects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 animate-pulse">
              <div className="h-28 bg-slate-100" />
              <div className="p-5 sm:p-6">
                <div className="h-5 bg-slate-100 rounded-lg mb-3 w-3/4" />
                <div className="h-3 bg-slate-50 rounded mb-2 w-full" />
                <div className="h-3 bg-slate-50 rounded mb-5 w-2/3" />
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-slate-100 rounded-2xl" />
                  <div className="w-14 h-10 bg-slate-50 rounded-2xl" />
                  <div className="w-14 h-10 bg-slate-50 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4 rounded-3xl bg-white border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center text-3xl">
            <GraduationCap className="w-8 h-8 text-violet-500" strokeWidth={2} />
          </div>
          <p className="text-slate-700 font-semibold text-lg sm:text-xl">Nimate še predmetov</p>
          <p className="text-slate-400 text-sm text-center max-w-sm px-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">{subject.name}</h2>
                  <p className="text-slate-500 mb-4 text-sm flex-1 min-h-[36px]">
                    {subject.description || "Brez opisa predmeta."}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedSubject(subject);
                        setPreviewLesson(null);
                      }}
                      className="flex-1 bg-violet-500 hover:bg-violet-600 text-white py-2.5 rounded-xl font-semibold transition text-sm"
                    >
                      Odpri
                    </button>
                    <button
                      onClick={() => openEditSubject(subject)}
                      className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition text-sm"
                      title="Uredi predmet"
                    >
                      <Pencil className="w-4 h-4 sm:hidden" strokeWidth={2} />
                      <span className="hidden sm:inline">Uredi</span>
                    </button>
                    <button
                      onClick={() => requestDeleteSubject(subject)}
                      className="px-3 sm:px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 font-semibold transition text-sm"
                      title="Izbriši predmet"
                    >
                      <Trash2 className="w-4 h-4 sm:hidden" strokeWidth={2} />
                      <span className="hidden sm:inline">Briši</span>
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
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          Nazaj na predmete
        </button>

        <div className="mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-6 sm:p-8 shadow-md text-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-violet-200 text-sm font-medium">Aktiven predmet</span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{selectedSubject.name}</h1>
              {selectedSubject.description && (
                <p className="mt-2 text-violet-100 text-sm">{selectedSubject.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                  {selectedLessons.length} {selectedLessons.length === 1 ? "gradivo" : "gradiva"}
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2.25} /> AI variante
                </span>
              </div>
            </div>

            <button
              onClick={openCreateLesson}
              className="shrink-0 rounded-2xl bg-white text-violet-700 px-5 sm:px-6 py-2.5 sm:py-3 font-semibold shadow-sm hover:bg-violet-50 transition flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Dodaj gradivo
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit min-w-full sm:min-w-0">
            {([
              { key: "gradivo", label: "Gradivo", icon: BookOpen },
              { key: "kvizi", label: "Kvizi", icon: Brain },
              { key: "studenti", label: "Študenti", icon: Users },
              { key: "statistika", label: "Statistika", icon: BarChart3 },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setSubjectTab(tab.key); setPreviewLesson(null); }}
                className={`rounded-xl px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                  subjectTab === tab.key
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                aria-current={subjectTab === tab.key ? "true" : undefined}
              >
                <tab.icon className="w-4 h-4" strokeWidth={2.25} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {subjectTab === "gradivo" && (
          <>
            {/* Lessons section */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Učno gradivo</h2>
                <p className="text-slate-500 text-sm">Prezentacije in dodatno gradivo za predmet.</p>
              </div>
              {selectedLessons.length > 0 && (
                <span className="text-sm text-slate-400 font-medium shrink-0 ml-3">
                  {selectedLessons.length} {selectedLessons.length === 1 ? "gradivo" : "gradiva"}
                </span>
              )}
            </div>

            {/* Lessons error */}
            {lessonsError && (
              <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 sm:px-5 py-4 text-red-600 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span className="font-medium text-sm">{lessonsError}</span>
                <button onClick={() => fetchLessons()} className="ml-auto text-sm font-semibold underline shrink-0">
                  Poskusi znova
                </button>
              </div>
            )}

            {loadingLessons ? (
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
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
                  onDelete={requestDeleteLesson}
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
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} /> AI Predogled
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {previewLesson.title.replace("[Prezentacija] ", "").replace("[Dodatno gradivo] ", "")}
                    </h2>
                  </div>
                  <button
                    onClick={() => setPreviewLesson(null)}
                    className="rounded-xl bg-slate-100 px-3 sm:px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium text-sm transition flex items-center gap-1.5 shrink-0 ml-3"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden sm:inline">Zapri</span>
                  </button>
                </div>
                <div className="p-4 sm:p-6">
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
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Vpisani študenti</h2>
              <p className="text-slate-500 text-sm">Pregled učnih tipov in analitika za predmet.</p>
            </div>
            <ProfessorStudentsView subjectId={selectedSubject.id} />
          </>
        )}

        {subjectTab === "statistika" && (
          <>
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Uspeh študentov</h2>
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
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Odpri meni (predmeti, profil in odjava)"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>
          <h1 className="text-base font-bold bg-gradient-to-r from-violet-700 to-fuchsia-500 bg-clip-text text-transparent flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-violet-600" strokeWidth={2.25} />
            LearnSmart
          </h1>
          {selectedSubject && (
            <span className="text-sm text-slate-500 truncate">{selectedSubject.name}</span>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {!selectedSubject ? renderHome() : renderSubjectDetail()}
        </main>
      </div>

      {/* Modals */}
      {subjectModalOpen && (
        <SubjectFormModal
          subject={editingSubject}
          onClose={() => setSubjectModalOpen(false)}
          onSaved={() => {
            setSubjectModalOpen(false);
            fetchSubjects();
            showToast(editingSubject ? "Predmet je bil posodobljen." : "Predmet je bil ustvarjen.");
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
            setGenerationWatchUntil(Date.now() + 2 * 60 * 1000);
            fetchLessons({ silent: true });
            if (editingLesson) {
              showToast("Gradivo je bilo posodobljeno.");
            }
          }}
        />
      )}

      {/* Confirm delete dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.type === "subject" ? "Izbriši predmet?" : "Izbriši gradivo?"}
          message={
            confirmState.type === "subject"
              ? `Predmet "${confirmState.name}" in vse njegovo gradivo bodo trajno izbrisani. Tega dejanja ni mogoče razveljaviti.`
              : `Gradivo "${confirmState.name}" bo trajno izbrisano. Tega dejanja ni mogoče razveljaviti.`
          }
          confirmLabel="Izbriši"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProfessorDashboard;