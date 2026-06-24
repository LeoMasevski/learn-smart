import { GraduationCap, LayoutGrid, Plus, X, LogOut } from "lucide-react";
import type { Subject } from "../../types/professor";
import { useAuth } from "../../context/AuthContext";

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
  const handleSelect = (subject: Subject) => {
    onSelectSubject(subject);
    onClose?.();
  };

  const { profile, logout } = useAuth();

  const handleHome = () => {
    goHome();
    onClose?.();
  };

  const handleLogout = () => {
    if (window.confirm("Ali se res želiš odjaviti?")) {
      logout();
    }
  };

  const sidebarContent = (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={handleHome}
          className="flex items-center gap-2 text-left group"
          aria-label="Pojdi na začetno stran"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shrink-0 group-hover:opacity-90 transition">
            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.25} />
          </span>
          <span>
            <span className="block text-lg font-extrabold bg-gradient-to-r from-violet-700 to-fuchsia-500 bg-clip-text text-transparent leading-tight">
              LearnSmart
            </span>
            <span className="block text-xs text-slate-400 font-medium leading-tight">Profesor</span>
          </span>
        </button>
        {/* Close button – only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Zapri meni"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Home */}
        <button
          onClick={handleHome}
          className={`w-full rounded-2xl px-4 py-3 text-left font-semibold text-sm transition mb-1 flex items-center gap-2 ${
            !selectedSubject
              ? "bg-violet-100 text-violet-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={2} />
          Vsi predmeti
        </button>

        {/* Subjects list */}
        {subjects.length > 0 && (
          <div className="mt-3">
            <p className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Predmeti
            </p>
            <div className="space-y-1">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSelect(subject)}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition truncate ${
                    selectedSubject?.id === subject.id
                      ? "bg-violet-500 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add subject */}
        <button
          onClick={() => { onCreateSubject(); onClose?.(); }}
          className="mt-4 w-full rounded-2xl border border-dashed border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-500 hover:bg-violet-50 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nov predmet
        </button>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100 space-y-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-400">Vloga</p>
          <p className="mt-0.5 text-sm font-bold text-slate-700 truncate">
            {profile?.full_name || "Upravljanje vsebin"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.25} />
          Odjava
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar – always visible on lg+ */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          {/* Panel */}
          <div className="relative">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default ProfessorSidebar;