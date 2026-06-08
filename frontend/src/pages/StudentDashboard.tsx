import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";

import { api } from "../api/api.tsx";
import { useAuth } from "../context/AuthContext";
import LessonRenderer from "../components/lesson/LessonRenderer";
import SubjectDetailPage from "../components/student/SubjectDetailPage";

import type { StudentSubject, StudentLesson, LessonVariant } from "../types/student";

type ViewType = "subjects" | "allSubjects" | "subjectDetail" | "lesson";
type MainPageType = "predmeti" | "vsi-predmeti" | "profil";

const SUBJECT_COLORS = ["#6d4cff", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const SUBJECT_ICONS  = ["📘", "💻", "🧠", "🎨", "🔬", "📐"];

export default function StudentDashboard() {
  const { profile, logout } = useAuth();

  const [mySubjects, setMySubjects]       = useState<StudentSubject[]>([]);
  const [allSubjects, setAllSubjects]     = useState<StudentSubject[]>([]);
  const [enrollingId, setEnrollingId]     = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);
  const [lessons, setLessons]             = useState<StudentLesson[]>([]);
  const [selectedLesson, setSelectedLesson]   = useState<StudentLesson | null>(null);
  const [activeVariant, setActiveVariant] = useState<LessonVariant | null>(null);

  const [view, setView]           = useState<ViewType>("subjects");
  const [mainPage, setMainPage]   = useState<MainPageType>("predmeti");
  const [showMenu, setShowMenu]   = useState(false);

  const [loadingMy,     setLoadingMy]     = useState(false);
  const [loadingAll,    setLoadingAll]    = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => { fetchMySubjects(); }, []);

  // Api

  async function fetchMySubjects() {
    try {
      setLoadingMy(true);
      setError("");
      const res = await api.get("/user-subjects/my-subjects");
      setMySubjects(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Napaka pri nalaganju predmetov.");
    } finally {
      setLoadingMy(false);
    }
  }

  async function fetchAllSubjects() {
    try {
      setLoadingAll(true);
      setError("");
      const res = await api.get("/subjects");
      setAllSubjects(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Napaka pri nalaganju predmetov.");
    } finally {
      setLoadingAll(false);
    }
  }

  async function enrollInSubject(subjectId: string) {
    try {
      setEnrollingId(subjectId);
      setEnrollSuccess(null);
      await api.post(`/user-subjects/${subjectId}/enroll`);
      setEnrollSuccess(subjectId);
      // refresh my subjects
      await fetchMySubjects();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Napaka pri vpisu v predmet.");
    } finally {
      setEnrollingId(null);
    }
  }

  async function openSubject(subject: StudentSubject) {
    try {
      setSelectedSubject(subject);
      setSelectedLesson(null);
      setActiveVariant(null);
      setLoadingLessons(true);
      setError("");
      setView("subjectDetail");
      const res = await api.get(`/lessons/subject/${subject.id}`);
      setLessons(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Napaka pri nalaganju lekcij.");
    } finally {
      setLoadingLessons(false);
    }
  }

  async function openLesson(lesson: StudentLesson) {
    if (!profile?.learning_type) { setError("Najprej določi učni tip."); return; }
    try {
      setSelectedLesson(lesson);
      setActiveVariant(null);
      setLoadingVariant(true);
      setError("");
      setView("lesson");
      const res = await api.get(`/lessons/${lesson.id}/variant/${profile.learning_type}`);
      setActiveVariant(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Napaka pri nalaganju lekcije.");
    } finally {
      setLoadingVariant(false);
    }
  }

  async function navigateLesson(dir: "prev" | "next") {
    if (!selectedLesson) return;
    const idx  = lessons.findIndex(l => l.id === selectedLesson.id);
    const next = dir === "next" ? idx + 1 : idx - 1;
    if (next >= 0 && next < lessons.length) await openLesson(lessons[next]);
  }

  // Nav

  function goHome() {
    setView("subjects"); setMainPage("predmeti");
    setSelectedSubject(null); setSelectedLesson(null);
    setActiveVariant(null); setLessons([]); setError("");
  }

  function goToAllSubjects() {
    setView("allSubjects"); setMainPage("vsi-predmeti"); setError("");
    if (allSubjects.length === 0) fetchAllSubjects();
  }

  function goToSubjectDetail() {
    setView("subjectDetail"); setSelectedLesson(null); setActiveVariant(null); setError("");
  }

  function getInitials() {
    return profile?.full_name?.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() ?? "U";
  }

  function learningLabel() {
    if (!profile?.learning_type) return "Ni določen";
    return { VISUAL: "Vizualni", AUDITORY: "Slušni", KINESTHETIC: "Kinestetični" }[profile.learning_type];
  }

  const isEnrolled = (id: string) => mySubjects.some(s => s.id === id);
  const lessonIdx  = selectedLesson ? lessons.findIndex(l => l.id === selectedLesson.id) : -1;
  const hasPrev    = lessonIdx > 0;
  const hasNext    = lessonIdx < lessons.length - 1;

  // Sidebar

  const Sidebar = () => (
    <aside className="w-60 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col px-4 py-8 gap-1">
      <button onClick={goHome} className="text-violet-600 font-extrabold text-lg mb-6 text-left hover:opacity-75 transition-opacity">
        🎓 LearnSmart
      </button>

      {view === "subjects" || view === "allSubjects" || view === "lesson" && false ? (
        <>
          <SidebarBtn active={mainPage === "predmeti"} onClick={goHome}>
            📚 Moji predmeti
          </SidebarBtn>
          <SidebarBtn active={mainPage === "vsi-predmeti"} onClick={goToAllSubjects}>
            🌐 Vsi predmeti
          </SidebarBtn>
          <div className="h-px bg-gray-100 my-1" />
          <SidebarBtn active={mainPage === "profil"} onClick={() => { setView("subjects"); setMainPage("profil"); }}>
            👤 Profil
          </SidebarBtn>
        </>
      ) : (
        <>
          <button onClick={goHome} className="text-sm font-semibold text-violet-600 text-left mb-2 hover:opacity-70 transition-opacity">
            ← Predmeti
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-1 mt-2 mb-1">Lekcije</p>
          {lessons.map((l, i) => {
            const active = selectedLesson?.id === l.id;
            return (
              <button key={l.id} onClick={() => openLesson(l)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  active ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"
                }`}>{i + 1}</span>
                <span className="truncate">{l.title}</span>
              </button>
            );
          })}
        </>
      )}
    </aside>
  );

  // Topbar

  const Topbar = () => (
    <div className="flex justify-end items-center h-14 mb-2 relative">
      <button onClick={() => setShowMenu(!showMenu)}
        className="w-9 h-9 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center hover:bg-violet-700 transition-colors"
      >
        {getInitials()}
      </button>
      {showMenu && (
        <div className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
          <p className="font-bold text-gray-900 text-sm mb-0.5">{profile?.full_name}</p>
          <p className="text-gray-400 text-xs mb-4">Učni tip: {learningLabel()}</p>
          <button onClick={() => { logout(); setShowMenu(false); }}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Odjava
          </button>
        </div>
      )}
    </div>
  );

  // Moji predmeti

  const MySubjectsView = () => {
    if (loadingMy) return <p className="text-sm text-gray-400 mt-4">Nalagam predmete...</p>;

    if (mySubjects.length === 0) return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <h2 className="font-extrabold text-gray-900 text-lg mb-2">Nisi vpisan v noben predmet</h2>
          <p className="text-gray-400 text-sm mb-6">Oglej si vse razpoložljive predmete in se vpiši.</p>
          <button onClick={goToAllSubjects}
            className="bg-gradient-to-r from-violet-600 to-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-violet-200"
          >
            🌐 Oglej si vse predmete
          </button>
        </div>
      </div>
    );

    return (
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Moji predmeti</h1>
        <p className="text-gray-400 text-sm mb-6">Izberi predmet in začni s prilagojenim učenjem.</p>

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-400 rounded-2xl p-7 mb-6 flex items-center justify-between shadow-lg shadow-violet-200">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-violet-200 text-sm font-semibold mb-1">Dobrodošel nazaj 👋</p>
            <h2 className="text-2xl font-extrabold text-white mb-1">Nadaljuj z učenjem</h2>
            <p className="text-violet-100 text-sm">
              Vsebina je prilagojena: <strong>{learningLabel()}</strong>
            </p>
          </div>
          <button onClick={() => openSubject(mySubjects[0])}
            className="relative z-10 bg-white text-violet-700 font-extrabold text-sm px-5 py-3 rounded-xl hover:bg-violet-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Začni zdaj
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySubjects.map((subject, i) => (
            <div key={subject.id} onClick={() => openSubject(subject)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-24 flex items-center justify-between px-5"
                style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}>
                <span className="text-3xl">{SUBJECT_ICONS[i % SUBJECT_ICONS.length]}</span>
                <span className="text-xs font-extrabold text-white/80 bg-white/20 px-2.5 py-1 rounded-full">AI ✨</span>
              </div>
              <div className="p-5">
                <h3 className="font-extrabold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{subject.description || "Brez opisa."}</p>
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

  // Vsi predmeti

  const AllSubjectsView = () => {
    if (loadingAll) return (
      <div className="max-w-4xl mx-auto w-full flex items-center gap-3 mt-6">
        <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-violet-500 animate-spin" />
        <p className="text-gray-400 text-sm">Nalagam predmete...</p>
      </div>
    );

    return (
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Vsi predmeti</h1>
        <p className="text-gray-400 text-sm mb-6">Vpiši se v predmete, ki te zanimajo.</p>

        {allSubjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-gray-400 text-sm">V bazi še ni predmetov.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allSubjects.map((subject, i) => {
              const enrolled  = isEnrolled(subject.id);
              const enrolling = enrollingId === subject.id;
              const success   = enrollSuccess === subject.id;

              return (
                <div key={subject.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-stretch"
                >
                  {/* Color strip */}
                  <div className="w-2 shrink-0" style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />

                  {/* Content */}
                  <div className="flex-1 p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] + "22" }}>
                      {SUBJECT_ICONS[i % SUBJECT_ICONS.length]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-base">{subject.name}</h3>
                      <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">
                        {subject.description || "Brez opisa predmeta."}
                      </p>
                    </div>

                    {/* Enroll button */}
                    <div className="shrink-0 ml-4">
                      {enrolled ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-2.5 rounded-xl">
                          <span>✓</span> Vpisan
                        </div>
                      ) : (
                        <button
                          onClick={() => enrollInSubject(subject.id)}
                          disabled={enrolling}
                          className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${
                            enrolling
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-px"
                          }`}
                        >
                          {enrolling ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
                              Vpisujem...
                            </>
                          ) : (
                            <>+ Vpiši se</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Go to my subjects CTA */}
        {mySubjects.length > 0 && (
          <div className="mt-6 p-5 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-between">
            <p className="text-sm text-violet-700 font-semibold">
              Vpisan si v <strong>{mySubjects.length}</strong> {mySubjects.length === 1 ? "predmet" : "predmete"}.
            </p>
            <button onClick={goHome}
              className="text-sm font-bold text-violet-700 bg-white border border-violet-200 px-4 py-2 rounded-xl hover:bg-violet-100 transition-colors"
            >
              Pojdi na moje predmete →
            </button>
          </div>
        )}
      </div>
    );
  };

  const ProfileView = () => (
    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="font-extrabold text-gray-900 text-lg mb-1">Profil</h2>
        <p className="text-gray-400 text-sm mb-6">Osnovni podatki študenta.</p>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-extrabold flex items-center justify-center shrink-0">
            {getInitials()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">{profile?.full_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Učni tip: <strong className="text-gray-700">{learningLabel()}</strong></p>
            <p className="text-sm text-gray-500">Vpisani predmeti: <strong className="text-gray-700">{mySubjects.length}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );

  const LessonView = () => (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-1.5 text-xs mb-2 flex-wrap">
        <button onClick={goHome} className="text-violet-600 font-semibold hover:underline hover:opacity-70">🏠 Predmeti</button>
        <span className="text-gray-300">›</span>
        <button onClick={goToSubjectDetail} className="text-violet-600 font-semibold hover:underline hover:opacity-70">{selectedSubject?.name}</button>
        <span className="text-gray-300">›</span>
        <span className="text-gray-700 font-bold truncate max-w-[180px]">{selectedLesson?.title}</span>
      </div>

      {lessonIdx !== -1 && (
        <p className="text-xs text-gray-400 font-semibold tracking-wide mb-4">
          Lekcija {lessonIdx + 1} od {lessons.length}
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {loadingVariant && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center gap-4">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-violet-500 animate-spin shrink-0" />
          <p className="text-gray-400 text-sm">Nalagam prilagojeno lekcijo...</p>
        </div>
      )}

      {!loadingVariant && activeVariant && selectedLesson && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <LessonRenderer lesson={{
            lessonTitle: selectedLesson.title,
            learningType: activeVariant.learning_type,
            blocks: activeVariant.content_blocks,
          }} />
        </div>
      )}

      {lessons.length > 1 && (
        <div className="flex items-center justify-between gap-4 pt-6 pb-8">
          <button onClick={() => navigateLesson("prev")} disabled={!hasPrev || loadingVariant}
            className={`px-5 py-3 rounded-xl text-sm font-bold border transition-all ${
              hasPrev && !loadingVariant
                ? "bg-white border-gray-200 text-gray-700 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50"
                : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            ← Prejšnja lekcija
          </button>

          <div className="flex items-center gap-2">
            {lessons.map((l, i) => (
              <button key={l.id} onClick={() => openLesson(l)} title={l.title}
                className={`rounded-full transition-all ${i === lessonIdx ? "w-3 h-3 bg-violet-600 scale-110" : "w-2.5 h-2.5 bg-gray-200 hover:bg-violet-300"}`}
              />
            ))}
          </div>

          <button onClick={() => navigateLesson("next")} disabled={!hasNext || loadingVariant}
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${
              hasNext && !loadingVariant
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

  const inLesson = view === "subjectDetail" || view === "lesson";

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col px-4 py-8 gap-1">
        <button onClick={goHome} className="text-violet-600 font-extrabold text-lg mb-6 text-left hover:opacity-75 transition-opacity">
          🎓 LearnSmart
        </button>

        {!inLesson ? (
          <>
            <SidebarBtn active={mainPage === "predmeti"} onClick={goHome}>
              📚 Moji predmeti
              {mySubjects.length > 0 && (
                <span className="ml-auto bg-violet-100 text-violet-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {mySubjects.length}
                </span>
              )}
            </SidebarBtn>
            <SidebarBtn active={mainPage === "vsi-predmeti"} onClick={goToAllSubjects}>
              🌐 Vsi predmeti
            </SidebarBtn>
            <div className="h-px bg-gray-100 my-1" />
            <SidebarBtn active={mainPage === "profil"} onClick={() => { setView("subjects"); setMainPage("profil"); }}>
              👤 Profil
            </SidebarBtn>
          </>
        ) : (
          <>
            <button onClick={goHome} className="text-sm font-semibold text-violet-600 text-left mb-2 hover:opacity-70 transition-opacity">
              ← Predmeti
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-1 mt-2 mb-1">Lekcije</p>
            {lessons.map((l, i) => {
              const active = selectedLesson?.id === l.id;
              return (
                <button key={l.id} onClick={() => openLesson(l)}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                    active ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                    active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"
                  }`}>{i + 1}</span>
                  <span className="truncate">{l.title}</span>
                </button>
              );
            })}
          </>
        )}
      </aside>

      <main className="flex-1 min-w-0 px-8 py-6">
        <Topbar />

        {error && (view === "subjects" || view === "allSubjects") && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 max-w-4xl mx-auto">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {view === "subjects"      && mainPage === "profil"       && <ProfileView />}
        {view === "subjects"      && mainPage === "predmeti"     && <MySubjectsView />}
        {view === "allSubjects"                                   && <AllSubjectsView />}
        {view === "subjectDetail" && selectedSubject             && (
          <SubjectDetailPage
            subject={selectedSubject}
            lessons={lessons}
            selectedLesson={selectedLesson}
            loadingLesson={loadingLessons}
            onOpenLesson={openLesson}
            onBack={goHome}
          />
        )}
        {view === "lesson"                                        && <LessonView />}
      </main>
    </div>
  );
}

function SidebarBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active
          ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200"
          : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
      }`}
    >
      {children}
    </button>
  );
}