import type { Subject } from "../../types/professor";

type Props = {
  subject: Subject;
  onOpen: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
};

const ProfessorSubjectCard = ({ subject, onOpen, onEdit, onDelete }: Props) => {
  return (
    <div className="group overflow-hidden rounded-[28px] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-36 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-400 p-6">
        <div className="absolute top-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md shadow">
          📘
        </div>

        <div className="absolute bottom-5 right-5 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white backdrop-blur-md">
          Predmet
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-violet-700 transition">
          {subject.name}
        </h2>

        <p className="mt-2 min-h-12 text-slate-500">
          {subject.description || "Brez opisa predmeta."}
        </p>

        <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700 font-semibold">
            📚 Gradivo
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 font-semibold">
            ✨ AI
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(subject);
            }}
            className="rounded-xl bg-violet-600 py-3 text-white font-bold hover:bg-violet-700 transition"
          >
            Odpri
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(subject);
            }}
            className="rounded-xl bg-slate-100 py-3 text-slate-700 font-bold hover:bg-slate-200 transition"
          >
            Uredi
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subject.id);
            }}
            className="rounded-xl bg-rose-50 py-3 text-rose-600 font-bold hover:bg-rose-100 transition"
          >
            Briši
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorSubjectCard;