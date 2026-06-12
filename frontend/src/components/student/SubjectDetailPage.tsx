import { useState } from "react";
import type { StudentSubject, StudentLesson, SubjectQuizForStudent } from "../../types/student";
import StudentQuizList from "./StudentQuizList";
import { getSubjectIcon } from "../../utils/subjectIcons";

const LESSON_ICONS = ["📖", "🧠", "💡", "🔬", "📐", "🎯", "🗂️", "🧩"];

type Props = {
  subject: StudentSubject;
  lessons: StudentLesson[];
  selectedLesson: StudentLesson | null;
  loadingLesson: boolean;
  onOpenLesson: (lesson: StudentLesson) => void;
  onStartQuiz: (quiz: SubjectQuizForStudent) => void;
  onBack: () => void;
};

export default function SubjectDetailPage({
  subject,
  lessons,
  selectedLesson,
  loadingLesson,
  onOpenLesson,
  onStartQuiz,
  onBack,
}: Props) {
  const [tab, setTab] = useState<"lekcije" | "kvizi">("lekcije");
  const SubjectIcon = getSubjectIcon(subject.name);

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:opacity-70 transition-opacity mb-6"
      >
        ← Nazaj na predmete
      </button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-400 p-8 mb-6 shadow-lg shadow-violet-200 flex items-center gap-6">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <SubjectIcon className="w-8 h-8 text-white" strokeWidth={2.25} />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-white mb-1">{subject.name}</h1>
          <p className="text-violet-100 text-sm mb-3">{subject.description || "Brez opisa predmeta."}</p>
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1 w-fit mb-5">
        {(["lekcije", "kvizi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
              tab === t
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "lekcije" ? "📖 Lekcije" : "🧠 Kvizi"}
          </button>
        ))}
      </div>

      {/* Lekcije tab */}
      {tab === "lekcije" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-extrabold text-gray-900 mb-1">Lekcije</h2>
          <p className="text-gray-400 text-sm mb-5">Izberi lekcijo in začni z učenjem.</p>

          {loadingLesson && (
            <div className="flex items-center gap-3 py-6">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-violet-500 animate-spin shrink-0" />
              <p className="text-gray-400 text-sm">Nalagam lekcije...</p>
            </div>
          )}

          {!loadingLesson && lessons.length === 0 && (
            <div className="text-center py-10">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-gray-400 text-sm">Za ta predmet še ni lekcij.</p>
            </div>
          )}

          {!loadingLesson && lessons.length > 0 && (
            <div className="flex flex-col gap-2">
              {lessons.map((lesson, i) => {
                const active = selectedLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onOpenLesson(lesson)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-200 group ${
                      active
                        ? "bg-violet-50 border-violet-300 shadow-sm"
                        : "bg-gray-50 border-gray-100 hover:bg-violet-50 hover:border-violet-200 hover:-translate-y-px hover:shadow-md"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${
                      active ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-500 group-hover:bg-violet-200 group-hover:text-violet-700"
                    }`}>
                      {active ? "▶" : i + 1}
                    </span>
                    <span className="text-xl shrink-0">{LESSON_ICONS[i % LESSON_ICONS.length]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${active ? "text-violet-800" : "text-gray-800"}`}>{lesson.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {lesson.original_content.slice(0, 100).trim()}{lesson.original_content.length > 100 ? "…" : ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {active
                        ? <span className="text-xs font-extrabold bg-violet-600 text-white px-3 py-1 rounded-full">Odprto</span>
                        : <span className="text-gray-300 text-xl font-bold group-hover:text-violet-400 transition-colors">›</span>
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Kvizi tab */}
      {tab === "kvizi" && (
        <StudentQuizList subjectId={subject.id} onStartQuiz={onStartQuiz} />
      )}
    </div>
  );
}
