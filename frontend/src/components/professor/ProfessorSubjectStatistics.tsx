import { useEffect, useState } from "react";
import { api } from "../../api/api";
import type { StudentProgress, LearningType } from "../../types/professor";
import { Users, Target, Trophy, ListChecks } from "lucide-react";

type Props = {
  subjectId: string;
};

const LEARNING_TYPE_LABELS: Record<LearningType, string> = {
  VISUAL: "Vizualni",
  AUDITORY: "Slušni",
  KINESTHETIC: "Kinestetični",
};

const LEARNING_TYPE_STYLES: Record<LearningType, string> = {
  VISUAL: "bg-sky-100 text-sky-700",
  AUDITORY: "bg-emerald-100 text-emerald-700",
  KINESTHETIC: "bg-amber-100 text-amber-700",
};

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Users;
  colorClass: string;
}) {
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3 ${colorClass}`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-70">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {hint && <p className="text-[11px] opacity-60">{hint}</p>}
      </div>
    </div>
  );
}

function SuccessBadge({ student }: { student: StudentProgress }) {
  if (student.quizzes_attempted === 0 || student.avg_score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
        Še ni reševal
      </span>
    );
  }
  if (student.avg_score >= 80) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Odličen uspeh
      </span>
    );
  }
  if (student.avg_score >= 60) {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
        Dober uspeh
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
      Potreben dodaten trud
    </span>
  );
}

function StudentStatRow({ student }: { student: StudentProgress }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <span className="text-violet-700 font-bold text-sm">
              {student.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="font-semibold text-slate-900 text-sm truncate">{student.full_name}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        {student.learning_type ? (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEARNING_TYPE_STYLES[student.learning_type]}`}>
            {LEARNING_TYPE_LABELS[student.learning_type]}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Ni določen</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 text-center">
        {student.quizzes_attempted} / {student.quizzes_total}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-center">
        {student.avg_score !== null ? `${student.avg_score}%` : "—"}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-center">
        {student.best_score !== null ? `${student.best_score}%` : "—"}
      </td>
      <td className="px-6 py-4 text-right">
        <SuccessBadge student={student} />
      </td>
    </tr>
  );
}

const ProfessorSubjectStatistics = ({ subjectId }: Props) => {
  const [data, setData] = useState<StudentProgress[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/subjects/${subjectId}/student-progress`)
      .then((res) => setData(res.data))
      .catch(() => setError("Napaka pri nalaganju statistike."))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-1/4" />
            </div>
            <div className="w-24 h-6 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="px-6 py-10 text-center text-rose-500 font-medium">{error}</div>;
  }

  if (!data) return null;

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
        <Users className="w-10 h-10 text-slate-300" />
        <p className="text-slate-600 font-semibold">Še ni vpisanih študentov.</p>
      </div>
    );
  }

  const quizzesTotal = data[0].quizzes_total;
  const withAttempts = data.filter((s) => s.avg_score !== null);
  const classAvg = withAttempts.length
    ? Math.round(withAttempts.reduce((sum, s) => sum + (s.avg_score ?? 0), 0) / withAttempts.length)
    : null;
  const classBest = withAttempts.length
    ? Math.max(...withAttempts.map((s) => s.best_score ?? 0))
    : null;

  const sorted = [...data].sort((a, b) => {
    if (a.avg_score === null && b.avg_score === null) return 0;
    if (a.avg_score === null) return 1;
    if (b.avg_score === null) return -1;
    return b.avg_score - a.avg_score;
  });

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="Vpisani študenti"
          value={String(data.length)}
          icon={Users}
          colorClass="bg-violet-50 text-violet-800"
        />
        <SummaryCard
          label="Kvizi v predmetu"
          value={String(quizzesTotal)}
          icon={ListChecks}
          colorClass="bg-sky-50 text-sky-800"
        />
        <SummaryCard
          label="Povprečen uspeh razreda"
          value={classAvg !== null ? `${classAvg}%` : "—"}
          hint={withAttempts.length ? `na podlagi ${withAttempts.length} študentov` : "ni rešenih kvizov"}
          icon={Target}
          colorClass="bg-emerald-50 text-emerald-800"
        />
        <SummaryCard
          label="Najboljši rezultat"
          value={classBest !== null ? `${classBest}%` : "—"}
          icon={Trophy}
          colorClass="bg-amber-50 text-amber-800"
        />
      </div>

      {/* Per-student table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Uspeh po študentih</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Študent</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Učni tip</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Kvizi rešeni</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Povprečje</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Najboljši rezultat</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Uspeh</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((student) => (
                <StudentStatRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfessorSubjectStatistics;
