type Subject = {
  title: string;
  progress: number;
};

type Props = {
  selectedSubject: Subject | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
  mainPage: string;
  setMainPage: (page: string) => void;
  goHome: () => void;
};

const StudentSidebar = ({
  selectedSubject,
  activeSection,
  setActiveSection,
  mainPage,
  setMainPage,
  goHome,
}: Props) => {
  const subjectMenu = [
    { key: "pregled", label: "📌 Pregled" },
    { key: "prezentacije", label: "📚 Prezentacije" },
    { key: "gradivo", label: "📄 Dodatno gradivo" },
    { key: "vaje", label: "🧪 Vaje" },
    { key: "ucenje", label: "🧠 Pametno učenje" },
    { key: "kviz", label: "⭐ Kviz" },
    { key: "rezultati", label: "🏆 Rezultati" },
    { key: "profil", label: "👤 Profil" },
  ];

  return (
    <aside className="student-sidebar">
      <h1 className="student-logo" onClick={goHome}>
        <span>🎓</span> LearnSmart
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

          <div className="student-streak-card">
            <h3>🏆 Predmet</h3>

            <p>{selectedSubject.title}</p>

            <strong>{selectedSubject.progress}%</strong>

            <button className="student-back-bottom" onClick={goHome}>
              ← Nazaj na predmete
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default StudentSidebar;