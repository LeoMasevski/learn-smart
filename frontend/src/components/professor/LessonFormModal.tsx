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
const PDF_MAGIC = "%PDF-";

const VARIANT_META = {
  VISUAL: { emoji: "👁️", label: "Vizualni", bg: "bg-violet-50", color: "text-violet-700", border: "border-violet-200" },
  AUDITORY: { emoji: "👂", label: "Slušni", bg: "bg-sky-50", color: "text-sky-700", border: "border-sky-200" },
  KINESTHETIC: { emoji: "🤸", label: "Kinestetični", bg: "bg-emerald-50", color: "text-emerald-700", border: "border-emerald-200" },
} as const;

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
    lesson?.title?.startsWith("[Dodatno gradivo]") ? "Dodatno gradivo" : "Prezentacija"
  );

  const cleanTitle = lesson?.title
    ?.replace("[Prezentacija] ", "")
    ?.replace("[Dodatno gradivo] ", "");

  const [title, setTitle] = useState(cleanTitle || "");
  const [originalContent, setOriginalContent] = useState(lesson?.original_content || "");
  const [aiInstructions, setAiInstructions] = useState((lesson as any)?.ai_instructions || "");
  const [showAiInstructions, setShowAiInstructions] = useState(!!(lesson as any)?.ai_instructions);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [contentMode, setContentMode] = useState<"text" | "pdf">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const validateAndSetFile = async (file: File | undefined) => {
    setPdfError("");
    if (!file) return;
    const hasPdfMime = file.type === "application/pdf";
    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");

    if (!hasPdfMime || !hasPdfExtension) {
      setPdfError("Datoteka mora biti v formatu PDF.");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setPdfError(`PDF ne sme presegati ${MAX_PDF_MB} MB.`);
      return;
    }

    const header = await file.slice(0, PDF_MAGIC.length).text();
    if (header !== PDF_MAGIC) {
      setPdfError("Datoteka ni veljaven PDF.");
      return;
    }

    setPdfFile(file);
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
    void validateAndSetFile(e.dataTransfer.files?.[0]);
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
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Gradivo ustvarjeno!</h2>
          <p className="text-slate-500 text-sm mb-4">AI je uspešno generiral učne variante.</p>

          {successInfo.pdf && (
            <div className="mb-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600 flex items-center gap-3">
              <span className="text-xl">📄</span>
              <div className="text-left">
                <p className="font-semibold text-slate-800">{successInfo.pdf.originalName}</p>
                <p className="text-xs text-slate-400">
                  {(successInfo.pdf.size / 1024).toFixed(0)} KB · {successInfo.pdf.extractedTextLength} znakov
                </p>
              </div>
            </div>
          )}

          {successInfo.aiError ? (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-4 text-left">
              <p className="font-semibold text-amber-700 mb-1">AI generiranje ni uspelo</p>
              <p className="text-amber-600 text-sm">{successInfo.aiError}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 px-4 py-5">
              <p className="text-violet-700 font-bold text-lg mb-3">
                {successInfo.variantsGenerated} variante generirane ✨
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {(["VISUAL", "AUDITORY", "KINESTHETIC"] as const).map((type) => {
                  const { emoji, label, bg, color, border } = VARIANT_META[type];
                  return (
                    <span
                      key={type}
                      className={`inline-flex items-center gap-1.5 ${bg} ${color} border ${border} text-xs font-semibold px-3 py-1.5 rounded-full`}
                    >
                      {emoji} {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={onSaved}
            className="mt-6 w-full bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition"
          >
            Zapri
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-xl my-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {lesson ? "Uredi učno gradivo" : "Dodaj učno gradivo"}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {lesson
            ? "Posodobi vsebino gradiva."
            : "Vsebina bo avtomatsko pretvorjena v 3 AI učne variante."}
        </p>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-600 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Subject */}
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Predmet <span className="text-red-400">*</span>
        </label>
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:opacity-60"
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
              className={`rounded-2xl border-2 px-4 py-3 font-semibold transition text-sm ${
                materialType === type
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {type === "Prezentacija" ? "📚 Prezentacija" : "📄 Dodatno gradivo"}
            </button>
          ))}
        </div>

        {/* Title */}
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Naslov gradiva <span className="text-red-400">*</span>
        </label>
        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:opacity-60"
          placeholder="npr. Uvod v Python"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />

        {/* Content — only for create */}
        {!lesson && (
          <>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Vsebina <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl w-fit">
              {(["text", "pdf"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setContentMode(mode)}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    contentMode === mode
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {mode === "text" ? "✍️ Vnos besedila" : "📎 Naloži PDF"}
                </button>
              ))}
            </div>

            {contentMode === "text" ? (
              <textarea
                className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-40 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y transition disabled:opacity-60"
                placeholder="Vsebina učnega gradiva kot tekst..."
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                disabled={saving}
              />
            ) : (
              <div className="mb-5">
                {pdfFile ? (
                  <div className="flex items-center justify-between bg-violet-50 border-2 border-violet-200 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">📄</div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{pdfFile.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(pdfFile.size / 1024).toFixed(0)} KB · PDF
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      disabled={saving}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !saving && fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-6 py-10 cursor-pointer transition ${
                      saving
                        ? "opacity-50 cursor-not-allowed border-slate-200"
                        : isDragging
                        ? "border-violet-500 bg-violet-50 scale-[1.01]"
                        : "border-slate-300 hover:border-violet-400 hover:bg-violet-50"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 transition ${isDragging ? "bg-violet-100" : "bg-slate-100"}`}>
                      {isDragging ? "📂" : "📁"}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {isDragging ? "Spusti PDF sem" : "Klikni ali povleci PDF sem"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Maks. {MAX_PDF_MB} MB · samo PDF</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => void validateAndSetFile(e.target.files?.[0])}
                      disabled={saving}
                    />
                  </div>
                )}
                {pdfError && (
                  <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                    </svg>
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
              className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-40 mb-5 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y transition disabled:opacity-60"
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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition ${
              showAiInstructions
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              🤖 AI navodila
              <span className={`text-xs font-normal ${showAiInstructions ? "text-violet-400" : "text-slate-400"}`}>
                (neobvezno)
              </span>
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showAiInstructions ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAiInstructions && (
            <div className="mt-2 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Napiši posebna navodila za AI generiranje, npr. "Poudarek na matematičnih formulah" ali "Napiši primere iz biologije". Maks. 1000 znakov.
              </p>
              <textarea
                className="w-full border border-violet-200 bg-white rounded-xl px-4 py-3 min-h-24 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y transition disabled:opacity-60"
                placeholder="npr. Vključi čim več vizualnih analogij in ne predpostavljaj predznanja..."
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value.slice(0, 1000))}
                disabled={saving}
              />
              <div className="flex justify-between items-center mt-1.5">
                <div className="flex gap-2 flex-wrap">
                  {["Vizualne analogije", "Brez predznanja", "Matematične formule"].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setAiInstructions((v: string) => (v ? `${v}, ${hint}` : hint).slice(0, 1000))}
                      disabled={saving}
                      className="text-xs px-2.5 py-1 rounded-full bg-white border border-violet-200 text-violet-600 hover:bg-violet-50 transition font-medium"
                    >
                      + {hint}
                    </button>
                  ))}
                </div>
                <p className={`text-xs font-medium ${aiInstructions.length > 900 ? "text-amber-500" : "text-slate-400"}`}>
                  {aiInstructions.length} / 1000
                </p>
              </div>
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
            className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-violet-700 transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {contentMode === "pdf" && !lesson ? "Ekstrakcija PDF + AI..." : "Generiram variante..."}
              </>
            ) : lesson ? (
              "Shrani spremembe"
            ) : (
              <>
                Ustvari in generiraj
                <span className="text-violet-200">✨</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonFormModal;
