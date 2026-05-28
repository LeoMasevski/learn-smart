import { useMemo, useState } from "react";
import "../styles/StudentDashboard.css";
import { useAuth } from "../context/AuthContext";

type Subject = {
  title: string;
  subtitle: string;
  progress: number;
  grade: number;
  color: string;
  icon: string;
};

type FilterType =
  | "vse"
  | "zakljuceni"
  | "nezakljuceni"
  | "najboljsi"
  | "najslabsi";

type SectionType =
  | "pregled"
  | "prezentacije"
  | "gradivo"
  | "vaje"
  | "ucenje"
  | "kviz"
  | "rezultati"
  | "profil";

type MainPageType = "predmeti" | "profil";

const StudentDashboard = () => {
  const { logout } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>("pregled");
  const [filter, setFilter] = useState<FilterType>("vse");
  const [mainPage, setMainPage] = useState<MainPageType>("predmeti");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const subjects: Subject[] = [
    {
      title: "Programiranje",
      subtitle: "React, komponente in frontend razvoj",
      progress: 72,
      grade: 8,
      color: "#6d4cff",
      icon: "💻",
    },
    {
      title: "Podatkovne baze",
      subtitle: "SQL, relacije in poizvedbe",
      progress: 100,
      grade: 9,
      color: "#9ca3af",
      icon: "🗄️",
    },
    {
      title: "Spletni sistemi",
      subtitle: "Spletne aplikacije in arhitektura",
      progress: 30,
      grade: 6,
      color: "#60a5fa",
      icon: "🌐",
    },
    {
      title: "UI/UX oblikovanje",
      subtitle: "Uporabniška izkušnja in dizajn",
      progress: 60,
      grade: 7,
      color: "#8b5cf6",
      icon: "🎨",
    },
  ];

  const filteredSubjects = useMemo(() => {
    let list = [...subjects];
    if (filter === "zakljuceni") list = list.filter((s) => s.progress === 100);
    if (filter === "nezakljuceni") list = list.filter((s) => s.progress < 100);
    if (filter === "najboljsi") list = list.sort((a, b) => b.grade - a.grade);
    if (filter === "najslabsi") list = list.sort((a, b) => a.grade - b.grade);
    return list;
  }, [filter]);

  const subjectMenu: { key: SectionType; label: string }[] = [
    { key: "pregled", label: "📌 Pregled" },
    { key: "prezentacije", label: "📚 Prezentacije" },
    { key: "gradivo", label: "📄 Dodatno gradivo" },
    { key: "vaje", label: "🧪 Vaje" },
    { key: "ucenje", label: "🧠 Pametno učenje" },
    { key: "kviz", label: "⭐ Kviz" },
    { key: "rezultati", label: "🏆 Rezultati" },
    { key: "profil", label: "👤 Profil" },
  ];

  const openSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveSection("pregled");
  };

  const goHome = () => {
    setSelectedSubject(null);
    setActiveSection("pregled");
    setMainPage("predmeti");
  };

  const renderTopbar = () => {
    return (
      <div className="student-topbar">
        <div></div>
        <div className="student-user-wrapper">
          <button
            className="student-user-avatar-only"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            KM
          </button>
          {showUserMenu && (
            <div className="student-user-menu">
              <strong>Kristina Maneva</strong>
              <p>Učni tip: Vizualni učenec</p>
              <p>Vpisna številka: 01234567</p>
              <button
                onClick={() => {
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

  const renderSubjectContent = () => {
    if (!selectedSubject) return null;

    if (activeSection === "pregled") {
      return (
        <>
          <div className="student-course-header compact">
            <div>
              <span className="student-small-label">Aktiven predmet</span>
              <h1>{selectedSubject.title}</h1>
              <p>{selectedSubject.subtitle}</p>
            </div>
            <div className="student-course-progress-card">
              <span>Napredek</span>
              <strong>{selectedSubject.progress}%</strong>
            </div>
          </div>
          <section className="student-section-card">
            <h1>Pregled učne vsebine</h1>
            <div className="student-accordion-list">
              <details className="student-accordion-item" open>
                <summary>📝 Tekstovna razlaga</summary>
                <div className="student-accordion-content">
                  <h3>Arhitektura spletne aplikacije</h3>
                  <p>
                    Spletna aplikacija je sestavljena iz frontend dela, backend
                    dela in podatkovne baze. Frontend skrbi za prikaz
                    uporabniškega vmesnika, backend obdeluje zahteve, podatkovna
                    baza pa hrani podatke.
                  </p>
                </div>
              </details>
              <details className="student-accordion-item">
                <summary>📊 Tabelarični prikaz</summary>
                <div className="student-accordion-content">
                  <table className="student-content-table">
                    <thead>
                      <tr>
                        <th>Komponenta</th>
                        <th>Vloga</th>
                        <th>Primer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Frontend</td>
                        <td>Prikaz vsebine uporabniku</td>
                        <td>React stran</td>
                      </tr>
                      <tr>
                        <td>Backend</td>
                        <td>Obdelava zahtevkov</td>
                        <td>Node.js API</td>
                      </tr>
                      <tr>
                        <td>Baza podatkov</td>
                        <td>Shranjevanje podatkov</td>
                        <td>PostgreSQL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
              <details className="student-accordion-item">
                <summary>🖼️ Vizualni prikaz</summary>
                <div className="student-accordion-content">
                  <div className="student-visual-flow">
                    <div>Frontend</div>
                    <span>→</span>
                    <div>Backend API</div>
                    <span>→</span>
                    <div>Baza podatkov</div>
                  </div>
                </div>
              </details>
              <details className="student-accordion-item">
                <summary>🎧 Auditivni viri</summary>
                <div className="student-accordion-content">
                  <div className="student-link-row">
                    <span>▶</span>
                    <div>
                      <h3>Razlaga MVC arhitekture</h3>
                      <p>YouTube povezava, ki jo profesor pregleda in objavi.</p>
                    </div>
                    <button>Odpri</button>
                  </div>
                </div>
              </details>
              <details className="student-accordion-item">
                <summary>🧩 Praktična naloga</summary>
                <div className="student-accordion-content">
                  <p>
                    Na podlagi obdelane prezentacije študent dobi praktično
                    nalogo, ki je povezana z lekcijo.
                  </p>
                  <p>
                    V tem primeru mora študent ustvariti enostavno React
                    komponento, ki prikaže naslov lekcije, kratek opis in gumb.
                  </p>
                </div>
              </details>
            </div>
          </section>
        </>
      );
    }

    if (activeSection === "prezentacije") {
      const presentations = [
        { title: "Predavanje 1 - Uvod", file: "uvod.pdf", size: "2.4 MB" },
        { title: "Predavanje 2 - Primeri", file: "primeri.pdf", size: "3.1 MB" },
        { title: "Predavanje 3 - Napredna snov", file: "napredno.pdf", size: "4.0 MB" },
      ];
      return (
        <section className="student-section-card">
          <h1>Prezentacije</h1>
          <p className="student-muted">
            Profesor naloži PDF prezentacije, študent pa jih lahko odpre ali prenese.
          </p>
          <div className="student-presentation-list">
            {presentations.map((item, index) => (
              <div className="student-presentation-row" key={index}>
                <div className="student-file-icon">PDF</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.file} · {item.size}</p>
                </div>
                <button onClick={() => alert(`Prenos datoteke: ${item.file}`)}>
                  ⬇ Prenesi
                </button>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeSection === "gradivo") {
      return (
        <section className="student-section-card small-card">
          <h1>Dodatno gradivo</h1>
          <p className="student-muted">
            Uporabni zunanji viri za dodatno branje in ponavljanje.
          </p>
          <div className="student-resource-list">
            <div className="student-resource-row purple">
              <span>🔗</span>
              <div>
                <h3>React dokumentacija</h3>
                <p>Uradna razlaga komponent in state-a.</p>
              </div>
              <button>Odpri</button>
            </div>
            <div className="student-resource-row blue">
              <span>📘</span>
              <div>
                <h3>Primeri spletnih sistemov</h3>
                <p>Kratek članek za dodatno razumevanje arhitekture.</p>
              </div>
              <button>Odpri</button>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "vaje") {
      return (
        <section className="student-section-card small-card">
          <h1>Vaje</h1>
          <p className="student-muted">
            Praktične naloge za utrjevanje snovi po izbranem predmetu.
          </p>
          <div className="student-resource-list">
            <div className="student-resource-row purple">
              <span>🧩</span>
              <div>
                <h3>Vaja 1: Osnovni pojmi</h3>
                <p>Kratek praktični primer za razumevanje snovi.</p>
              </div>
              <button>Odpri</button>
            </div>
            <div className="student-resource-row blue">
              <span>📝</span>
              <div>
                <h3>Vaja 2: Praktična naloga</h3>
                <p>Samostojna naloga z navodili in primerom rešitve.</p>
              </div>
              <button>Začni</button>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "ucenje") {
      return (
        <section className="student-section-card small-card">
          <h1>Pametno učenje</h1>
          <p className="student-muted">Prikaz vsebine glede na učni tip.</p>
          <div className="student-learning-soft">
            <div>
              <span>🖼️</span>
              <h3>Vizualno</h3>
            </div>
            <div>
              <span>🎧</span>
              <h3>Auditivno</h3>
            </div>
            <div>
              <span>🧩</span>
              <h3>Kinestetično</h3>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "kviz") {
      return (
        <section className="student-section-card">
          <h1>Kviz</h1>
          <p className="student-muted">
            Kviz je pripravljen za ta predmet in prilagojen učnemu tipu.
          </p>
          <div className="student-quiz-focus-card">
            <div>
              <span>⭐</span>
              <h2>Kviz za predmet: {selectedSubject.title}</h2>
              <p>
                Reši kviz in pridobi točke. Rezultat se shrani med rezultate
                predmeta.
              </p>
            </div>
            <button>Začni kviz</button>
          </div>
        </section>
      );
    }

    if (activeSection === "rezultati") {
      return (
        <section className="student-section-card">
          <h1>Rezultati</h1>
          <p className="student-muted">
            Pregled ocen, kvizov in doseženih točk pri predmetu.
          </p>
          <div className="student-score-hero">
            <div>
              <span>Skupni uspeh</span>
              <h2>86%</h2>
              <p>Odlično ti gre! Najboljši rezultat imaš pri projektu.</p>
            </div>
            <div className="student-score-badge">🏆</div>
          </div>
        </section>
      );
    }

    if (activeSection === "profil") {
      return (
        <section className="student-section-card small-card">
          <h1>Profil</h1>
          <p className="student-muted">Osnovni podatki študenta in učni tip.</p>
          <div className="student-profile-modern">
            <div className="student-avatar big">KM</div>
            <div>
              <h2>Kristina Maneva</h2>
              <p>Učni tip: <strong>Vizualni učenec</strong></p>
              <p>Aktiven predmet: <strong>{selectedSubject.title}</strong></p>
              <p>Napredek: <strong>{selectedSubject.progress}%</strong></p>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  const renderMainContent = () => {
    if (mainPage === "profil") {
      return (
        <section className="student-section-card small-card">
          <h1>Profil</h1>
          <p className="student-muted">Osnovni podatki študenta.</p>
          <div className="student-profile-modern">
            <div className="student-avatar big">KM</div>
            <div>
              <h2>Kristina Maneva</h2>
              <p>Učni tip: <strong>Vizualni učenec</strong></p>
              <p>Skupni napredek: <strong>65%</strong></p>
              <p>Število predmetov: <strong>4</strong></p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <>
        <h1 className="student-page-title">Moji predmeti</h1>
        <p className="student-subtitle">Izberi predmet in nadaljuj z učenjem.</p>
        <div className="student-hero-card">
          <div>
            <span>Dobrodošla nazaj 👋</span>
            <h2>Nadaljuj tam, kjer si končala</h2>
            <p>
              Najslabši rezultat imaš pri predmetu Spletni sistemi. Priporočeno
              je, da najprej ponoviš to vsebino.
            </p>
          </div>
          <button>Ponovi zdaj</button>
        </div>
        <div className="student-toolbar">
          <button
            className={filter === "vse" ? "student-filter-active" : ""}
            onClick={() => setFilter("vse")}
          >
            Vse
          </button>
          <button
            className={filter === "zakljuceni" ? "student-filter-active" : ""}
            onClick={() => setFilter("zakljuceni")}
          >
            Zaključeni
          </button>
          <button
            className={filter === "nezakljuceni" ? "student-filter-active" : ""}
            onClick={() => setFilter("nezakljuceni")}
          >
            Nezaključeni
          </button>
          <button
            className={filter === "najboljsi" ? "student-filter-active" : ""}
            onClick={() => setFilter("najboljsi")}
          >
            Najboljši uspeh
          </button>
          <button
            className={filter === "najslabsi" ? "student-filter-active" : ""}
            onClick={() => setFilter("najslabsi")}
          >
            Najslabši uspeh
          </button>
        </div>
        <section className="student-subject-grid">
          {filteredSubjects.map((subject, index) => (
            <div
              className="student-subject-card"
              key={index}
              onClick={() => openSubject(subject)}
            >
              <div
                className="student-subject-top"
                style={{ background: subject.color }}
              >
                <span className="student-card-icon">{subject.icon}</span>
                <span className="student-card-percent">{subject.progress}%</span>
              </div>
              <div className="student-subject-body">
                <h3>{subject.title}</h3>
                <p>{subject.subtitle}</p>
                <div className="student-progress-wrapper">
                  <div
                    className="student-progress-bar"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
                <div className="student-card-bottom">
                  <span>{subject.progress}% končano</span>
                  <strong>Ocena {subject.grade}</strong>
                </div>
                <button>Odpri predmet</button>
              </div>
            </div>
          ))}
        </section>
      </>
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
            {subjectMenu.map((item) => (
              <p
                key={item.key}
                className={
                  activeSection === item.key
                    ? "student-active-menu"
                    : "student-menu-item"
                }
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </p>
            ))}
          </>
        )}
      </aside>
      <main className="student-main">
        {renderTopbar()}
        {selectedSubject ? renderSubjectContent() : renderMainContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;