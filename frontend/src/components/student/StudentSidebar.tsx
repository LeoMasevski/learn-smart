import {
  ArrowLeft,
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  FlaskConical,
  Home,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";

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

type MenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

const StudentSidebar = ({
  selectedSubject,
  activeSection,
  setActiveSection,
  mainPage,
  setMainPage,
  goHome,
}: Props) => {
  const subjectMenu: MenuItem[] = [
    { key: "pregled", label: "Pregled", icon: ClipboardList },
    { key: "prezentacije", label: "Prezentacije", icon: BookOpen },
    { key: "gradivo", label: "Dodatno gradivo", icon: FileText },
    { key: "vaje", label: "Vaje", icon: FlaskConical },
    { key: "ucenje", label: "Pametno učenje", icon: Brain },
    { key: "kviz", label: "Kviz", icon: ClipboardList },
    { key: "rezultati", label: "Rezultati", icon: Trophy },
    { key: "profil", label: "Profil", icon: User },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    return (
      <p
        key={item.key}
        className={activeSection === item.key ? "student-active-menu" : "student-menu-item"}
        onClick={() => setActiveSection(item.key)}
      >
        <Icon size={16} strokeWidth={2.25} />
        {item.label}
      </p>
    );
  };

  return (
    <aside className="student-sidebar">
      <BrandLogo compact onClick={goHome} className="student-logo" />

      {!selectedSubject ? (
        <>
          <p
            className={mainPage === "predmeti" ? "student-active-menu" : "student-menu-item"}
            onClick={() => setMainPage("predmeti")}
          >
            <Home size={16} strokeWidth={2.25} />
            Moji predmeti
          </p>

          <div className="student-sidebar-divider" />

          <p
            className={mainPage === "profil" ? "student-active-menu" : "student-menu-item"}
            onClick={() => setMainPage("profil")}
          >
            <User size={16} strokeWidth={2.25} />
            Profil
          </p>
        </>
      ) : (
        <>
          <div className="student-sidebar-divider" />

          {subjectMenu.map(renderMenuItem)}

          <div className="student-streak-card">
            <h3 className="inline-flex items-center gap-2">
              <Trophy size={17} strokeWidth={2.25} />
              Predmet
            </h3>

            <p>{selectedSubject.title}</p>

            <strong>{selectedSubject.progress}%</strong>

            <button className="student-back-bottom" onClick={goHome}>
              <ArrowLeft size={16} strokeWidth={2.25} />
              Nazaj na predmete
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default StudentSidebar;
