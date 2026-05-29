import { useEffect, useState } from "react";
import "../styles/StudentDashboard.css";

import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import LessonRenderer from "../components/lesson/LessonRenderer";

import type {
  StudentSubject,
  StudentLesson,
  LessonVariant,
} from "../types/student";

type FilterType =
  | "vse"
  | "zakljuceni"
  | "nezakljuceni"
  | "najboljsi"
  | "najslabsi";

type MainPageType = "predmeti" | "profil";

const StudentDashboard = () => {
  const { profile, logout } = useAuth();

  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<StudentSubject | null>(
    null
  );

  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<StudentLesson | null>(
    null
  );

  const [activeVariant, setActiveVariant] = useState<LessonVariant | null>(
    null
  );

  const [filter, setFilter] = useState<FilterType>("vse");
  const [mainPage, setMainPage] = useState<MainPageType>("predmeti");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMySubjects();
  }, []);

  async function fetchMySubjects() {
    try {
      setLoadingSubjects(true);
      setError("");

      const res = await api.get("/user-subjects/my-subjects");
      setSubjects(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Napaka pri nalaganju vpisanih predmetov."
      );
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function openSubject(subject: StudentSubject) {
    if (!profile?.learning_type) {
      setError("Najprej moraš rešiti kviz učnega tipa.");
      return;
    }

    try {
      setSelectedSubject(subject);
      setSelectedLesson(null);
      setActiveVariant(null);
      setLoadingLesson(true);
      setError("");

      const lessonsRes = await api.get(`/lessons/subject/${subject.id}`);
      const subjectLessons: StudentLesson[] = lessonsRes.data;

      setLessons(subjectLessons);

      if (subjectLessons.length === 0) {
        setError("Za ta predmet še ni dodanih lekcij.");
        return;
      }

      const firstLesson = subjectLessons[0];
      setSelectedLesson(firstLesson);

      const variantRes = await api.get(
        `/lessons/${firstLesson.id}/variant/${profile.learning_type}`
      );

      setActiveVariant(variantRes.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Napaka pri nalaganju prilagojene lekcije."
      );
    } finally {
      setLoadingLesson(false);
    }
  }

  async function openLesson(lesson: StudentLesson) {
    if (!profile?.learning_type) {
      setError("Najprej moraš rešiti kviz učnega tipa.");
      return;
    }

    try {
      setSelectedLesson(lesson);
      setActiveVariant(null);
      setLoadingLesson(true);
      setError("");

      const res = await api.get(
        `/lessons/${lesson.id}/variant/${profile.learning_type}`
      );

      setActiveVariant(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Napaka pri nalaganju prilagojene lekcije."
      );
    } finally {
      setLoadingLesson(false);
    }
  }

  function goHome() {
    setSelectedSubject(null);
    setSelectedLesson(null);
    setActiveVariant(null);
    setMainPage("predmeti");
    setError("");
  }

  function getLearningTypeLabel() {
    if (!profile?.learning_type) return "Ni določen";

    const labels = {
      VISUAL: "Vizualni učenec",
      AUDITORY: "Slušni učenec",
      KINESTHETIC: "Kinestetični učenec",
    };

    return labels[profile.learning_type];
  }

  function getInitials() {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const renderTopbar = () => {
    return (
      <div className="student-topbar">
        <div></div>
        <div className="student-user-wrapper">
          <button
            className="student-user-avatar-only"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {getInitials()}
          </button>
          {showUserMenu && (
            <div className="student-user-menu">
              <strong>{profile?.full_name}</strong>
              <p>Učni tip: {getLearningTypeLabel()}</p>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                  logout();
                }}
              >
                Odjava
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSubjects = () => {
    if (loadingSubjects) {
      return <p className="student-muted">Nalagam predmete...</p>;
    }

    if (subjects.length === 0) {
      return (
        <section className="student-section-card small-card">
          <h1>Moji predmeti</h1>
          <p className="student-muted">
            Trenutno nisi vpisan v noben predmet.
          </p>
        </section>
      );
    }

    return (
      <>
        <h1 className="student-page-title">Moji predmeti</h1>
        <p className="student-subtitle">
          Izberi predmet in nadaljuj s prilagojenim učenjem.
        </p>

        <div className="student-hero-card">
          <div>
            <span>Dobrodošel nazaj 👋</span>
            <h2>Nadaljuj z učenjem</h2>
            <p>
              Tvoje lekcije se prikažejo glede na tvoj učni tip:{" "}
              <strong>{getLearningTypeLabel()}</strong>.
            </p>
          </div>

          <button
            onClick={() => {
              if (subjects[0]) openSubject(subjects[0]);
            }}
          >
            Začni zdaj
          </button>
        </div>
        <div className="student-toolbar">
          <button
            className={filter === "vse" ? "student-filter-active" : ""}
            onClick={() => setFilter("vse")}
          >
            Vse
          </button>
        </div>
        <section className="student-subject-grid">
          {subjects.map((subject, index) => {
            const colors = ["#6d4cff", "#60a5fa", "#8b5cf6", "#10b981"];
            const icons = ["📘", "💻", "🧠", "🎨"];

            return (
              <div
                className="student-subject-card"
                key={subject.id}
                onClick={() => openSubject(subject)}
              >
                <div
                  className="student-subject-top"
                  style={{ background: colors[index % colors.length] }}
                >
                  <span className="student-card-icon">
                    {icons[index % icons.length]}
                  </span>

                  <span className="student-card-percent">AI</span>
                </div>

                <div className="student-subject-body">
                  <h3>{subject.name}</h3>
                  <p>{subject.description || "Brez opisa predmeta."}</p>

                  <div className="student-progress-wrapper">
                    <div
                      className="student-progress-bar"
                      style={{ width: "0%" }}
                    />
                  </div>

                  <div className="student-card-bottom">
                    <span>Prilagojeno učenje</span>
                    <strong>{getLearningTypeLabel()}</strong>
                  </div>

                  <button>Odpri predmet</button>
                </div>
              </div>
            );
          })}
        </section>
      </>
    );
  };

  const renderSelectedSubject = () => {
    if (!selectedSubject) return null;

    return (
      <>
        <div className="student-course-header compact">
          <div>
            <span className="student-small-label">Aktiven predmet</span>
            <h1>{selectedSubject.name}</h1>
            <p>{selectedSubject.description || "Brez opisa predmeta."}</p>
          </div>

          <div className="student-course-progress-card">
            <span>Učni tip</span>
            <strong>{profile?.learning_type || "-"}</strong>
          </div>
        </div>

        {error && (
          <div className="student-section-card small-card">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {loadingLesson && (
          <section className="student-section-card">
            <p className="student-muted">Nalagam prilagojeno lekcijo...</p>
          </section>
        )}

        {!loadingLesson && lessons.length > 0 && (
          <section className="student-section-card small-card">
            <h1>Lekcije</h1>
            <p className="student-muted">
              Za zdaj se samodejno prikaže prva lekcija. Spodaj lahko ročno
              preklopiš med lekcijami.
            </p>

            <div className="student-resource-list">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`student-resource-row ${
                    selectedLesson?.id === lesson.id ? "purple" : "blue"
                  }`}
                >
                  <span>🧠</span>

                  <div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.original_content.slice(0, 120)}...</p>
                  </div>

                  <button onClick={() => openLesson(lesson)}>Odpri</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loadingLesson && activeVariant && selectedLesson && (
          <section className="student-section-card">
            <LessonRenderer
              lesson={{
                lessonTitle: selectedLesson.title,
                learningType: activeVariant.learning_type,
                blocks: activeVariant.content_blocks,
              }}
            />
          </section>
        )}
      </>
    );
  };

  const renderProfile = () => {
    return (
      <section className="student-section-card small-card">
        <h1>Profil</h1>
        <p className="student-muted">Osnovni podatki študenta.</p>

        <div className="student-profile-modern">
          <div className="student-avatar big">{getInitials()}</div>

          <div>
            <h2>{profile?.full_name}</h2>
            <p>
              Učni tip: <strong>{getLearningTypeLabel()}</strong>
            </p>
            <p>
              Število predmetov: <strong>{subjects.length}</strong>
            </p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="student-dashboard-page">
      <aside className="student-sidebar">
        <h1 className="student-logo" onClick={goHome}>
          🎓 LearnSmart
        </h1>
        {!selectedSubject ? (
          <>
            <p
              className={
                mainPage === "predmeti"
                  ? "student-active-menu"
                  : "student-menu-item"
              }
              onClick={() => setMainPage("predmeti")}
            >
              ▦ Moji predmeti
            </p>
            <div className="student-sidebar-divider"></div>
            <p
              className={
                mainPage === "profil"
                  ? "student-active-menu"
                  : "student-menu-item"
              }
              onClick={() => setMainPage("profil")}
            >
              👤 Profil
            </p>
          </>
        ) : (
          <>
            <button className="student-back-menu" onClick={goHome}>
              ← Nazaj na predmete
            </button>
            <div className="student-sidebar-divider"></div>

            <p className="student-active-menu">🧠 Pametno učenje</p>
          </>
        )}
      </aside>
      <main className="student-main">
        {renderTopbar()}

        {error && !selectedSubject && (
          <div className="student-section-card small-card">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {selectedSubject
          ? renderSelectedSubject()
          : mainPage === "profil"
          ? renderProfile()
          : renderSubjects()}
      </main>
    </div>
  );
};

export default StudentDashboard;