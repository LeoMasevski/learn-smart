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

const TABS: {
  type: LearningType;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    type: "VISUAL",
    label: "Vizualni",
    icon: "VIS",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-500",
  },
  {
    type: "AUDITORY",
    label: "Slusni",
    icon: "AUD",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-500",
  },
  {
    type: "KINESTHETIC",
    label: "Kinesteticni",
    icon: "KIN",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-500",
  },
];

function isVariantGenerating(variant: LessonVariantFromApi) {
  return variant.content_blocks.some(
    (block) => (block as any)?.type === "generation_status"
  );
}

function getRenderableBlocks(variant: LessonVariantFromApi) {
  return variant.content_blocks.filter(
    (block) => (block as any)?.type !== "generation_status"
  );
}

const ProfessorLessonVariantPreview = ({ lessonId, lessonTitle }: Props) => {
  const [variants, setVariants] = useState<LessonVariantFromApi[]>([]);
  const [activeTab, setActiveTab] = useState<LearningType>("VISUAL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchVariants = async (showLoading: boolean) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");
        const res = await api.get(`/lessons/${lessonId}/variants`);

        if (!cancelled) {
          setVariants(res.data);
        }
      } catch {
        if (!cancelled) {
          setError("Napaka pri nalaganju variant gradiva.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVariants(true);

    const intervalId = window.setInterval(() => {
      fetchVariants(false);
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [lessonId]);

  const activeVariant = variants.find((v) => v.learning_type === activeTab);
  const activeTabMeta = TABS.find((t) => t.type === activeTab)!;
  const activeRenderableBlocks = activeVariant
    ? (getRenderableBlocks(activeVariant) as LessonData["blocks"])
    : [];
  const completedVariantCount = variants.filter(
    (variant) => !isVariantGenerating(variant)
  ).length;
  const hasAllVariants =
    variants.length >= TABS.length && completedVariantCount >= TABS.length;
  const isWaitingForFirstSection = loading && variants.length === 0;

  return (
    <div>
      {error && variants.length === 0 && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {!hasAllVariants && (
        <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          <span className="font-semibold">{completedVariantCount}/3 variant zakljucenih.</span>{" "}
          {isWaitingForFirstSection
            ? "Cakam na prve sekcije. Vsi trije tipi ostanejo vidni med generiranjem."
            : "Sekcije se dodajajo sproti in predogled se samodejno osvezuje."}
        </div>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        {TABS.map(({ type, label, icon, color, bg }) => {
          const variant = variants.find((v) => v.learning_type === type);
          const exists = Boolean(variant);
          const isGenerating = variant ? isVariantGenerating(variant) : false;
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
              {exists && !isGenerating ? (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-current inline-block" />
              ) : (
                <span className="ml-1 text-slate-300">...</span>
              )}
            </span>
          );
        })}
      </div>

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
                <span className="text-xs font-normal text-slate-400 ml-0.5">(se generira)</span>
              )}
            </button>
          );
        })}
      </div>

      {activeVariant && activeRenderableBlocks.length > 0 ? (
        <div className={`rounded-2xl border p-1 ${activeTabMeta.bg} ${activeTabMeta.border}`}>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <LessonRenderer
              lesson={{
                lessonTitle,
                learningType: activeVariant.learning_type,
                blocks: activeRenderableBlocks,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
          <svg className="animate-spin h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-slate-500 font-medium">
            Varianta za tip <strong>{activeTabMeta.label}</strong> se generira.
          </p>
          <p className="max-w-sm text-center text-sm text-slate-400">
            Ko bo prva sekcija pripravljena, se bo prikazala tukaj brez osvezevanja celotnega predogleda.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessorLessonVariantPreview;
