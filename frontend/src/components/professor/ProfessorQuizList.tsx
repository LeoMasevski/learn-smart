import { useEffect, useState } from "react";
import { BarChart3, BookOpen, Brain, Check, Clock3, HelpCircle, Lightbulb, Plus } from "lucide-react";
import { api } from "../../api/api";
import type { Lesson, SubjectQuiz } from "../../types/professor";
import ProfessorQuizModal from "./ProfessorQuizModal";
import ProfessorQuizResults from "./ProfessorQuizResults";

type Props = {
  subjectId: string;
  lessons: Lesson[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ready: { label: "Pripravljen", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  generating: { label: "Generira se...", color: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  draft: { label: "Osnutek", color: "bg-slate-100 text-slate-500", dot: "bg-slate-300" },
};

const QTYPE_LABELS: Record<string, string> = {
  multiple_choice: "Večkratni izbor",
  true_false: "Res / Ni res",
  mixed: "Kombinirano",
};

function QuizCard({
  quiz,
  onDelete,
  onViewResults,
}: {
  quiz: SubjectQuiz;
  onDelete: (id: string) => void;
  onViewResults: (quiz: SubjectQuiz) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const status = STATUS_CONFIG[quiz.status] ?? STATUS_CONFIG.draft;
  const questionCount = quiz.quiz_questions?.length ?? quiz.question_count;
  const lessonNames = (quiz.quiz_lessons ?? [])
    .map((ql) => ql.lessons?.title)
    .filter(Boolean)
    .join(", ");

  const handleDelete = async () => {
    if (!window.confirm(`Izbriši kviz "${quiz.title}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/subject-quizzes/${quiz.id}`);
      onDelete(quiz.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-6 py-5 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="rounded-full bg-violet-50 text-violet-700 px-2.5 py-0.5 text-xs font-semibold">
              {QTYPE_LABELS[quiz.question_type] ?? quiz.question_type}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate">{quiz.title}</h3>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
              {questionCount} vprašanj
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" strokeWidth={2} />
              {quiz.time_limit_minutes} min
            </span>
          </div>
          {lessonNames && (
            <p className="text-xs text-slate-500 mt-1 truncate flex items-center gap-1">
              <BookOpen className="w-3 h-3 shrink-0" strokeWidth={2} />
              {lessonNames}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {quiz.status === "ready" && (
            <>
              <button
                onClick={() => onViewResults(quiz)}
                className="rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 px-3 py-2 text-xs font-semibold transition inline-flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" strokeWidth={2.25} />
                Rezultati
              </button>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-2 text-xs font-semibold transition"
              >
                {expanded ? "Skrij" : "Pregled"}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
          >
            {deleting ? "..." : "Briši"}
          </button>
        </div>
      </div>

      {expanded && quiz.status === "ready" && (
        <div className="border-t border-slate-100 px-6 pb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-3">Vprašanja</p>
          <div className="space-y-2">
            {[...(quiz.quiz_questions ?? [])]
              .sort((a, b) => a.order_index - b.order_index)
              .map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{q.question}</p>
                      {q.options && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.options.map((opt) => (
                            <span
                              key={opt}
                              className={`rounded-lg px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1 ${
                                opt === q.correct_answer
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-white border border-slate-200 text-slate-600"
                              }`}
                            >
                              {opt === q.correct_answer && <Check className="w-3 h-3" strokeWidth={2.5} />}
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-slate-500 mt-1.5 italic inline-flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2.25} />
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ProfessorQuizList = ({ subjectId, lessons }: Props) => {
  const [quizzes, setQuizzes] = useState<SubjectQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [resultsQuiz, setResultsQuiz] = useState<SubjectQuiz | null>(null);

  const fetchQuizzes = () => {
    setLoading(true);
    setError("");
    api
      .get(`/subject-quizzes/subject/${subjectId}`)
      .then((res) => setQuizzes(res.data))
      .catch(() => setError("Napaka pri nalaganju kvizov."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId]);

  const handleDelete = (id: string) => setQuizzes((prev) => prev.filter((q) => q.id !== id));

  const handleCreated = (quiz: SubjectQuiz) => {
    setQuizzes((prev) => [quiz, ...prev]);
    setModalOpen(false);
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kvizi</h2>
          <p className="text-slate-500 text-sm">AI-generirani kvizi na podlagi učnih gradiv.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nov kviz
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 px-5 py-4 text-rose-600 flex items-center gap-3">
          <span className="font-medium">{error}</span>
          <button onClick={fetchQuizzes} className="ml-auto text-sm font-semibold underline">Poskusi znova</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/4 mb-3" />
              <div className="h-6 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl bg-white border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center text-violet-700">
            <Brain className="w-7 h-7" strokeWidth={2.25} />
          </div>
          <p className="text-slate-800 font-semibold text-xl">Ni kvizov za ta predmet</p>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Ustvari kviz. Gemini bo generiral vprašanja na podlagi izbranih gradiv.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 rounded-xl bg-violet-600 px-7 py-3 text-white font-semibold shadow-sm hover:bg-violet-700 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Ustvari prvi kviz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} onViewResults={setResultsQuiz} />
          ))}
        </div>
      )}

      {modalOpen && (
        <ProfessorQuizModal
          subjectId={subjectId}
          lessons={lessons}
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {resultsQuiz && (
        <ProfessorQuizResults
          quizId={resultsQuiz.id}
          quizTitle={resultsQuiz.title}
          onClose={() => setResultsQuiz(null)}
        />
      )}
    </>
  );
};

export default ProfessorQuizList;
