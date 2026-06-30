import { BookOpen, FileText, NotebookText, FolderOpen } from "lucide-react";
import type { Lesson } from "../../types/professor";

type Props = {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string, name: string) => void;
  onPreview: (lesson: Lesson) => void;
  onGenerateVariants: (lesson: Lesson) => void;
  generatingVariantsId?: string;
  activePreviewId?: string;
};

const getLessonMeta = (title: string) => {
  if (title.startsWith("[Prezentacija]")) {
    return { label: "Prezentacija", icon: BookOpen, bg: "bg-violet-50", color: "text-violet-700", border: "border-violet-100" };
  }
  if (title.startsWith("[Dodatno gradivo]")) {
    return { label: "Dodatno gradivo", icon: FileText, bg: "bg-sky-50", color: "text-sky-700", border: "border-sky-100" };
  }
  return { label: "Gradivo", icon: NotebookText, bg: "bg-slate-50", color: "text-slate-600", border: "border-slate-100" };
};

const cleanTitle = (title: string) =>
  title.replace("[Prezentacija] ", "").replace("[Dodatno gradivo] ", "");

const getGenerationStatus = (variant: NonNullable<Lesson["lesson_variants"]>[number]) => {
  if (!Array.isArray(variant.content_blocks)) return null;
  return (
    variant.content_blocks.find(
      (block) => (block as any)?.type === "generation_status"
    ) as { type: "generation_status"; status: "generating" | "failed" } | undefined
  ) ?? null;
};

const LessonList = ({ lessons, onEdit, onDelete, onPreview, onGenerateVariants, generatingVariantsId, activePreviewId }: Props) => {
  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 bg-violet-50 rounded-full flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-violet-400" strokeWidth={2} />
        </div>
        <p className="text-slate-700 font-semibold text-lg">Ni učnega gradiva</p>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Za ta predmet še ni dodanega gradiva. Kliknite + Dodaj gradivo.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {lessons.map((lesson) => {
        const meta = getLessonMeta(lesson.title);
        const isActive = lesson.id === activePreviewId;
        const variantCount = lesson.lesson_variants?.filter(
          (variant) => !getGenerationStatus(variant)
        ).length ?? 0;
        const generatingCount = lesson.lesson_variants?.filter(
          (variant) => getGenerationStatus(variant)?.status === "generating"
        ).length ?? 0;
        const failedCount = lesson.lesson_variants?.filter(
          (variant) => getGenerationStatus(variant)?.status === "failed"
        ).length ?? 0;
        const hasAllVariants = variantCount >= 3;
        const isQueuedOrGenerating = generatingCount > 0 && !hasAllVariants;
        const isGenerating = generatingVariantsId === lesson.id;

        return (
          <div
            key={lesson.id}
            className={`p-5 transition ${isActive ? "bg-violet-50/60" : "hover:bg-slate-50/60"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                {/* Type icon */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg} border ${meta.border}`}>
                  <meta.icon className={`w-5 h-5 ${meta.color}`} strokeWidth={2.25} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.color} border ${meta.border}`}>
                      {meta.label}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                        Aktiven predogled
                      </span>
                    )}
                    {!hasAllVariants && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        failedCount > 0
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {failedCount > 0
                          ? "Generiranje ni uspelo"
                          : isQueuedOrGenerating
                          ? "Variante se generirajo"
                          : variantCount > 0
                          ? `${variantCount}/3 variante pripravljene`
                          : "Variante manjkajo"}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-semibold text-slate-900 leading-snug">
                    {cleanTitle(lesson.title)}
                  </h2>

                  {lesson.original_content && (
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {lesson.original_content}
                    </p>
                  )}

                  {lesson.created_at && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {new Date(lesson.created_at).toLocaleDateString("sl-SI", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!hasAllVariants && (
                  <button
                    onClick={() => onGenerateVariants(lesson)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition disabled:opacity-60"
                  >
                    {isGenerating
                      ? "Generiranje..."
                      : failedCount > 0
                      ? "Poskusi znova"
                      : "Generiraj variante"}
                  </button>
                )}
                <button
                  onClick={() => onPreview(lesson)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-violet-500 text-white hover:bg-violet-600"
                      : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  AI pregled
                </button>

                <button
                  onClick={() => onEdit(lesson)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Uredi
                </button>

                <button
                  onClick={() => onDelete(lesson.id, cleanTitle(lesson.title))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Briši
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LessonList;
