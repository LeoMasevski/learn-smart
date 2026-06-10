import { useEffect, useState } from "react";
import { api } from "../../api/api";

type StudentResult = {
  attempt_id: string;
  score: number;
  correct_count: number;
  total_count: number;
  time_taken_seconds: number | null;
  started_at: string;
  finished_at: string | null;
  student: { id: string; full_name: string; learning_type: string | null } | null;
};

type ResultsData = {
  total_attempts: number;
  average_score: number | null;
  results: StudentResult[];
};

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

const LT_LABELS: Record<string, string> = {
  VISUAL: "Vizualni", AUDITORY: "Slušni", KINESTHETIC: "Kinestetični",
};

const ProfessorQuizResults = ({ quizId, quizTitle, onClose }: Props) => {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/quiz-attempts/quiz/${quizId}/results`)
      .then((res) => setData(res.data))
      .catch(() => setError("Napaka pri nalaganju rezultatov."))
      .finally(() => setLoading(false));
  }, [quizId]);

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
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-50 rounded w-1/4" />
                  </div>
                  <div className="w-12 h-6 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-rose-500 font-medium text-sm py-4">{error}</p>}

          {!loading && data && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl bg-violet-50 p-4 text-center">
                  <p className="text-2xl font-extrabold text-violet-700">{data.total_attempts}</p>
                  <p className="text-xs text-violet-500 mt-0.5 font-medium">Rešitev</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                  <p className="text-2xl font-extrabold text-emerald-700">
                    {data.average_score !== null ? `${data.average_score}%` : "—"}
                  </p>
                  <p className="text-xs text-emerald-500 mt-0.5 font-medium">Povpr. rezultat</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4 text-center">
                  <p className="text-2xl font-extrabold text-sky-700">
                    {data.results.filter((r) => r.score >= 80).length}
                  </p>
                  <p className="text-xs text-sky-500 mt-0.5 font-medium">Odličnih (≥80%)</p>
                </div>
              </div>

              {data.results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <span className="text-4xl">📭</span>
                  <p className="text-slate-600 font-semibold">Še nihče ni rešil tega kviza</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <span>Študent</span>
                    <span className="text-right">Rezultat</span>
                    <span className="text-right">Pravilni</span>
                    <span className="text-right">Čas</span>
                  </div>

                  {data.results.map((r, idx) => {
                    const scoreColor =
                      r.score >= 80 ? "text-emerald-600 bg-emerald-50" :
                      r.score >= 50 ? "text-amber-600 bg-amber-50" :
                                      "text-rose-600 bg-rose-50";
                    const lt = r.student?.learning_type;
                    return (
                      <div
                        key={r.attempt_id}
                        className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3.5 items-center ${
                          idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                        } border-b border-slate-100 last:border-0`}
                      >
                        {/* Student */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-violet-700 font-bold text-xs">
                              {(r.student?.full_name ?? "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {r.student?.full_name ?? "Neznan"}
                            </p>
                            {lt && (
                              <p className="text-xs text-slate-400">{LT_LABELS[lt] ?? lt}</p>
                            )}
                          </div>
                        </div>

                        {/* Score badge */}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor}`}>
                          {r.score}%
                        </span>

                        {/* Correct */}
                        <span className="text-sm text-slate-600 font-medium text-right">
                          {r.correct_count}/{r.total_count}
                        </span>

                        {/* Time */}
                        <span className="text-sm text-slate-400 text-right font-mono">
                          {r.time_taken_seconds != null ? formatTime(r.time_taken_seconds) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorQuizResults;
