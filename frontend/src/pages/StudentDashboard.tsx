import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";

import { api } from "../api/api.tsx";
import { useAuth } from "../context/AuthContext";
import LessonRenderer from "../components/lesson/LessonRenderer";
import SubjectDetailPage from "../components/student/SubjectDetailPage";
import StudentProgress from "./StudentProgress.tsx";

import StudentQuizRunner from "../components/student/StudentQuizRunner";
import SecuritySettings from "../components/auth/SecuritySettings";
import type { StudentSubject, StudentLesson, LessonVariant, SubjectQuizForStudent } from "../types/student";
import { getSubjectIcon } from "../utils/subjectIcons";
import {
  GraduationCap,
  BookOpen,
  Globe,
  BarChart3,
  User,
  Home,
  Inbox,
  Sparkles,
  Check,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  Headphones,
  PersonStanding,
  Menu,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";

type ViewType = "subjects" | "allSubjects" | "subjectDetail" | "lesson" | "quiz";
type MainPageType = "predmeti" | "vsi-predmeti" | "napredek" | "profil";
type LearningTypeKey = "VISUAL" | "AUDITORY" | "KINESTHETIC";

const SUBJECT_COLORS = ["#6d4cff", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

function getLearningTypeUI(lt: LearningTypeKey): { label: string; icon: LucideIcon; desc: string; color: string; bg: string; border: string } {
  if (lt === "VISUAL")   return { label: "Vizualni učenec",     icon: Eye,            desc: "Vsebina z diagrami, tabelami in barvnimi poudarki.", color: "#6c63ff", bg: "#f5f3ff", border: "#ddd6fe" };
  if (lt === "AUDITORY") return { label: "Slušni učenec",       icon: Headphones,     desc: "Narativne razlage in analogije brez slik.",           color: "#0ea5e9", bg: "#e0f2fe", border: "#bae6fd" };
  return                        { label: "Kinestetični učenec", icon: PersonStanding, desc: "Praktični primeri in primerjave iz življenja.",        color: "#10b981", bg: "#dcfce7", border: "#bbf7d0" };
}

export default function StudentDashboard() {
  const { profile, logout, refreshProfile } = useAuth();

  const [mySubjects, setMySubjects]       = useState<StudentSubject[]>([]);
  const [allSubjects, setAllSubjects]     = useState<StudentSubject[]>([]);
  const [enrollingId, setEnrollingId]     = useState<string | null>(null);

  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(null);
  const [lessons, setLessons]             = useState<StudentLesson[]>([]);
  const [selectedLesson, setSelectedLesson]   = useState<StudentLesson | null>(null);
  const [activeVariant, setActiveVariant] = useState<LessonVariant | null>(null);

  const [activeQuiz, setActiveQuiz] = useState<SubjectQuizForStudent | null>(null);
  const [view, setView]           = useState<ViewType>("subjects");
  const [mainPage, setMainPage]   = useState<MainPageType>("predmeti");
  const [showMenu, setShowMenu]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loadingMy,     setLoadingMy]     = useState(false);
  const [loadingAll,    setLoadingAll]    = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [error, setError]         = useState("");

  const [changingLT, setChangingLT] = useState(false);
  const [ltLoading,  setLtLoading]  = useState(false);
  const [ltError,    setLtError]    = useState("");
  const [ltSuccess,  setLtSuccess]  = useState("");

  useEffect(() => { fetchMySubjects(); }, []);

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
      await api.post(`/user-subjects/${subjectId}/enroll`);
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

  function openQuiz(quiz: SubjectQuizForStudent) {
    setActiveQuiz(quiz);
    setView("quiz");
    setError("");
  }

  function closeQuiz() {
    setActiveQuiz(null);
    setView("subjectDetail");
    setError("");
  }

  async function navigateLesson(dir: "prev" | "next") {
    if (!selectedLesson) return;
    const idx  = lessons.findIndex(l => l.id === selectedLesson.id);
    const next = dir === "next" ? idx + 1 : idx - 1;
    if (next >= 0 && next < lessons.length) await openLesson(lessons[next]);
  }

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
    return getLearningTypeUI(profile.learning_type).label;
  }

  async function updateLearningType(lt: LearningTypeKey) {
    try {
      setLtLoading(true); setLtError(""); setLtSuccess("");
      await api.patch("/users/learning-type", { learningType: lt.toLowerCase() });
      await refreshProfile();
      setLtSuccess("Učni tip uspešno posodobljen.");
      setChangingLT(false);
    } catch (e: any) {
      setLtError(e?.response?.data?.message || "Napaka pri posodobitvi učnega tipa.");
    } finally { setLtLoading(false); }
  }

  const isEnrolled = (id: string) => mySubjects.some(s => s.id === id);
  const lessonIdx  = selectedLesson ? lessons.findIndex(l => l.id === selectedLesson.id) : -1;
  const hasPrev    = lessonIdx > 0;
  const hasNext    = lessonIdx < lessons.length - 1;

  const Topbar = () => (
    <div className="flex justify-end items-center h-14 mb-2 relative">
      <button onClick={() => setShowMenu(!showMenu)}
        className="w-9 h-9 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center hover:bg-violet-700 transition-colors"
        aria-label="Uporabniški meni"
        aria-haspopup="true"
        aria-expanded={showMenu}
      >
        {getInitials()}
      </button>
      {showMenu && (
        <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
          <p className="font-bold text-gray-900 text-sm mb-0.5">{profile?.full_name}</p>
          <p className="text-gray-400 text-xs mb-4">Učni tip: {learningLabel()}</p>
          <button onClick={() => { setMainPage("profil"); setView("subjects"); setShowMenu(false); }}
            className="w-full flex items-center gap-2 text-sm font-semibold text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors mb-1"
          >
            <User className="w-4 h-4" strokeWidth={2.25} /> Profil
          </button>
          <button onClick={() => { if (window.confirm("Ali se res želiš odjaviti?")) { logout(); } setShowMenu(false); }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <LogOut className="w-4 h-4" strokeWidth={2.25} /> Odjava
          </button>
        </div>
      )}
    </div>
  );

  const MySubjectsView = () => {
    if (loadingMy) return <p className="text-sm text-gray-400 mt-4">Nalagam predmete...</p>;

    if (mySubjects.length === 0) return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" strokeWidth={1.75} />
          <h2 className="font-extrabold text-gray-900 text-lg mb-2">Nisi vpisan v noben predmet</h2>
          <p className="text-gray-400 text-sm mb-6">Oglej si vse razpoložljive predmete in se vpiši.</p>
          <button onClick={goToAllSubjects}
            className="bg-gradient-to-r from-violet-600 to-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-violet-200"
          >
            <Globe className="inline w-4 h-4 mr-1.5 -mt-0.5" strokeWidth={2.25} /> Oglej si vse predmete
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
            <p className="text-violet-200 text-sm font-semibold mb-1">Dobrodošel nazaj</p>
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
          {mySubjects.map((subject, i) => {
            const SubjectIcon = getSubjectIcon(subject.name, i);
            return (
            <div key={subject.id} onClick={() => openSubject(subject)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="h-24 flex items-center justify-between px-5"
                style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}>
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <SubjectIcon className="w-6 h-6 text-white" strokeWidth={2.25} />
                </div>
                <span className="text-xs font-extrabold text-white/80 bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" strokeWidth={2.25} /> AI</span>
              </div>
              <div className="p-5">
                <h3 className="font-extrabold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{subject.description || "Brez opisa."}</p>
                <button className="w-full bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 text-gray-700 hover:text-violet-700 text-sm font-bold py-2.5 rounded-xl transition-all">
                  Odpri predmet
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    );
  };


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
            <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" strokeWidth={1.75} />
            <p className="text-gray-400 text-sm">V bazi še ni predmetov.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allSubjects.map((subject, i) => {
              const enrolled  = isEnrolled(subject.id);
              const enrolling = enrollingId === subject.id;
              const SubjectIcon = getSubjectIcon(subject.name, i);

              return (
                <div key={subject.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-stretch"
                >
                  {/* Color strip */}
                  <div className="w-2 shrink-0" style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />

                  {/* Content */}
                  <div className="flex-1 p-5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] + "22" }}>
                      <SubjectIcon className="w-6 h-6" style={{ color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} strokeWidth={2.25} />
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
                          <Check className="w-4 h-4" strokeWidth={2.5} /> Vpisan
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
              Pojdi na moje predmete <ArrowRight className="inline w-3.5 h-3.5 ml-0.5 -mt-0.5" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const ProfileView = () => (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-5">
      {/* Osnovni podatki */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="font-extrabold text-gray-900 text-lg mb-1">Moj profil</h2>
        <p className="text-gray-400 text-sm mb-6">Osebni podatki in nastavitve.</p>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-extrabold flex items-center justify-center shrink-0">
            {getInitials()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">{profile?.full_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Vloga: <strong className="text-gray-700">Študent</strong></p>
            <p className="text-sm text-gray-500">Vpisani predmeti: <strong className="text-gray-700">{mySubjects.length}</strong></p>
          </div>
        </div>
      </div>

      {/* Učni tip */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg mb-1">Učni tip</h2>
            <p className="text-gray-400 text-sm">Določa kako se prikažejo lekcije.</p>
          </div>
          {!changingLT && (
            <button onClick={() => { setChangingLT(true); setLtError(""); setLtSuccess(""); }}
              className="text-sm font-bold text-violet-600 bg-violet-50 border border-violet-200 px-4 py-2 rounded-xl hover:bg-violet-100 transition-colors"
            >
              <Pencil className="inline w-3.5 h-3.5 mr-1 -mt-0.5" strokeWidth={2.25} /> Spremeni
            </button>
          )}
        </div>

        {ltSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2.25} /> {ltSuccess}</div>}
        {ltError   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.25} /> {ltError}</div>}

        {!changingLT && profile?.learning_type && (() => {
          const info = getLearningTypeUI(profile.learning_type!);
          return (
            <div className="flex items-center gap-4 p-5 rounded-2xl border" style={{ background: info.bg, borderColor: info.border }}>
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#ffffff80" }}>
                <info.icon className="w-7 h-7" style={{ color: info.color }} strokeWidth={2.25} />
              </span>
              <div>
                <strong style={{ color: info.color }} className="text-base">{info.label}</strong>
                <p className="text-gray-500 text-sm mt-1">{info.desc}</p>
              </div>
            </div>
          );
        })()}

        {!changingLT && !profile?.learning_type && (
          <div className="text-center py-6 text-gray-400">
            <HelpCircle className="w-9 h-9 mx-auto mb-2 text-gray-300" strokeWidth={1.75} />
            <p className="text-sm">Učni tip še ni določen. Reši vprašalnik ob registraciji ali ga nastavi spodaj.</p>
          </div>
        )}

        {changingLT && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Izberi nov učni tip:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["VISUAL", "AUDITORY", "KINESTHETIC"] as LearningTypeKey[]).map(key => {
                const info    = getLearningTypeUI(key);
                const current = profile?.learning_type === key;
                return (
                  <button key={key} onClick={() => updateLearningType(key)} disabled={ltLoading}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all ${
                      current ? "scale-[1.02] shadow-md" : "hover:-translate-y-0.5 hover:shadow-md"
                    } ${ltLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    style={{ borderColor: current ? info.color : "#e5e7eb", background: current ? info.bg : "white" }}
                  >
                    <info.icon className="w-8 h-8" style={{ color: info.color }} strokeWidth={2.25} />
                    <strong style={{ color: info.color }} className="text-sm">{info.label}</strong>
                    <small className="text-gray-400 text-xs leading-relaxed">{info.desc}</small>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setChangingLT(false)}
              className="mt-4 text-sm font-bold text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Prekliči
            </button>
          </div>
        )}
      </div>

      <SecuritySettings />

      {/* Hiter pregled + povezava na napredek */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="font-extrabold text-gray-900 text-lg mb-4">Hiter pregled</h2>
        <p className="text-gray-400 text-sm">
          Za podroben pregled rezultatov kvizov in napredka po predmetih pojdi na{" "}
          <button onClick={() => setMainPage("napredek")} className="text-violet-600 font-bold hover:underline">
            Moj napredek <ArrowRight className="inline w-3.5 h-3.5 ml-0.5 -mt-0.5" strokeWidth={2.5} />
          </button>
        </p>
      </div>
    </div>
  );

  const LessonView = () => (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-1.5 text-xs mb-2 flex-wrap">
        <button onClick={goHome} className="text-violet-600 font-semibold hover:underline hover:opacity-70 inline-flex items-center gap-1"><Home className="w-3.5 h-3.5" strokeWidth={2.25} /> Predmeti</button>
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
            <ArrowLeft className="inline w-4 h-4 mr-1 -mt-0.5" strokeWidth={2.25} /> Prejšnja lekcija
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
            Naslednja lekcija <ArrowRight className="inline w-4 h-4 ml-1 -mt-0.5" strokeWidth={2.25} />
          </button>
        </div>
      )}
    </div>
  );

  const inLesson = view === "subjectDetail" || view === "lesson";

  const sidebarContent = (
    <>
      <button onClick={() => { goHome(); setSidebarOpen(false); }} className="flex items-center gap-2 text-violet-600 font-extrabold text-lg mb-6 text-left hover:opacity-75 transition-opacity" aria-label="Pojdi na začetno stran">
        <GraduationCap className="w-5 h-5 shrink-0" strokeWidth={2.25} />
        LearnSmart
      </button>

      {!inLesson ? (
        <>
          <SidebarBtn active={mainPage === "predmeti"} onClick={() => { goHome(); setSidebarOpen(false); }}>
            <BookOpen className="w-4 h-4 shrink-0" strokeWidth={2.25} />
            Moji predmeti
            {mySubjects.length > 0 && (
              <span className="ml-auto bg-violet-100 text-violet-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {mySubjects.length}
              </span>
            )}
          </SidebarBtn>
          <SidebarBtn active={mainPage === "vsi-predmeti"} onClick={() => { goToAllSubjects(); setSidebarOpen(false); }}>
            <Globe className="w-4 h-4 shrink-0" strokeWidth={2.25} />
            Vsi predmeti
          </SidebarBtn>
          <div className="h-px bg-gray-100 my-1" />
          <SidebarBtn active={mainPage === "napredek"} onClick={() => { setView("subjects"); setMainPage("napredek"); setSidebarOpen(false); }}>
            <BarChart3 className="w-4 h-4 shrink-0" strokeWidth={2.25} />
            Moj napredek
          </SidebarBtn>
          <div className="h-px bg-gray-100 my-1" />
          <SidebarBtn active={mainPage === "profil"} onClick={() => { setView("subjects"); setMainPage("profil"); setSidebarOpen(false); }}>
            <User className="w-4 h-4 shrink-0" strokeWidth={2.25} />
            Profil
          </SidebarBtn>
        </>
      ) : (
        <>
          <button onClick={() => { goHome(); setSidebarOpen(false); }} className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 text-left mb-2 hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.25} /> Predmeti
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-1 mt-2 mb-1">Lekcije</p>
          {lessons.map((l, i) => {
            const active = selectedLesson?.id === l.id;
            return (
              <button key={l.id} onClick={() => { openLesson(l); setSidebarOpen(false); }}
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

      <div className="flex-1" />
      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={() => { if (window.confirm("Ali se res želiš odjaviti?")) logout(); }}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-left text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
      >
        <LogOut className="w-4 h-4 shrink-0" strokeWidth={2.25} />
        Odjava
      </button>
    </>
  );

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 min-h-screen bg-white border-r border-gray-100 flex-col px-4 py-8 gap-1">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-[80vw] min-h-screen bg-white flex flex-col px-4 py-6 gap-1 shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 mb-2"
              aria-label="Zapri meni"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition"
            aria-label="Odpri meni (predmeti, napredek, profil in odjava)"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>
          <span className="flex items-center gap-1.5 text-violet-600 font-extrabold text-base">
            <GraduationCap className="w-4 h-4" strokeWidth={2.25} />
            LearnSmart
          </span>
        </header>

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6">
        <Topbar />

        {error && (view === "subjects" || view === "allSubjects") && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 max-w-4xl mx-auto">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {view === "subjects"      && mainPage === "profil"       && <ProfileView />}
        {view === "subjects"      && mainPage === "napredek"     && <StudentProgress />}
        {view === "subjects"      && mainPage === "predmeti"     && <MySubjectsView />}
        {view === "allSubjects"                                   && <AllSubjectsView />}
        {view === "subjectDetail" && selectedSubject             && (
          <SubjectDetailPage
            subject={selectedSubject}
            lessons={lessons}
            selectedLesson={selectedLesson}
            loadingLesson={loadingLessons}
            onOpenLesson={openLesson}
            onStartQuiz={openQuiz}
            onBack={goHome}
          />
        )}
        {view === "lesson"                                        && <LessonView />}
        {view === "quiz" && activeQuiz && (
          <div className="max-w-2xl mx-auto w-full pt-2">
            <StudentQuizRunner quiz={activeQuiz} onBack={closeQuiz} />
          </div>
        )}
      </main>
      </div>
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
