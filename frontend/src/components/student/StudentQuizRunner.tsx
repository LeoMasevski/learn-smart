import { useEffect, useRef, useState } from "react";
import { api } from "../../api/api";
import type {
  SubjectQuizForStudent,
  QuizQuestionForStudent,
  QuizAttempt,
  QuizAttemptAnswer,
} from "../../types/student";
import { Award, BookOpen, Check, Lightbulb, Target, TrendingUp, X } from "lucide-react";

type Props = {
  quiz: SubjectQuizForStudent;
  onBack: () => void;
};

type Phase = "starting" | "running" | "submitting" | "result";

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

const StudentQuizRunner = ({ quiz, onBack }: Props) => {
  // questions filled from /start response (quiz prop only has question IDs)
  const [questions, setQuestions] = useState<QuizQuestionForStudent[]>([]);

  const [phase, setPhase] = useState<Phase>("starting");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_minutes * 60);
  const [startTime, setStartTime] = useState<number>(0);
  const [resultAttempt, setResultAttempt] = useState<QuizAttempt | null>(null);
  const [resultAnswers, setResultAnswers] = useState<QuizAttemptAnswer[]>([]);
  const [resultQuiz, setResultQuiz] = useState<(SubjectQuizForStudent & { quiz_questions?: any[] }) | null>(null);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start attempt — /start returns full quiz with questions
  useEffect(() => {
    api.post("/quiz-attempts/start", { quizId: quiz.id })
      .then((res) => {
        const fullQuiz: SubjectQuizForStudent = res.data.quiz;
        const qs: QuizQuestionForStudent[] = (fullQuiz.quiz_questions ?? []).sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        );
        setQuestions(qs);
        setAttemptId(res.data.attempt.id);
        setStartTime(Date.now());
        setPhase("running");
      })
      .catch((err) => {
        setError(err?.response?.data?.message ?? "Napaka pri zagonu kviza.");
      });
  }, [quiz.id]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    clearInterval(timerRef.current!);
    setPhase("submitting");

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const answerList = questions.map((q) => ({
      question_id: q.id,
      selected_answer: answers[q.id] ?? "",
    })).filter((a) => a.selected_answer !== "");

    try {
      const res = await api.post(`/quiz-attempts/${attemptId}/submit`, {
        answers: answerList,
        timeTakenSeconds: timeTaken,
      });
      setResultAttempt(res.data.attempt);
      setResultAnswers(res.data.attempt.quiz_attempt_answers ?? []);
      setResultQuiz(res.data.quiz);
      setPhase("result");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Napaka pri oddaji kviza.");
      setPhase("running");
    }
  };

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const timerWarning = timeLeft < 60;
  const currentQ = questions[currentIdx];

  // ── Loading / error ─────────────────────────────────────────────────────────
  if (phase === "starting") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        {error ? (
          <>
            <p className="text-rose-500 font-semibold">{error}</p>
            <button onClick={onBack} className="text-sm text-violet-600 font-semibold underline">Nazaj</button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
            <p className="text-slate-400 text-sm">Pripravljam kviz...</p>
          </>
        )}
      </div>
    );
  }

  // ── Submitting ───────────────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
        <p className="text-slate-400 text-sm">Oddajam odgovore...</p>
      </div>
    );
  }

  // ── Result screen ────────────────────────────────────────────────────────────
  if (phase === "result" && resultAttempt) {
    const score = resultAttempt.score ?? 0;
    const correct = resultAttempt.correct_count ?? 0;
    const total = resultAttempt.total_count ?? questions.length;
    const timeTaken = resultAttempt.time_taken_seconds ?? 0;

    const answerMap: Record<string, QuizAttemptAnswer> = {};
    for (const a of resultAnswers) answerMap[a.question_id] = a;

    const allQuestionsWithResult = (resultQuiz?.quiz_questions ?? []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    );

    const feedback =
      score >= 90 ? { icon: Award, label: "Odlično!", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" } :
      score >= 70 ? { icon: Target, label: "Dobro!", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" } :
      score >= 50 ? { icon: BookOpen, label: "Solidno, še malo!", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" } :
                   { icon: TrendingUp, label: "Poskusi znova!", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
    const FeedbackIcon = feedback.icon;

    return (
      <div className="max-w-2xl mx-auto w-full">
        {/* Score card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6 flex flex-col items-center gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feedback.bg} ${feedback.border}`}>
            <FeedbackIcon className={`h-6 w-6 ${feedback.color}`} strokeWidth={2.1} />
          </span>
          <h2 className={`text-2xl font-extrabold ${feedback.color}`}>{feedback.label}</h2>
          <ScoreRing score={score} />
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{correct}/{total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Pravilnih</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{formatTime(timeTaken)}</p>
              <p className="text-xs text-slate-400 mt-0.5">Čas</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{quiz.time_limit_minutes} min</p>
              <p className="text-xs text-slate-400 mt-0.5">Omejitev</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="mt-2 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white px-8 py-3 font-semibold text-sm transition"
          >
            Nazaj na kvize
          </button>
        </div>

        {/* Per-question review */}
        <h3 className="text-base font-bold text-slate-900 mb-3">Pregled odgovorov</h3>
        <div className="space-y-3">
          {allQuestionsWithResult.map((q: any, idx: number) => {
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
      </div>
    );
  }

  // ── Quiz runner ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-3 pt-1">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-medium truncate">{quiz.title}</p>
              <p className="text-sm font-bold text-slate-800">{answeredCount}/{questions.length} odgovorjenih</p>
            </div>
          </div>
          {/* Timer */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono font-bold text-sm shrink-0 ${
            timerWarning ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-700"
          }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-rose-600 text-sm font-medium">{error}</div>
      )}

      {/* Question navigator dots */}
      <div className="flex flex-wrap gap-1.5 mb-5 mt-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
              i === currentIdx
                ? "bg-violet-500 text-white shadow-sm"
                : answers[q.id]
                ? "bg-violet-100 text-violet-700"
                : "bg-white border border-slate-200 text-slate-400"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      {currentQ && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
              {currentIdx + 1}
            </span>
            <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
              currentQ.question_type === "multiple_choice" ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600"
            }`}>
              {currentQ.question_type === "multiple_choice" ? "Večkratni izbor" : "Res / Ni res"}
            </span>
          </div>
          <p className="text-base font-semibold text-slate-800 mb-5">{currentQ.question}</p>

          <div className="space-y-2">
            {(currentQ.options ?? []).map((opt) => {
              const selected = answers[currentQ.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(currentQ.id, opt)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 border text-left transition ${
                    selected
                      ? "border-violet-400 bg-violet-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    selected ? "border-violet-500 bg-violet-500" : "border-slate-300"
                  }`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm font-medium ${selected ? "text-violet-800" : "text-slate-700"}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Prejšnje
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="rounded-2xl bg-violet-500 hover:bg-violet-600 text-white px-6 py-2.5 text-sm font-semibold transition"
          >
            Naslednje →
          </button>
        ) : (
          <button
            onClick={() => handleSubmit()}
            disabled={answeredCount === 0}
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Oddaj ({answeredCount}/{questions.length})
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentQuizRunner;
