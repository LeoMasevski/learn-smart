import { useEffect, useState } from "react";
import { api } from "../../api/api";
import LessonRenderer from "../lesson/LessonRenderer";
import type { LessonData } from "../lesson/LessonRenderer";

type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

type LessonVariantFromApi = {
  id: string;
  lesson_id: string;
  learning_type: LearningType;
  content_blocks: LessonData["blocks"];
};

type Props = {
  lessonId: string;
  lessonTitle: string;
};

const TABS: { type: LearningType; label: string; icon: string; color: string; bg: string; border: string }[] = [
  {
    type: "VISUAL",
    label: "Vizualni",
    icon: "👁️",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-500",
  },
  {
    type: "AUDITORY",
    label: "Slušni",
    icon: "👂",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-500",
  },
  {
    type: "KINESTHETIC",
    label: "Kinestetični",
    icon: "🤸",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-500",
  },
];

const ProfessorLessonVariantPreview = ({ lessonId, lessonTitle }: Props) => {
  const [variants, setVariants] = useState<LessonVariantFromApi[]>([]);
  const [activeTab, setActiveTab] = useState<LearningType>("VISUAL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/lessons/${lessonId}/variants`);
        setVariants(res.data);
      } catch {
        setError("Napaka pri nalaganju različic gradiva.");
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [lessonId]);

  const activeVariant = variants.find((v) => v.learning_type === activeTab);
  const activeTabMeta = TABS.find((t) => t.type === activeTab)!;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <svg className="animate-spin w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-slate-500 text-sm font-medium">Nalagam AI variante gradiva...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
        </div>
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-2xl">✨</div>
        <p className="text-slate-700 font-semibold text-lg">Ni AI variant</p>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Za to gradivo še niso bile generirane AI različice. Poskusite znova ustvariti gradivo.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Variant status badges */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {TABS.map(({ type, label, icon, color, bg }) => {
          const exists = variants.some((v) => v.learning_type === type);
          return (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                exists
                  ? `${bg} ${color} border-current/20`
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              {icon} {label}
              {exists ? (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-current inline-block" />
              ) : (
                <span className="ml-1 text-slate-300">—</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map(({ type, label, icon, color, bg, border }) => {
          const exists = variants.some((v) => v.learning_type === type);
          const isActive = activeTab === type;
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition rounded-t-xl ${
                isActive
                  ? `${border} ${color} ${bg}`
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              } ${!exists ? "opacity-50" : ""}`}
            >
              <span>{icon}</span>
              {label}
              {!exists && (
                <span className="text-xs font-normal text-slate-400 ml-0.5">(ni)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeVariant ? (
        <div className={`rounded-2xl border p-1 ${activeTabMeta.bg} ${activeTabMeta.border.replace("border-", "border-")}`}>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <LessonRenderer
              lesson={{
                lessonTitle,
                learningType: activeVariant.learning_type,
                blocks: activeVariant.content_blocks,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <span className="text-3xl">{activeTabMeta.icon}</span>
          <p className="text-slate-500 font-medium">
            Varianta za tip <strong>{activeTabMeta.label}</strong> ni bila generirana.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessorLessonVariantPreview;
