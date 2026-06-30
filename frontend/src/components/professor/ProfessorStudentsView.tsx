import { useEffect, useState } from "react";
import { Users, Eye, Headphones, PersonStanding } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "../../api/api";
import type { SubjectStudentsResponse, StudentInSubject, LearningType } from "../../types/professor";

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

const LEARNING_TYPE_ICONS: Record<LearningType, string> = {
  VISUAL: "👁️",
  AUDITORY: "🎧",
  KINESTHETIC: "🤸",
};

function NeedsHelpBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
      </svg>
      Potrebuje pomoč
    </span>
  );
}

function LearningTypeBadge({ type }: { type: LearningType | null }) {
  if (!type) return <NeedsHelpBadge />;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEARNING_TYPE_STYLES[type]}`}>
      <span>{LEARNING_TYPE_ICONS[type]}</span>
      {LEARNING_TYPE_LABELS[type]}
    </span>
  );
}

function StudentRow({ student }: { student: StudentInSubject }) {
  const enrolledDate = new Date(student.enrolled_at).toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
        <span className="text-violet-700 font-bold text-sm">
          {student.full_name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm truncate">{student.full_name}</p>
        <p className="text-xs text-slate-400 mt-0.5">Vpisano: {enrolledDate}</p>
      </div>
      <LearningTypeBadge type={student.learning_type} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
}) {
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3 ${colorClass}`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-70">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

const ProfessorStudentsView = ({ subjectId }: Props) => {
  const [data, setData] = useState<SubjectStudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<LearningType | "ALL" | "UNKNOWN">("ALL");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/subjects/${subjectId}/students`)
      .then((res) => setData(res.data))
      .catch(() => setError("Napaka pri nalaganju podatkov o študentih."))
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
    return (
      <div className="px-6 py-10 text-center text-rose-500 font-medium">{error}</div>
    );
  }

  if (!data) return null;

  const needsHelpCount = data.learningTypeCounts.UNKNOWN;
  const filteredStudents = data.students.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "UNKNOWN") return s.learning_type === null;
    return s.learning_type === filter;
  });

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Skupaj vpisanih" value={data.total} icon={Users} colorClass="bg-violet-50 text-violet-800" />
        <StatCard label="Vizualni" value={data.learningTypeCounts.VISUAL} icon={Eye} colorClass="bg-sky-50 text-sky-800" />
        <StatCard label="Slušni" value={data.learningTypeCounts.AUDITORY} icon={Headphones} colorClass="bg-emerald-50 text-emerald-800" />
        <StatCard label="Kinestetični" value={data.learningTypeCounts.KINESTHETIC} icon={PersonStanding} colorClass="bg-amber-50 text-amber-800" />
      </div>

      {/* Needs-help alert */}
      {needsHelpCount > 0 && (
        <div
          className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 cursor-pointer hover:bg-rose-100 transition"
          onClick={() => setFilter(filter === "UNKNOWN" ? "ALL" : "UNKNOWN")}
        >
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
          <div>
            <p className="font-semibold text-rose-700 text-sm">
              {needsHelpCount} {needsHelpCount === 1 ? "študent potrebuje" : "študentov potrebuje"} pomoč
            </p>
            <p className="text-xs text-rose-500 mt-0.5">
              {filter === "UNKNOWN" ? "Klikni za prikaz vseh" : "Niso še določili učnega tipa. Klikni za filtriranje."}
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["ALL", "VISUAL", "AUDITORY", "KINESTHETIC", "UNKNOWN"] as const).map((f) => {
          const labels: Record<typeof f, string> = {
            ALL: "Vsi",
            VISUAL: "Vizualni",
            AUDITORY: "Slušni",
            KINESTHETIC: "Kinestetični",
            UNKNOWN: "Brez tipa",
          };
          const counts: Record<typeof f, number> = {
            ALL: data.total,
            VISUAL: data.learningTypeCounts.VISUAL,
            AUDITORY: data.learningTypeCounts.AUDITORY,
            KINESTHETIC: data.learningTypeCounts.KINESTHETIC,
            UNKNOWN: data.learningTypeCounts.UNKNOWN,
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === f
                  ? "bg-violet-500 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {labels[f]} ({counts[f]})
            </button>
          );
        })}
      </div>

      {/* Student list */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🎓</span>
            <p className="text-slate-600 font-semibold">Ni študentov v tej kategoriji</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfessorStudentsView;
