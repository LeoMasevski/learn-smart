import type { Subject } from "../../types/professor";

type Props = {
  selectedSubject: Subject | null;
  goHome: () => void;
};

const ProfessorSidebar = ({ selectedSubject, goHome }: Props) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-6">
      <h1
        onClick={goHome}
        className="text-2xl font-bold text-violet-700 cursor-pointer mb-10"
      >
        🎓 LearnSmart
      </h1>

      <button
        onClick={goHome}
        className="w-full text-left bg-violet-50 text-violet-700 px-4 py-3 rounded-xl font-semibold"
      >
        ▦ Moji predmeti
      </button>

      {selectedSubject && (
        <div className="mt-5 bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-500">Aktiven predmet</p>
          <p className="font-semibold text-slate-900">
            {selectedSubject.name}
          </p>
        </div>
      )}
    </aside>
  );
};

export default ProfessorSidebar;