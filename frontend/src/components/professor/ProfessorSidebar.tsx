import type { ProfessorSubject } from "../../pages/ProfessorDashboard";

type ActiveTab = "vsebine" | "ocene" | "komentarji" | "analitika";

type Props = {
  selectedSubject: ProfessorSubject | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  goHome: () => void;
};

const ProfessorSidebar = ({
  selectedSubject,
  activeTab,
  setActiveTab,
  goHome,
}: Props) => {
  return (
    <aside className="professor-sidebar">
      <h1 className="professor-logo" onClick={goHome}>
        🎓 LearnSmart
      </h1>

      {!selectedSubject ? (
        <>
          <p className="professor-active-menu">▦ Moji predmeti</p>
          <div className="professor-sidebar-divider"></div>
          <p className="professor-menu-item">👤 Profil</p>
        </>
      ) : (
        <>
        <p
  className="professor-back-text"
  onClick={goHome}
>
  ← Nazaj na predmete
</p>
<div className="professor-sidebar-divider"></div>

          <p
            className={
              activeTab === "vsebine"
                ? "professor-active-menu"
                : "professor-menu-item"
            }
            onClick={() => setActiveTab("vsebine")}
          >
            📚 Vsebine
          </p>

          <p
            className={
              activeTab === "ocene"
                ? "professor-active-menu"
                : "professor-menu-item"
            }
            onClick={() => setActiveTab("ocene")}
          >
            📊 Ocene
          </p>

          <p
            className={
              activeTab === "komentarji"
                ? "professor-active-menu"
                : "professor-menu-item"
            }
            onClick={() => setActiveTab("komentarji")}
          >
            💬 Komentarji
          </p>

          <p
            className={
              activeTab === "analitika"
                ? "professor-active-menu"
                : "professor-menu-item"
            }
            onClick={() => setActiveTab("analitika")}
          >
            📈 Analitika
          </p>
        </>
      )}
    </aside>
  );
};

export default ProfessorSidebar;