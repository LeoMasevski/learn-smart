import { LayoutGrid, LogOut, Plus, X } from "lucide-react";
import type { Subject } from "../../types/professor";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../common/BrandLogo";

type Props = {
  selectedSubject: Subject | null;
  subjects: Subject[];
  goHome: () => void;
  onSelectSubject: (subject: Subject) => void;
  onCreateSubject: () => void;
  isOpen?: boolean;
  onClose?: () => void;
};

const ProfessorSidebar = ({
  selectedSubject,
  subjects,
  goHome,
  onSelectSubject,
  onCreateSubject,
  isOpen = true,
  onClose,
}: Props) => {
  const { logout } = useAuth();

  const handleHome = () => {
    goHome();
    onClose?.();
  };

  const handleSelect = (subject: Subject) => {
    onSelectSubject(subject);
    onClose?.();
  };

  const handleCreateSubject = () => {
    onCreateSubject();
    onClose?.();
  };

  const handleLogout = () => {
    if (window.confirm("Ali se res želiš odjaviti?")) {
      logout();
    }
  };

  const navButtonClass = (active: boolean) =>
    `w-full flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
      active
        ? "bg-violet-600 text-white"
        : "text-slate-700 hover:bg-violet-50 hover:text-violet-700"
    }`;

  const sidebarContent = (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col h-full px-4 py-8 gap-1">
      <div className="mb-6 flex items-center justify-between">
        <BrandLogo compact onClick={handleHome} />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="Zapri meni"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <button onClick={handleHome} className={navButtonClass(!selectedSubject)}>
          <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={2} />
          Vsi predmeti
        </button>

        {subjects.length > 0 && (
          <div className="mt-4">
            <p className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Predmeti
            </p>
            <div className="space-y-1">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSelect(subject)}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition truncate ${
                    selectedSubject?.id === subject.id
                      ? "bg-violet-600 text-white"
                      : "text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleCreateSubject}
          className="mt-4 w-full rounded-xl border border-dashed border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nov predmet
        </button>
      </nav>

      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-left text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
      >
        <LogOut className="w-4 h-4 shrink-0" strokeWidth={2.25} />
        Odjava
      </button>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default ProfessorSidebar;
