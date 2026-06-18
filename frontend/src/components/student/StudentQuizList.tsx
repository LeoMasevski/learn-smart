import { useEffect, useState } from "react";
import { api } from "../../api/api";
import type { SubjectQuizForStudent, QuizAttempt } from "../../types/student";
import StudentQuizResults from "./StudentQuizResults";

type Props = {
  subjectId: string;
  onStartQuiz: (quiz: SubjectQuizForStudent) => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const QTYPE_LABELS = {
  multiple_choice: "Večkratni izbor",
  true_false: "Res / Ni res",
  mixed: "Kombinirano",
};

function QuizCard({
  quiz,
  onStart,
}: {
  quiz: SubjectQuizForStudent;
  onStart: () => void;
}) {
  const [attempt, setAttempt] = useState<QuizAttempt | null | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    api
      .get(`/quiz-attempts/quiz/${quiz.id}/my`)
      .then((res) => setAttempt(res.data))
      .catch(() => setAttempt(null));
  }, [quiz.id]);

  const score = attempt?.score ?? null;
  const scoreColor =
    score === null ? ""
    : score >= 80 ? "text-emerald-600"
    : score >= 50 ? "text-amber-600"
    : "text-rose-600";

  const hasAttempt = attempt?.status === "completed";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl shrink-0">
          🧠
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 text-base mb-1 truncate">{quiz.title}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">
              ❓ {quiz.question_count} vprašanj
            </span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">
              ⏱ {quiz.time_limit_minutes} min
            </span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">
              {QTYPE_LABELS[quiz.question_type]}
            </span>
          </div>

          {/* Previous attempt */}
          {attempt === undefined ? (
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          ) : hasAttempt ? (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-extrabold ${scoreColor}`}>
                {score}% — {attempt.correct_count}/{attempt.total_count} pravilnih
              </span>
              {attempt.time_taken_seconds != null && (
                <span className="text-xs text-gray-400">⏱ {formatTime(attempt.time_taken_seconds)}</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Še nisi rešil tega kviza.</p>
          )}
        </div>

        {/* Action */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onStart}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              hasAttempt
                ? "bg-gray-100 hover:bg-violet-50 text-gray-600 hover:text-violet-700 border border-gray-200"
                : "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-200 hover:shadow-lg hover:-translate-y-px"
            }`}
          >
            {hasAttempt ? "Ponovi" : "Začni"}
          </button>
          {hasAttempt && (
            <button
              onClick={() => setShowResults(true)}
              className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 border border-violet-100 transition-all"
            >
              Rezultati
            </button>
          )}
        </div>
      </div>

      {/* Score bar if attempted */}
      {hasAttempt && score !== null && (
        <div className="px-5 pb-4">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                score >= 80 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-rose-400"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {showResults && (
        <StudentQuizResults
          quizId={quiz.id}
          quizTitle={quiz.title}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

const StudentQuizList = ({ subjectId, onStartQuiz }: Props) => {
  const [quizzes, setQuizzes] = useState<SubjectQuizForStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/subject-quizzes/subject/${subjectId}`)
      .then((res) => {
        const ready = (res.data as SubjectQuizForStudent[]).filter((q) => q.status === "ready");
        setQuizzes(ready);
      })
      .catch(() => setError("Napaka pri nalaganju kvizov."))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-50 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-rose-500 text-sm font-medium py-4">{error}</p>;
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-14">
        <span className="text-4xl block mb-3">🧠</span>
        <p className="text-gray-500 font-semibold mb-1">Za ta predmet ni kvizov</p>
        <p className="text-gray-400 text-sm">Profesor še ni ustvaril kvizov.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onStart={() => onStartQuiz(quiz)}
        />
      ))}
    </div>
  );
};

export default StudentQuizList;
