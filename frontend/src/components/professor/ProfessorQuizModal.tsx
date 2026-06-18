import { useState } from "react";
import { api } from "../../api/api";
import type { Lesson } from "../../types/professor";
import type { QuestionType, SubjectQuiz } from "../../types/professor";

type Props = {
  subjectId: string;
  lessons: Lesson[];
  onClose: () => void;
  onCreated: (quiz: SubjectQuiz) => void;
};

type Step = "lessons" | "config" | "generating" | "preview";

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; desc: string; icon: string }[] = [
  { value: "multiple_choice", label: "Večkratni izbor", desc: "4 možnosti, 1 pravilen odgovor", icon: "☑️" },
  { value: "true_false", label: "Res / Ni res", desc: "Enostavne izjavne trditve", icon: "✅" },
  { value: "mixed", label: "Kombinirano", desc: "Mešanica obeh tipov", icon: "🔀" },
];

const ProfessorQuizModal = ({ subjectId, lessons, onClose, onCreated }: Props) => {
  const [step, setStep] = useState<Step>("lessons");

  // Step 1 — lesson selection
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());

  // Step 2 — config
  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");

  // Step 3/4 — result
  const [generatedQuiz, setGeneratedQuiz] = useState<SubjectQuiz | null>(null);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState<string | null>(null);

  const toggleLesson = (id: string) => {
    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfigNext = async () => {
    if (!title.trim()) { setError("Naslov kviza je obvezen."); return; }
    setError("");
    setStep("generating");

    try {
      // 1. Create quiz
      const createRes = await api.post("/subject-quizzes", {
        subjectId,
        title: title.trim(),
        timeLimitMinutes,
        questionCount,
        questionType,
        lessonIds: Array.from(selectedLessonIds),
      });
      const quizId: string = createRes.data.quiz.id;

      // 2. Generate questions
      const genRes = await api.post(`/subject-quizzes/${quizId}/generate`);
      setGeneratedQuiz(genRes.data.quiz);
      setStep("preview");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Napaka pri generiranju kviza.");
      setStep("config");
    }
  };

  const handleAccept = () => {
    if (generatedQuiz) onCreated(generatedQuiz);
  };

  const selectedLessons = lessons.filter((l) => selectedLessonIds.has(l.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">
              ✨ AI Kviz Generator
            </p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {step === "lessons" && "Izberi gradiva"}
              {step === "config" && "Nastavi kviz"}
              {step === "generating" && "Generiram vprašanja..."}
              {step === "preview" && "Predogled kviza"}
            </h2>
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

        {/* Steps indicator */}
        {step !== "generating" && (
          <div className="flex items-center gap-2 px-7 pt-4">
            {(["lessons", "config", "preview"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step === s
                      ? "bg-violet-500 text-white"
                      : ["preview"].includes(step) && ["lessons", "config"].includes(s)
                      ? "bg-violet-100 text-violet-600"
                      : step === "preview" && s === "preview"
                      ? "bg-violet-500 text-white"
                      : step === "config" && s === "lessons"
                      ? "bg-violet-100 text-violet-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && <div className="w-8 h-px bg-slate-200" />}
              </div>
            ))}
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {step === "lessons" && "Korak 1 od 3"}
              {step === "config" && "Korak 2 od 3"}
              {step === "preview" && "Korak 3 od 3"}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">

          {/* STEP 1: Lesson selection */}
          {step === "lessons" && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Izberi gradiva, ki jih Gemini uporabi za generiranje vprašanj.
              </p>
              {lessons.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-4xl mb-3">📚</p>
                  <p className="font-medium">Predmet nima gradiv</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson) => {
                    const selected = selectedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => toggleLesson(lesson.id)}
                        className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 border transition text-left ${
                          selected
                            ? "border-violet-300 bg-violet-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                            selected ? "border-violet-500 bg-violet-500" : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${selected ? "text-violet-800" : "text-slate-700"}`}>
                          {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Config */}
          {step === "config" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400 mb-3 font-medium">
                  Gradiva: {selectedLessons.map((l) => l.title).join(", ")}
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Naslov kviza</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="npr. Zaključni kviz – Poglavje 1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Question count + time limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Število vprašanj <span className="text-slate-400 font-normal">(3–50)</span>
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={50}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.min(50, Math.max(3, Number(e.target.value))))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Časovna omejitev <span className="text-slate-400 font-normal">(min)</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Math.min(180, Math.max(5, Number(e.target.value))))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>

              {/* Question type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tip vprašanj</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuestionType(opt.value)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        questionType === opt.value
                          ? "border-violet-400 bg-violet-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xl mb-1">{opt.icon}</div>
                      <p className={`text-xs font-semibold ${questionType === opt.value ? "text-violet-800" : "text-slate-700"}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-500 font-medium">{error}</p>
              )}
            </div>
          )}

          {/* STEP 3: Generating */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900 text-lg">Gemini generira vprašanja</p>
                <p className="text-sm text-slate-400 mt-1">
                  Analiziram {selectedLessons.length} {selectedLessons.length === 1 ? "gradivo" : "gradiva"} in ustvarjam {questionCount} vprašanj...
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Preview */}
          {step === "preview" && generatedQuiz && (
            <div>
              {/* Quiz meta */}
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  ❓ {generatedQuiz.quiz_questions?.length ?? 0} vprašanj
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  ⏱ {generatedQuiz.time_limit_minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ✅ Generirano
                </span>
              </div>

              {/* Questions list */}
              <div className="space-y-3">
                {(generatedQuiz.quiz_questions ?? []).map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
                      onClick={() => setPreviewOpen(previewOpen === q.id ? null : q.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-800">{q.question}</span>
                      </div>
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ml-3 shrink-0 ${
                        q.question_type === "multiple_choice"
                          ? "bg-sky-50 text-sky-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {q.question_type === "multiple_choice" ? "Večkratni" : "Res/Ni res"}
                      </span>
                    </button>
                    {previewOpen === q.id && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                        {q.options && (
                          <div className="space-y-1.5 mb-3">
                            {q.options.map((opt) => (
                              <div
                                key={opt}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                  opt === q.correct_answer
                                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
                                    : "bg-slate-50 text-slate-600"
                                }`}
                              >
                                {opt === q.correct_answer && (
                                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-slate-500 italic">💡 {q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between gap-3 px-7 py-5 border-t border-slate-100">
          {step === "lessons" && (
            <>
              <button onClick={onClose} className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Prekliči
              </button>
              <button
                onClick={() => setStep("config")}
                disabled={selectedLessonIds.size === 0}
                className="rounded-2xl bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Naprej →
              </button>
            </>
          )}
          {step === "config" && (
            <>
              <button onClick={() => setStep("lessons")} className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                ← Nazaj
              </button>
              <button
                onClick={handleConfigNext}
                className="rounded-2xl bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 transition flex items-center gap-2"
              >
                <span>✨</span> Generiraj s Gemini
              </button>
            </>
          )}
          {step === "preview" && (
            <>
              <button onClick={onClose} className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Zapri
              </button>
              <button
                onClick={handleAccept}
                className="rounded-2xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Shrani kviz
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorQuizModal;
