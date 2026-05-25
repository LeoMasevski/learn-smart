import type { Subject } from "../../types/professor";

type Props = {
  selectedSubject: Subject | null;
  goHome: () => void;
};

const ProfessorSidebar = ({ selectedSubject, goHome }: Props) => {
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 p-6">
      <h1
        onClick={goHome}
        className="mb-10 cursor-pointer text-3xl font-extrabold bg-gradient-to-r from-violet-700 to-fuchsia-500 bg-clip-text text-transparent"
      >
        🎓 LearnSmart
      </h1>

      <nav className="space-y-4">
        <button
          onClick={goHome}
          className="w-full rounded-2xl bg-violet-50 px-5 py-4 text-left font-bold text-violet-700 hover:bg-violet-100 transition"
        >
          ▦ Moji predmeti
        </button>

        {selectedSubject && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 p-5 text-white shadow-lg">
            <p className="text-sm text-violet-100">Aktiven predmet</p>
            <h3 className="mt-1 font-bold">{selectedSubject.name}</h3>
          </div>
        )}

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">Profesor</p>
          <p className="mt-1 font-bold text-slate-900">Upravljanje vsebin</p>
        </div>
      </nav>
    </aside>
  );
};

export default ProfessorSidebar;