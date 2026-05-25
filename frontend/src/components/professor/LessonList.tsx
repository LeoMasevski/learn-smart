import type { Lesson } from "../../types/professor";

type Props = {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  onPreview: (lesson: Lesson) => void;
};

const LessonList = ({ lessons, onEdit, onDelete, onPreview }: Props) => {
  if (lessons.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
        Za ta predmet še ni učnega gradiva.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {lesson.title}
              </h2>

              <p className="mt-2 text-slate-600 whitespace-pre-line line-clamp-3">
                {lesson.original_content}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onPreview(lesson)}
                className="bg-violet-50 text-violet-700 px-4 py-2 rounded-xl font-semibold hover:bg-violet-100 transition"
              >
                Predogled
              </button>

              <button
                onClick={() => onEdit(lesson)}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition"
              >
                Uredi
              </button>

              <button
                onClick={() => onDelete(lesson.id)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-100 transition"
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

export default LessonList;