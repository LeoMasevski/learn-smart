import type { Subject } from "../../types/professor";

type Props = {
  selectedSubject: Subject | null;
  subjects: Subject[];
  goHome: () => void;
  onSelectSubject: (subject: Subject) => void;
  onCreateSubject: () => void;
};

const ProfessorSidebar = ({
  selectedSubject,
  subjects,
  goHome,
  onSelectSubject,
  onCreateSubject,
}: Props) => {
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <h1
          onClick={goHome}
          className="cursor-pointer text-2xl font-extrabold bg-gradient-to-r from-violet-700 to-fuchsia-500 bg-clip-text text-transparent"
        >
          🎓 LearnSmart
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Profesor</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Home */}
        <button
          onClick={goHome}
          className={`w-full rounded-2xl px-4 py-3 text-left font-semibold text-sm transition mb-1 flex items-center gap-2 ${
            !selectedSubject
              ? "bg-violet-100 text-violet-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
          </svg>
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
                  onClick={() => onSelectSubject(subject)}
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
          onClick={onCreateSubject}
          className="mt-4 w-full rounded-2xl border border-dashed border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-500 hover:bg-violet-50 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nov predmet
        </button>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-400">Vloga</p>
          <p className="mt-0.5 text-sm font-bold text-slate-700">Upravljanje vsebin</p>
        </div>
      </div>
    </aside>
  );
};

export default ProfessorSidebar;
