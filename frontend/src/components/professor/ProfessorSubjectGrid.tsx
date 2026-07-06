import type { Subject } from "../../types/professor";
import { BookOpen } from "lucide-react";

type Props = {
  subjects: Subject[];
  onOpen: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
};

const ProfessorSubjectGrid = ({ subjects, onOpen, onEdit, onDelete }: Props) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="h-32 bg-violet-50 border-b border-violet-100 p-6 text-violet-700">
            <BookOpen className="h-8 w-8" strokeWidth={2.1} />
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900">
              {subject.name}
            </h2>

            <p className="text-slate-500 mt-2 min-h-12">
              {subject.description || "Brez opisa predmeta."}
            </p>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => onOpen(subject)}
                className="flex-1 bg-violet-600 text-white py-2 rounded-xl font-semibold"
              >
                Odpri
              </button>

              <button
                onClick={() => onEdit(subject)}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold"
              >
                Uredi
              </button>

              <button
                onClick={() => onDelete(subject.id)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold"
              >
                Briši
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProfessorSubjectGrid;
