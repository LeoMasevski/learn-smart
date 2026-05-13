type ActiveTab = "vsebine" | "ocene" | "komentarji" | "analitika";

type Props = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
};

const ProfessorTabs = ({ activeTab, setActiveTab }: Props) => {
  return (
    <div className="professor-tabs">
      <span
        className={activeTab === "vsebine" ? "professor-active-tab" : ""}
        onClick={() => setActiveTab("vsebine")}
      >
        Vsebine
      </span>

      <span
        className={activeTab === "ocene" ? "professor-active-tab" : ""}
        onClick={() => setActiveTab("ocene")}
      >
        Ocene
      </span>

      <span
        className={activeTab === "komentarji" ? "professor-active-tab" : ""}
        onClick={() => setActiveTab("komentarji")}
      >
        Komentarji
      </span>

      <span
        className={activeTab === "analitika" ? "professor-active-tab" : ""}
        onClick={() => setActiveTab("analitika")}
      >
        Analitika
      </span>
    </div>
  );
};

export default ProfessorTabs;