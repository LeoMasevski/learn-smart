import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css"; // kept for shared components that still use it

import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import LessonRenderer from "../components/lesson/LessonRenderer";
import SubjectDetailPage from "../components/student/SubjectDetailPage";

import type {
  StudentSubject,
  StudentLesson,
  LessonVariant,
} from "../types/student";

type FilterType = "vse" | "zakljuceni" | "nezakljuceni" | "najboljsi" | "najslabsi";
type MainPageType = "predmeti" | "profil";
type ViewType = "subjects" | "subjectDetail" | "lesson";

const SUBJECT_COLORS = ["#6d4cff", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const SUBJECT_ICONS = ["📘", "💻", "🧠", "🎨", "🔬", "📐"];

const StudentDashboard = () => {
  const { profile, logout } = useAuth();

  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<StudentLesson | null>(null);
  const [activeVariant, setActiveVariant] = useState<LessonVariant | null>(null);

  const [view, setView] = useState<ViewType>("subjects");
  const [filter, setFilter] = useState<FilterType>("vse");
  const [mainPage, setMainPage] = useState<MainPageType>("predmeti");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchMySubjects(); }, []);

  async function fetchMySubjects() {
    try {
      setLoadingSubjects(true);
      setError("");
      const res = await api.get("/user-subjects/my-subjects");
      setSubjects(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Napaka pri nalaganju vpisanih predmetov.");
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function openSubject(subject: StudentSubject) {
    if (!profile?.learning_type) { setError("Najprej moraš rešiti kviz učnega tipa."); return; }
    try {
      setSelectedSubject(subject);
      setSelectedLesson(null);
      setActiveVariant(null);
      setLoadingLesson(true);
      setError("");
      setView("subjectDetail");
      const res = await api.get(`/lessons/subject/${subject.id}`);
      setLessons(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Napaka pri nalaganju lekcij.");
    } finally {
      setLoadingLesson(false);
    }
  }

  async function openLesson(lesson: StudentLesson) {
    if (!profile?.learning_type) { setError("Najprej moraš rešiti kviz učnega tipa."); return; }
    try {
      setSelectedLesson(lesson);
      setActiveVariant(null);
      setLoadingLesson(true);
      setError("");
      setView("lesson");
      const res = await api.get(`/lessons/${lesson.id}/variant/${profile.learning_type}`);
      setActiveVariant(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Napaka pri nalaganju prilagojene lekcije.");
    } finally {
      setLoadingLesson(false);
    }
  }

  async function navigateLesson(direction: "prev" | "next") {
    if (!selectedLesson || lessons.length === 0) return;
    const idx = lessons.findIndex((l) => l.id === selectedLesson.id);
    if (idx === -1) return;
    const newIdx = direction === "next" ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= lessons.length) return;
    await openLesson(lessons[newIdx]);
  }

  function goHome() {
    setSelectedSubject(null); setSelectedLesson(null);
    setActiveVariant(null); setLessons([]);
    setView("subjects"); setMainPage("predmeti"); setError("");
  }

  function goToSubjectDetail() {
    setSelectedLesson(null); setActiveVariant(null);
    setView("subjectDetail"); setError("");
  }

  function getLearningTypeLabel() {
    if (!profile?.learning_type) return "Ni določen";
    return { VISUAL: "Vizualni učenec", AUDITORY: "Slušni učenec", KINESTHETIC: "Kinestetični učenec" }[profile.learning_type];
  }

  function getInitials() {
    if (!profile?.full_name) return "U";
    return profile.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }

  const currentLessonIndex = selectedLesson ? lessons.findIndex((l) => l.id === selectedLesson.id) : -1;
  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < lessons.length - 1;

  // Topbar
  const renderTopbar = () => (
    <div className="flex items-center justify-between h-16 max-w-5xl mx-auto px-0 mb-2">
      <div />
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-9 h-9 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center hover:bg-violet-700 transition-colors"
        >
          {getInitials()}
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
            <p className="font-bold text-gray-900 text-sm mb-1">{profile?.full_name}</p>
            <p className="text-gray-500 text-xs mb-4">Učni tip: {getLearningTypeLabel()}</p>
            <button
              onClick={() => { logout(); setShowUserMenu(false); }}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Odjava
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // List subjects
  const renderSubjects = () => {
    if (loadingSubjects) return <p className="text-gray-400 text-sm mt-4">Nalagam predmete...</p>;

    if (subjects.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-5xl mx-auto mt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Moji predmeti</h2>
          <p className="text-gray-400 text-sm">Trenutno nisi vpisan v noben predmet.</p>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Moji predmeti</h1>
        <p className="text-gray-400 text-sm mb-6">Izberi predmet in nadaljuj s prilagojenim učenjem.</p>

        {/* Hero card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-400 rounded-2xl p-7 mb-6 flex items-center justify-between shadow-lg shadow-violet-200">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <p className="text-violet-200 text-sm font-semibold mb-1">Dobrodošel nazaj 👋</p>
            <h2 className="text-2xl font-extrabold text-white mb-1">Nadaljuj z učenjem</h2>
            <p className="text-violet-100 text-sm max-w-md">
              Lekcije so prilagojene tvojemu učnemu tipu: <strong>{getLearningTypeLabel()}</strong>.
            </p>
          </div>
          <button
            onClick={() => { if (subjects[0]) openSubject(subjects[0]); }}
            className="relative z-10 bg-white text-violet-700 font-extrabold text-sm px-5 py-3 rounded-xl hover:bg-violet-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Začni zdaj
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-5">
          {(["vse"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                filter === f
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-violet-300"
              }`}
            >
              {f === "vse" ? "Vse" : f}
            </button>
          ))}
        </div>

        {/* Subject grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, index) => (
            <div
              key={subject.id}
              onClick={() => openSubject(subject)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div
                className="h-24 flex items-center justify-between px-5"
                style={{ background: SUBJECT_COLORS[index % SUBJECT_COLORS.length] }}
              >
                <span className="text-3xl">{SUBJECT_ICONS[index % SUBJECT_ICONS.length]}</span>
                <span className="text-xs font-extrabold text-white/80 bg-white/20 px-2.5 py-1 rounded-full">AI</span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-extrabold text-gray-900 text-base mb-1">{subject.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{subject.description || "Brez opisa predmeta."}</p>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                  <div className="h-1.5 bg-violet-400 rounded-full w-0" />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>Prilagojeno učenje</span>
                  <span className="font-semibold text-violet-600">{getLearningTypeLabel()}</span>
                </div>

                <button className="w-full bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 text-gray-700 hover:text-violet-700 text-sm font-bold py-2.5 rounded-xl transition-all">
                  Odpri predmet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Profil
  const renderProfile = () => (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Profil</h2>
        <p className="text-gray-400 text-sm mb-6">Osnovni podatki študenta.</p>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-extrabold flex items-center justify-center flex-shrink-0">
            {getInitials()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">{profile?.full_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Učni tip: <strong className="text-gray-700">{getLearningTypeLabel()}</strong></p>
            <p className="text-sm text-gray-500">Število predmetov: <strong className="text-gray-700">{subjects.length}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );

  // Lesson izgled
  const renderLessonView = () => (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs mb-2 flex-wrap">
        <button onClick={goHome} className="text-violet-600 font-semibold hover:underline hover:opacity-70 transition-opacity">
          🏠 Predmeti
        </button>
        <span className="text-gray-300">›</span>
        <button onClick={goToSubjectDetail} className="text-violet-600 font-semibold hover:underline hover:opacity-70 transition-opacity">
          {selectedSubject?.name}
        </button>
        <span className="text-gray-300">›</span>
        <span className="text-gray-700 font-bold truncate max-w-[200px]">{selectedLesson?.title}</span>
      </div>

      {/* Counter */}
      {currentLessonIndex !== -1 && (
        <p className="text-xs text-gray-400 font-semibold tracking-wide mb-4">
          Lekcija {currentLessonIndex + 1} od {lessons.length}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loadingLesson && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin flex-shrink-0" />
          <p className="text-gray-400 text-sm">Nalagam prilagojeno lekcijo...</p>
        </div>
      )}

      {/* Lesson vsebina */}
      {!loadingLesson && activeVariant && selectedLesson && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <LessonRenderer
            lesson={{
              lessonTitle: selectedLesson.title,
              learningType: activeVariant.learning_type,
              blocks: activeVariant.content_blocks,
            }}
          />
        </div>
      )}

      {/* Prev / Next nav */}
      {lessons.length > 1 && (
        <div className="flex items-center justify-between gap-4 pt-6 pb-8">
          <button
            onClick={() => navigateLesson("prev")}
            disabled={!hasPrev || loadingLesson}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all ${
              hasPrev && !loadingLesson
                ? "bg-white border-gray-200 text-gray-700 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50"
                : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            ← Prejšnja lekcija
          </button>

          {/* Paginacija s pikami */}
          <div className="flex items-center gap-2">
            {lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => openLesson(l)}
                title={l.title}
                className={`rounded-full transition-all ${
                  i === currentLessonIndex
                    ? "w-3 h-3 bg-violet-600 scale-110"
                    : "w-2.5 h-2.5 bg-gray-200 hover:bg-violet-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => navigateLesson("next")}
            disabled={!hasNext || loadingLesson}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
              hasNext && !loadingLesson
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            Naslednja lekcija →
          </button>
        </div>
      )}
    </div>
  );

  // sidebar
  const renderSidebar = () => (
    <aside className="w-64 min-w-[256px] min-h-screen bg-white border-r border-gray-100 flex flex-col gap-1 px-5 py-8">
      {/* Logo */}
      <button
        onClick={goHome}
        className="text-violet-600 text-xl font-extrabold mb-6 text-left hover:opacity-80 transition-opacity"
      >
        🎓 LearnSmart
      </button>

      {view === "subjects" ? (
        <>
          <button
            onClick={() => setMainPage("predmeti")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              mainPage === "predmeti"
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200"
                : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            ▦ Moji predmeti
          </button>
          <div className="h-px bg-gray-100 my-2" />
          <button
            onClick={() => setMainPage("profil")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              mainPage === "profil"
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200"
                : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            👤 Profil
          </button>
        </>
      ) : (
        <>
          <button
            onClick={goHome}
            className="text-violet-600 text-sm font-bold text-left mb-2 hover:opacity-70 transition-opacity"
          >
            ← Nazaj na predmete
          </button>
          <div className="h-px bg-gray-100 my-1" />

          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-1 mt-2 mb-1">
            Lekcije
          </p>

          {lessons.map((l, i) => {
            const isActive = selectedLesson?.id === l.id;
            return (
              <button
                key={l.id}
                onClick={() => openLesson(l)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white"
                    : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                  isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {i + 1}
                </span>
                <span className="text-xs font-semibold truncate">{l.title}</span>
              </button>
            );
          })}
        </>
      )}
    </aside>
  );

  // ── ROOT ─────────────────────────────────────────────────
  return (
    <div className="flex w-full min-h-screen bg-gray-50 font-sans text-gray-900">
      {renderSidebar()}

      <main className="flex-1 min-w-0 px-10 py-0">
        {renderTopbar()}

        {/* Error za predmete */}
        {error && view === "subjects" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 max-w-5xl mx-auto">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {view === "subjects" && (mainPage === "profil" ? renderProfile() : renderSubjects())}

        {view === "subjectDetail" && selectedSubject && (
          <SubjectDetailPage
            subject={selectedSubject}
            lessons={lessons}
            selectedLesson={selectedLesson}
            loadingLesson={loadingLesson}
            onOpenLesson={openLesson}
            onBack={goHome}
          />
        )}

        {view === "lesson" && renderLessonView()}
      </main>
    </div>
  );
};

export default StudentDashboard;