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

const tabs: LearningType[] = ["VISUAL", "AUDITORY", "KINESTHETIC"];

const tabLabels: Record<LearningType, string> = {
  VISUAL: "Visual",
  AUDITORY: "Auditory",
  KINESTHETIC: "Kinesthetic",
};

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

  const activeVariant = variants.find(
    (variant) => variant.learning_type === activeTab
  );

  if (loading) {
    return <p className="text-slate-500">Nalagam različice gradiva...</p>;
  }

  if (error) {
    return <p className="text-red-600 font-medium">{error}</p>;
  }

  if (variants.length === 0) {
    return (
      <p className="text-slate-500">
        Za to gradivo ni ustvarjenih različic.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === tab
                ? "border-violet-500 text-violet-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeVariant ? (
        <LessonRenderer
          lesson={{
            lessonTitle,
            learningType: activeVariant.learning_type,
            blocks: activeVariant.content_blocks,
          }}
        />
      ) : (
        <p className="text-slate-500">
          Za tip {tabLabels[activeTab]} ni ustvarjene različice.
        </p>
      )}
    </div>
  );
};

export default ProfessorLessonVariantPreview;