import { useRef, useState } from "react";
import { api } from "../../api/api";
import type { Lesson, Subject } from "../../types/professor";

type Props = {
  subjects: Subject[];
  lesson: Lesson | null;
  defaultSubjectId?: string;
  onClose: () => void;
  onSaved: () => void;
};

type MaterialType = "Prezentacija" | "Dodatno gradivo";

type SuccessInfo = {
  lessonId: string;
  lessonTitle: string;
  variantsGenerated: number;
  aiError: string | null;
  pdf?: { originalName: string; size: number; extractedTextLength: number };
};

const MAX_PDF_MB = 10;

const LessonFormModal = ({
  subjects,
  lesson,
  defaultSubjectId,
  onClose,
  onSaved,
}: Props) => {
  const [subjectId, setSubjectId] = useState(
    lesson?.subject_id || defaultSubjectId || subjects[0]?.id || ""
  );
  const [materialType, setMaterialType] = useState<MaterialType>(
    lesson?.title?.startsWith("[Dodatno gradivo]")
      ? "Dodatno gradivo"
      : "Prezentacija"
  );

  const cleanTitle = lesson?.title
    ?.replace("[Prezentacija] ", "")
    ?.replace("[Dodatno gradivo] ", "");

  const [title, setTitle] = useState(cleanTitle || "");
  const [originalContent, setOriginalContent] = useState(
    lesson?.original_content || ""
  );
  const [aiInstructions, setAiInstructions] = useState(
    (lesson as any)?.ai_instructions || ""
  );
  const [showAiInstructions, setShowAiInstructions] = useState(
    !!(lesson as any)?.ai_instructions
  );

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [contentMode, setContentMode] = useState<"text" | "pdf">(
    lesson ? "text" : "text"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const validateAndSetFile = (file: File | undefined) => {
    setPdfError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPdfError("Datoteka mora biti v formatu PDF.");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setPdfError(`PDF ne sme presegati ${MAX_PDF_MB} MB.`);
      return;
    }
    setPdfFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveLesson = async () => {
    if (saving) return;
    if (!subjectId) { setError("Izberi predmet."); return; }
    if (!title.trim()) { setError("Vnesi naslov gradiva."); return; }
    if (contentMode === "text") {
      if (!originalContent.trim()) { setError("Vnesi vsebino gradiva."); return; }
      if (originalContent.trim().length < 20) {
        setError("Vsebina gradiva mora imeti vsaj 20 znakov.");
        return;
      }
    } else {
      if (!pdfFile) { setError("Naloži PDF datoteko."); return; }
    }

    try {
      setSaving(true);
      setError("");

      const prefixedTitle = `[${materialType}] ${title.trim()}`;

      if (lesson) {
        await api.put(`/lessons/${lesson.id}`, {
          subjectId,
          title: prefixedTitle,
          originalContent: originalContent.trim(),
          aiInstructions: aiInstructions.trim() || undefined,
        });
        onSaved();
        return;
      }

      const formData = new FormData();
      formData.append("subjectId", subjectId);
      formData.append("title", prefixedTitle);
      if (contentMode === "pdf" && pdfFile) {
        formData.append("file", pdfFile);
      } else {
        formData.append("originalContent", originalContent.trim());
      }
      if (aiInstructions.trim()) {
        formData.append("aiInstructions", aiInstructions.trim());
      }

      const res = await api.post("/lessons", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessInfo({
        lessonId: res.data.lesson.id,
        lessonTitle: prefixedTitle,
        variantsGenerated: res.data.variantsGenerated,
        aiError: res.data.aiError,
        pdf: res.data.pdf,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Napaka pri shranjevanju gradiva."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (successInfo) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Gradivo ustvarjeno!
          </h2>
          {successInfo.pdf && (
            <p className="text-sm text-slate-500 mb-1">
              📄 PDF:{" "}
              <span className="font-medium">{successInfo.pdf.originalName}</span>{" "}
              · {(successInfo.pdf.size / 1024).toFixed(0)} KB ·{" "}
              {successInfo.pdf.extractedTextLength} znakov
            </p>
          )}
          {successInfo.aiError ? (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-amber-700 text-sm">
              <p className="font-semibold mb-1">AI generiranje ni uspelo</p>
              <p className="text-amber-600">{successInfo.aiError}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-violet-50 border border-violet-100 px-4 py-4">
              <p className="text-violet-700 font-semibold text-lg">
                {successInfo.variantsGenerated} variante generirane ✨
              </p>
              <div className="flex justify-center gap-3 mt-3">
                {(["VISUAL", "AUDITORY", "KINESTHETIC"] as const).map((type) => {
                  const labels = {
                    VISUAL: { emoji: "👁️", label: "Vizualni" },
                    AUDITORY: { emoji: "👂", label: "Slušni" },
                    KINESTHETIC: { emoji: "🤸", label: "Kinestetični" },
                  };
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 bg-white border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                    >
                      {labels[type].emoji} {labels[type].label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={onSaved}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition"
            >
              Zapri
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-xl my-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lesson ? "Uredi učno gradivo" : "Dodaj učno gradivo"}
        </h2>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Subject */}
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Predmet
        </label>
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          disabled={saving}
        >
          <option value="">Izberi predmet</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        {/* Material type */}
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Vrsta gradiva
        </label>
        <div className="mb-5 grid grid-cols-2 gap-3">
          {(["Prezentacija", "Dodatno gradivo"] as MaterialType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMaterialType(type)}
              disabled={saving}
              className={`rounded-2xl border px-4 py-3 font-semibold transition ${
                materialType === type
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {type === "Prezentacija" ? "📚 Prezentacija" : "📄 Dodatno gradivo"}
            </button>
          ))}
        </div>

        {/* Title */}
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Naslov gradiva
        </label>
        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400"
          placeholder="npr. Uvod v Python"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />

        {/* Content — only for create */}
        {!lesson && (
          <>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Vsebina
            </label>
            <div className="flex gap-2 mb-3">
              {(["text", "pdf"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setContentMode(mode)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                    contentMode === mode
                      ? "border-violet-600 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {mode === "text" ? "✍️ Vnos besedila" : "📎 Naloži PDF"}
                </button>
              ))}
            </div>

            {contentMode === "text" ? (
              <textarea
                className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-40 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y"
                placeholder="Vsebina učnega gradiva kot tekst..."
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                disabled={saving}
              />
            ) : (
              <div className="mb-5">
                {pdfFile ? (
                  <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(pdfFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      disabled={saving}
                      className="text-slate-400 hover:text-red-500 transition text-xl font-bold leading-none"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !saving && fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-6 py-8 cursor-pointer transition ${
                      saving
                        ? "opacity-50 cursor-not-allowed border-slate-200"
                        : isDragging
                        ? "border-violet-500 bg-violet-100"
                        : "border-slate-300 hover:border-violet-400 hover:bg-violet-50"
                    }`}
                  >
                    <span className="text-3xl mb-2">
                      {isDragging ? "📂" : "📁"}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {isDragging
                        ? "Spusti PDF sem"
                        : "Klikni ali povleci PDF sem"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Maks. {MAX_PDF_MB} MB · samo PDF
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={saving}
                    />
                  </div>
                )}
                {pdfError && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {pdfError}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Edit — original content */}
        {lesson && (
          <>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Vsebina gradiva
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-40 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y"
              placeholder="Vsebina učnega gradiva kot tekst..."
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              disabled={saving}
            />
          </>
        )}

        {/* AI Instructions */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAiInstructions((v) => !v)}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900 transition"
          >
            <span
              className={`inline-block transition-transform ${
                showAiInstructions ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
            🤖 AI navodila (neobvezno)
          </button>
          {showAiInstructions && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-2">
                Napiši posebna navodila za AI generiranje (npr. "Poudarek na
                matematičnih formulah" ali "Napiši primere iz biologije"). Maks.
                1000 znakov.
              </p>
              <textarea
                className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-24 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y"
                placeholder="npr. Vključi čim več vizualnih analogij in ne predpostavljaj predznanja..."
                value={aiInstructions}
                onChange={(e) =>
                  setAiInstructions(e.target.value.slice(0, 1000))
                }
                disabled={saving}
              />
              <p className="text-right text-xs text-slate-400 mt-1">
                {aiInstructions.length} / 1000
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-medium disabled:opacity-60 hover:bg-slate-200 transition"
          >
            Prekliči
          </button>
          <button
            onClick={saveLesson}
            disabled={saving}
            className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-violet-700 transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                {contentMode === "pdf" && !lesson
                  ? "Ekstrakcija PDF + AI..."
                  : "Generiram variante..."}
              </>
            ) : lesson ? (
              "Shrani spremembe"
            ) : (
              "Ustvari in generiraj ✨"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonFormModal;