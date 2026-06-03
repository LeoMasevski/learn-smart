import type { StudentSubject, StudentLesson } from "../../types/student";

type Props = {
  subject: StudentSubject;
  lessons: StudentLesson[];
  selectedLesson: StudentLesson | null;
  loadingLesson: boolean;
  onOpenLesson: (lesson: StudentLesson) => void;
  onBack: () => void;
};

const LESSON_ICONS = ["📖", "🧠", "💡", "🔬", "📐", "🎯", "🗂️", "🧩"];

export default function SubjectDetailPage({
  subject,
  lessons,
  selectedLesson,
  loadingLesson,
  onOpenLesson,
  onBack,
}: Props) {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-violet-600 text-sm font-bold mb-5 hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        ← Nazaj na predmete
      </button>

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-400 rounded-2xl p-7 flex items-center gap-6 mb-6 shadow-lg shadow-violet-200">
        <div className="absolute -right-14 -top-14 w-52 h-52 bg-white/10 rounded-full" />
        <div className="absolute -right-4 bottom-0 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
          📚
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-white mb-1">{subject.name}</h1>
          <p className="text-violet-100 text-sm mb-3 max-w-lg">{subject.description || "Brez opisa predmeta."}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
              📝 {lessons.length} {lessons.length === 1 ? "lekcija" : lessons.length < 5 ? "lekcije" : "lekcij"}
            </span>
            <span className="bg-white/30 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
              ✨ AI personalizirano
            </span>
          </div>
        </div>
      </div>

      {/* Lesson list card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">Lekcije</h2>
          <p className="text-gray-400 text-sm mt-0.5">Izberi lekcijo in začni z učenjem.</p>
        </div>

        {/* Loading */}
        {loadingLesson && (
          <div className="flex items-center gap-3 py-5">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin flex-shrink-0" />
            <p className="text-gray-400 text-sm">Nalagam prilagojeno lekcijo...</p>
          </div>
        )}

        {/* Empty */}
        {!loadingLesson && lessons.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-gray-400 text-sm">Za ta predmet še ni dodanih lekcij.</p>
          </div>
        )}

        {/* Lesson items */}
        {lessons.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {lessons.map((lesson, index) => {
              const isActive = selectedLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => onOpenLesson(lesson)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-300 shadow-sm"
                      : "bg-gray-50 border-gray-100 hover:bg-violet-50 hover:border-violet-200 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  {/* Number */}
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-colors ${
                    isActive ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-500 group-hover:bg-violet-200 group-hover:text-violet-700"
                  }`}>
                    {isActive ? "▶" : index + 1}
                  </span>

                  {/* Icon */}
                  <span className="text-xl flex-shrink-0">{LESSON_ICONS[index % LESSON_ICONS.length]}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold truncate ${isActive ? "text-violet-800" : "text-gray-800"}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {lesson.original_content.slice(0, 110).trim()}
                      {lesson.original_content.length > 110 ? "…" : ""}
                    </p>
                  </div>

                  {/* Right side */}
                  <div className="flex-shrink-0">
                    {isActive ? (
                      <span className="text-xs font-extrabold bg-violet-600 text-white px-3 py-1 rounded-full">
                        Odprto
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xl font-bold group-hover:text-violet-400 transition-colors">›</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}