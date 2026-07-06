import type { Subject } from "../../types/professor";
import { getSubjectIcon } from "../../utils/subjectIcons";
import { BookOpen, Sparkles } from "lucide-react";

type Props = {
  subject: Subject;
  onOpen: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
};

const ProfessorSubjectCard = ({ subject, onOpen, onEdit, onDelete }: Props) => {
  const SubjectIcon = getSubjectIcon(subject.name);

  return (
    <div className="group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative h-32 bg-violet-50 border-b border-violet-100 p-6">
        <div className="absolute top-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-violet-100">
          <SubjectIcon className="w-7 h-7 text-violet-700" strokeWidth={2.25} />
        </div>

        <div className="absolute bottom-5 right-5 rounded-full bg-white border border-violet-100 px-4 py-1 text-sm font-semibold text-violet-700">
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
            <BookOpen className="mr-1 inline h-3.5 w-3.5" strokeWidth={2.1} /> Gradivo
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 font-semibold">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" strokeWidth={2.1} /> AI
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
