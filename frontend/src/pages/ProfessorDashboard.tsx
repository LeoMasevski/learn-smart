import { useState } from "react";
import "../styles/ProfessorDashboard.css";
import ProfessorAiBox from "../components/professor/ProfessorAiBox";

import ProfessorSidebar from "../components/professor/ProfessorSidebar";
import ProfessorSubjectCard from "../components/professor/ProfessorSubjectCard";
import ProfessorOverviewStrip from "../components/professor/ProfessorOverviewStrip";
import ProfessorTabs from "../components/professor/ProfessorTabs";

export type ProfessorSubject = {
  title: string;
  subtitle: string;
  students: number;
  presentations: number;
  quizzes: number;
  color: string;
};

type ActiveTab = "vsebine" | "ocene" | "komentarji" | "analitika";

const ProfessorDashboard = () => {
  const [selectedSubject, setSelectedSubject] =
    useState<ProfessorSubject | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("vsebine");
  const [uploadType, setUploadType] = useState<string | null>(null);

  const [studentName, setStudentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSent, setCommentSent] = useState(false);

  const subjects: ProfessorSubject[] = [
    {
      title: "Programiranje",
      subtitle: "React, komponente in frontend razvoj",
      students: 42,
      presentations: 6,
      quizzes: 4,
      color: "linear-gradient(135deg, #7c6cff, #a78bfa)",
    },
    {
      title: "Podatkovne baze",
      subtitle: "SQL, relacije in poizvedbe",
      students: 38,
      presentations: 8,
      quizzes: 5,
      color: "linear-gradient(135deg, #60a5fa, #a5b4fc)",
    },
    {
      title: "Spletni sistemi",
      subtitle: "Spletne aplikacije in arhitektura",
      students: 31,
      presentations: 5,
      quizzes: 3,
      color: "linear-gradient(135deg, #c084fc, #f0abfc)",
    },
  ];

  const goHome = () => {
    setSelectedSubject(null);
    setActiveTab("vsebine");
  };

  const sendComment = () => {
    if (!studentName.trim() || !commentText.trim()) {
      alert("Vnesi ime študenta in komentar.");
      return;
    }

    setCommentSent(true);
    setStudentName("");
    setCommentText("");

    setTimeout(() => {
      setCommentSent(false);
    }, 3000);
  };

  return (
    <div className="professor-page">
      <ProfessorSidebar
        selectedSubject={selectedSubject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        goHome={goHome}
      />

      <main className="professor-main">
        {!selectedSubject ? (
          <>
            <h1 className="professor-title">Profesor Dashboard</h1>
            <ProfessorOverviewStrip />

            <section className="professor-subject-grid">
              {subjects.map((subject) => (
                <ProfessorSubjectCard
                  key={subject.title}
                  subject={subject}
                  onOpen={setSelectedSubject}
                />
              ))}
            </section>
          </>
        ) : (
          <>
            <div className="professor-course-header">
              <div className="professor-course-info">
                <span>Aktiven predmet</span>
                <h1>{selectedSubject.title}</h1>
              </div>

              <ProfessorAiBox
               onGenerate={() => setUploadType("AI generiranje vsebine")}
              />
            </div>

            <ProfessorTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "vsebine" && (
              <section className="professor-content-grid professor-content-full">
                <div className="professor-large-card">
                  <h2>Objavljene vsebine</h2>

                  <details className="professor-accordion-item" open>
                    <summary>📚 Prezentacije</summary>
                    <div className="professor-upload-list">
                      {[
                        { title: "Predavanje 1 - Uvod", file: "uvod.pdf", size: "2.4 MB" },
                        { title: "Predavanje 2 - Primeri", file: "primeri.pdf", size: "3.1 MB" },
                        { title: "Predavanje 3 - Napredna snov", file: "napredno.pdf", size: "4.0 MB" },
                      ].map((item) => (
                        <div className="professor-upload-row" key={item.file}>
                          <div className="professor-file-icon">PDF</div>
                          <div>
                            <h3>{item.title}</h3>
                            <p>{item.file} · {item.size}</p>
                          </div>
                          <button onClick={() => setUploadType("prezentacijo")}>
                            Uredi
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>

                  <details className="professor-accordion-item">
                    <summary>📄 Dodatno gradivo</summary>
                    <div className="professor-material-list">
                      <div className="professor-material-row purple">
                        <div className="professor-material-icon">🔗</div>
                        <div>
                          <h3>React dokumentacija</h3>
                          <p>Uradna razlaga komponent in state-a.</p>
                        </div>
                        <button onClick={() => setUploadType("dodatno gradivo")}>
                          Uredi
                        </button>
                      </div>

                      <div className="professor-material-row blue">
                        <div className="professor-material-icon">📘</div>
                        <div>
                          <h3>Primeri spletnih sistemov</h3>
                          <p>Kratek članek za dodatno razumevanje arhitekture.</p>
                        </div>
                        <button onClick={() => setUploadType("dodatno gradivo")}>
                          Uredi
                        </button>
                      </div>
                    </div>
                  </details>

                  <details className="professor-accordion-item">
                    <summary>⭐ Kvizi</summary>
                    <div className="professor-material-list">
                      <div className="professor-material-row purple">
                        <div className="professor-material-icon">⭐</div>
                        <div>
                          <h3>Kviz: React osnove</h3>
                          <p>Kratek kviz za preverjanje razumevanja snovi.</p>
                        </div>
                        <button onClick={() => setUploadType("kviz")}>
                          Uredi
                        </button>
                      </div>
                    </div>
                  </details>

                  <details className="professor-accordion-item">
                    <summary>🧪 Vaje</summary>
                    <div className="professor-material-list">
                      <div className="professor-material-row purple">
                        <div className="professor-material-icon">🧩</div>
                        <div>
                          <h3>Vaja 1: Osnovni pojmi</h3>
                          <p>Kratek praktični primer za razumevanje snovi.</p>
                        </div>
                        <button onClick={() => setUploadType("vajo")}>
                          Uredi
                        </button>
                      </div>

                      <div className="professor-material-row blue">
                        <div className="professor-material-icon">📝</div>
                        <div>
                          <h3>Vaja 2: Praktična naloga</h3>
                          <p>Samostojna naloga z navodili in primerom rešitve.</p>
                        </div>
                        <button onClick={() => setUploadType("vajo")}>
                          Uredi
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              </section>
            )}

            {activeTab === "komentarji" && (
              <section className="professor-large-card">
                <h2>Komentarji za študente</h2>

                <div className="professor-comment-box">
                  <input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="npr. Ana Novak"
                  />

                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Napiši, kaj mora študent izboljšati..."
                  />

                  <button onClick={sendComment}>
                    {commentSent ? "Komentar poslan ✓" : "Pošlji komentar"}
                  </button>
                </div>
              </section>
            )}

            {activeTab === "ocene" && (
              <section className="professor-table-card">
                <h2>Ocene študentov</h2>
                <div className="professor-table">
                  <div className="professor-table-head">
                    <span>Študent</span>
                    <span>Kviz</span>
                    <span>Ocena</span>
                    <span>Točke</span>
                  </div>
                  <div className="professor-table-row">
                    <span>Ana Novak</span>
                    <span>React osnove</span>
                    <span>9</span>
                    <span>92%</span>
                  </div>
                  <div className="professor-table-row">
                    <span>Marko Horvat</span>
                    <span>React osnove</span>
                    <span>7</span>
                    <span>76%</span>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "analitika" && (
              <section className="professor-analytics">
                <div className="professor-stat-card">
                  <h3>Študenti</h3>
                  <h2>{selectedSubject.students}</h2>
                </div>
                <div className="professor-stat-card">
                  <h3>Prezentacije</h3>
                  <h2>{selectedSubject.presentations}</h2>
                </div>
                <div className="professor-stat-card">
                  <h3>Kvizi</h3>
                  <h2>{selectedSubject.quizzes}</h2>
                </div>
                <div className="professor-chart-card">
                  <h2>Najtežje teme</h2>
                  <div className="professor-bar-row">
                    <span>React Hooks</span>
                    <div>
                      <span style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="professor-bar-row">
                    <span>State management</span>
                    <div>
                      <span style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div className="professor-bar-row">
                    <span>Komponente</span>
                    <div>
                      <span style={{ width: "45%" }} />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {uploadType && (
        <div className="professor-modal-backdrop">
          <div className="professor-modal">
            <h2>Dodaj / uredi {uploadType}</h2>
            <p className="professor-muted">
              Tukaj profesor lahko naloži datoteko ali pripravi vsebino za
              študente.
            </p>

            <div className="professor-dropzone">
              <strong>Povleci datoteko sem</strong>
              <p>ali klikni za izbiro PDF, slike ali dokumenta.</p>
            </div>

            <div className="professor-modal-actions">
              <button onClick={() => setUploadType(null)}>Prekliči</button>
              <button onClick={() => setUploadType(null)}>Shrani</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;