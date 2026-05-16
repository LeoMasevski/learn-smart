import type { Subject } from "../../types/professor";

type Props = {
  subject: Subject;
  onOpen: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
};

const ProfessorSubjectCard = ({
  subject,
  onOpen,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="h-32 bg-gradient-to-br from-violet-500 to-indigo-400 p-6 text-white">
        <div className="text-4xl">📘</div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {subject.name}
        </h2>

        <p className="mt-2 text-slate-500 min-h-12">
          {subject.description || "Brez opisa predmeta."}
        </p>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onOpen(subject)}
            className="flex-1 bg-violet-600 text-white py-2 rounded-xl font-semibold hover:bg-violet-700"
          >
            Odpri
          </button>

          <button
            onClick={() => onEdit(subject)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200"
          >
            Uredi
          </button>

          <button
            onClick={() => onDelete(subject.id)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-100"
          >
            Briši
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorSubjectCard;