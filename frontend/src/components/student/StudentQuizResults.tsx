import { useEffect, useState } from "react";
import { api } from "../../api/api";
import type { QuizAttempt, QuizAttemptAnswer, SubjectQuizForStudent } from "../../types/student";
import { Award, BookOpen, Check, Lightbulb, Target, TrendingUp, X } from "lucide-react";

type Props = {
  quizId: string;
  quizTitle: string;
  onClose: () => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-extrabold text-slate-900" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

const StudentQuizResults = ({ quizId, quizTitle, onClose }: Props) => {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<(SubjectQuizForStudent & { quiz_questions?: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/quiz-attempts/quiz/${quizId}/review`)
      .then((res) => {
        setAttempt(res.data.attempt);
        setQuiz(res.data.quiz);
      })
      .catch(() => setError("Napaka pri nalaganju rezultatov."))
      .finally(() => setLoading(false));
  }, [quizId]);

  const score = attempt?.score ?? 0;
  const correct = attempt?.correct_count ?? 0;
  const total = attempt?.total_count ?? 0;
  const timeTaken = attempt?.time_taken_seconds ?? 0;

  const answerMap: Record<string, QuizAttemptAnswer> = {};
  for (const a of attempt?.quiz_attempt_answers ?? []) answerMap[a.question_id] = a;

  const questions = (quiz?.quiz_questions ?? []).slice().sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  const feedback =
    score >= 90 ? { icon: Award, label: "Odlično!", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" } :
    score >= 70 ? { icon: Target, label: "Dobro!", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" } :
    score >= 50 ? { icon: BookOpen, label: "Solidno, še malo!", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" } :
                 { icon: TrendingUp, label: "Poskusi znova!", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
  const FeedbackIcon = feedback.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Rezultati kviza</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5 truncate max-w-xs">{quizTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 p-4">
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-50 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-rose-500 font-medium text-sm py-4">{error}</p>}

          {!loading && !error && attempt && (
            <>
              {/* Score card */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feedback.bg} ${feedback.border}`}>
                  <FeedbackIcon className={`h-6 w-6 ${feedback.color}`} strokeWidth={2.1} />
                </span>
                <h3 className={`text-xl font-extrabold ${feedback.color}`}>{feedback.label}</h3>
                <ScoreRing score={score} />
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{correct}/{total}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pravilnih</p>
                  </div>
                  <div className="w-px bg-slate-100" />
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{formatTime(timeTaken)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Čas</p>
                  </div>
                  {quiz?.time_limit_minutes != null && (
                    <>
                      <div className="w-px bg-slate-100" />
                      <div>
                        <p className="text-xl font-extrabold text-slate-900">{quiz.time_limit_minutes} min</p>
                        <p className="text-xs text-slate-400 mt-0.5">Omejitev</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Per-question review */}
              <h3 className="text-base font-bold text-slate-900 mb-3">Pregled odgovorov</h3>
              <div className="space-y-3">
                {questions.map((q: any, idx: number) => {
                  const ans = answerMap[q.id];
                  const isCorrect = ans?.is_correct;
                  const wasAnswered = !!ans;
                  return (
                    <div key={q.id} className={`rounded-2xl border p-4 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                        }`}>
                          {isCorrect ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : <X className="h-3.5 w-3.5" strokeWidth={2.4} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 mb-2">{idx + 1}. {q.question}</p>
                          {q.options && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {q.options.map((opt: string) => {
                                const isSelected = ans?.selected_answer === opt;
                                const isAnswer = q.correct_answer === opt;
                                return (
                                  <span key={opt} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                                    isAnswer
                                      ? "bg-emerald-200 text-emerald-800 font-bold"
                                      : isSelected && !isAnswer
                                      ? "bg-rose-200 text-rose-700 line-through"
                                      : "bg-white border border-slate-200 text-slate-500"
                                  }`}>
                                    {isAnswer && <Check className="mr-1 inline h-3 w-3" strokeWidth={2.4} />}{opt}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {!wasAnswered && (
                            <p className="text-xs text-slate-400 italic mb-1">Brez odgovora</p>
                          )}
                          {q.explanation && (
                            <p className="flex items-start gap-1.5 text-xs text-slate-500 italic"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} /> {q.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizResults;
