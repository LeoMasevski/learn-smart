import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock3,
  HelpCircle,
  Lightbulb,
  Pencil,
  Plus,
  Shuffle,
  Sparkles,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { api } from "../../api/api";
import type { Lesson } from "../../types/professor";
import type { QuestionType, QuizQuestion, SubjectQuiz } from "../../types/professor";

type Props = {
  subjectId: string;
  lessons: Lesson[];
  onClose: () => void;
  onCreated: (quiz: SubjectQuiz) => void;
};

type Step = "lessons" | "config" | "generating" | "preview";

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; desc: string; icon: LucideIcon }[] = [
  { value: "multiple_choice", label: "Večkratni izbor", desc: "4 možnosti, 1 pravilen odgovor", icon: CheckSquare },
  { value: "true_false", label: "Res / Ni res", desc: "Enostavne izjavne trditve", icon: CheckCircle2 },
  { value: "mixed", label: "Kombinirano", desc: "Mešanica obeh tipov", icon: Shuffle },
];

type QuestionEditorProps = {
  index: number;
  formQuestion: string;
  setFormQuestion: (v: string) => void;
  formType: "multiple_choice" | "true_false";
  onTypeChange: (type: "multiple_choice" | "true_false") => void;
  formOptions: string[];
  setFormOptions: (v: string[]) => void;
  formCorrectAnswer: string;
  setFormCorrectAnswer: (v: string) => void;
  formExplanation: string;
  setFormExplanation: (v: string) => void;
  error: string;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
};

const QuestionEditor = ({
  index,
  formQuestion,
  setFormQuestion,
  formType,
  onTypeChange,
  formOptions,
  setFormOptions,
  formCorrectAnswer,
  setFormCorrectAnswer,
  formExplanation,
  setFormExplanation,
  error,
  saving,
  onSave,
  onCancel,
}: QuestionEditorProps) => {
  const updateOption = (i: number, value: string) => {
    const next = [...formOptions];
    const prev = next[i];
    next[i] = value;
    setFormOptions(next);
    if (formCorrectAnswer === prev) setFormCorrectAnswer(value);
  };

  return (
    <div className="rounded-2xl border-2 border-violet-300 bg-violet-50/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
          Urejanje vprašanja
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Besedilo vprašanja</label>
        <textarea
          value={formQuestion}
          onChange={(e) => setFormQuestion(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tip vprašanja</label>
        <div className="grid grid-cols-2 gap-2">
          {(["multiple_choice", "true_false"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                formType === t
                  ? "border-violet-400 bg-violet-100 text-violet-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "multiple_choice" ? "Večkratni izbor" : "Res / Ni res"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Možnosti <span className="font-normal text-slate-400">(izberi pravilen odgovor)</span>
        </label>
        <div className="space-y-1.5">
          {formOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setFormCorrectAnswer(opt)}
                title="Označi kot pravilen odgovor"
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                  formCorrectAnswer === opt && opt !== ""
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300 bg-white"
                }`}
              >
                {formCorrectAnswer === opt && opt !== "" && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </button>
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                disabled={formType === "true_false"}
                placeholder={`Možnost ${i + 1}`}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Razlaga (neobvezno)</label>
        <textarea
          value={formExplanation}
          onChange={(e) => setFormExplanation(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
        >
          Prekliči
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-violet-500 hover:bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
        >
          {saving ? "Shranjujem..." : "Shrani vprašanje"}
        </button>
      </div>
    </div>
  );
};

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

  // Step 4 — question editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formType, setFormType] = useState<"multiple_choice" | "true_false">("multiple_choice");
  const [formOptions, setFormOptions] = useState<string[]>(["", "", "", ""]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("");
  const [formExplanation, setFormExplanation] = useState("");

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

  const resetForm = () => {
    setFormQuestion("");
    setFormType("multiple_choice");
    setFormOptions(["", "", "", ""]);
    setFormCorrectAnswer("");
    setFormExplanation("");
    setQuestionError("");
  };

  const startEditQuestion = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setPreviewOpen(null);
    setFormQuestion(q.question);
    setFormType(q.question_type);
    setFormOptions(q.question_type === "multiple_choice" ? (q.options ?? ["", "", "", ""]) : ["Res", "Ni res"]);
    setFormCorrectAnswer(q.correct_answer);
    setFormExplanation(q.explanation ?? "");
    setQuestionError("");
  };

  const startAddQuestion = () => {
    resetForm();
    setEditingQuestionId("new");
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    resetForm();
  };

  const handleFormTypeChange = (type: "multiple_choice" | "true_false") => {
    setFormType(type);
    setFormCorrectAnswer("");
    setFormOptions(type === "true_false" ? ["Res", "Ni res"] : ["", "", "", ""]);
  };

  const handleSaveQuestion = async () => {
    if (!generatedQuiz) return;
    if (!formQuestion.trim()) { setQuestionError("Besedilo vprašanja je obvezno."); return; }
    if (!formCorrectAnswer) { setQuestionError("Izberi pravilen odgovor."); return; }

    const cleanOptions = formType === "multiple_choice"
      ? formOptions.map((o) => o.trim()).filter(Boolean)
      : ["Res", "Ni res"];

    if (formType === "multiple_choice" && cleanOptions.length < 2) {
      setQuestionError("Vprašanje potrebuje vsaj 2 možnosti.");
      return;
    }
    if (!cleanOptions.includes(formCorrectAnswer)) {
      setQuestionError("Pravilen odgovor mora ustrezati eni od možnosti.");
      return;
    }

    setSavingQuestion(true);
    setQuestionError("");

    const payload = {
      question: formQuestion.trim(),
      question_type: formType,
      options: cleanOptions,
      correct_answer: formCorrectAnswer,
      explanation: formExplanation.trim() || null,
    };

    try {
      if (editingQuestionId === "new") {
        const res = await api.post(`/subject-quizzes/${generatedQuiz.id}/questions`, payload);
        const newQuestion: QuizQuestion = res.data.question;
        setGeneratedQuiz({
          ...generatedQuiz,
          quiz_questions: [...(generatedQuiz.quiz_questions ?? []), newQuestion],
          question_count: (generatedQuiz.quiz_questions?.length ?? 0) + 1,
        });
      } else if (editingQuestionId) {
        const res = await api.put(`/subject-quizzes/${generatedQuiz.id}/questions/${editingQuestionId}`, payload);
        const updatedQuestion: QuizQuestion = res.data.question;
        setGeneratedQuiz({
          ...generatedQuiz,
          quiz_questions: (generatedQuiz.quiz_questions ?? []).map((q) =>
            q.id === editingQuestionId ? updatedQuestion : q
          ),
        });
      }
      setEditingQuestionId(null);
      resetForm();
    } catch (err: any) {
      setQuestionError(err?.response?.data?.message ?? "Napaka pri shranjevanju vprašanja.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!generatedQuiz) return;
    if ((generatedQuiz.quiz_questions ?? []).length <= 1) {
      setQuestionError("Kviz mora imeti vsaj eno vprašanje.");
      return;
    }
    if (!confirm("Izbriši to vprašanje?")) return;

    setDeletingQuestionId(questionId);
    try {
      await api.delete(`/subject-quizzes/${generatedQuiz.id}/questions/${questionId}`);
      setGeneratedQuiz({
        ...generatedQuiz,
        quiz_questions: (generatedQuiz.quiz_questions ?? []).filter((q) => q.id !== questionId),
        question_count: (generatedQuiz.quiz_questions?.length ?? 1) - 1,
      });
    } catch (err: any) {
      setQuestionError(err?.response?.data?.message ?? "Napaka pri brisanju vprašanja.");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const selectedLessons = lessons.filter((l) => selectedLessonIds.has(l.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} />
                AI Kviz Generator
              </span>
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
            aria-label="Zapri generator kviza"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
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
                  <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" strokeWidth={2.25} />
                  </div>
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
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
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
                  {QUESTION_TYPE_OPTIONS.map((opt) => {
                    const OptionIcon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setQuestionType(opt.value)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          questionType === opt.value
                            ? "border-violet-400 bg-violet-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className={`mb-2 w-9 h-9 rounded-xl flex items-center justify-center ${
                          questionType === opt.value ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <OptionIcon className="w-4 h-4" strokeWidth={2.25} />
                        </div>
                        <p className={`text-xs font-semibold ${questionType === opt.value ? "text-violet-800" : "text-slate-700"}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
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
                <div className="absolute inset-0 flex items-center justify-center text-violet-600">
                  <Sparkles className="w-5 h-5" strokeWidth={2.25} />
                </div>
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
                  <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.25} />
                  {generatedQuiz.quiz_questions?.length ?? 0} vprašanj
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <Clock3 className="w-3.5 h-3.5" strokeWidth={2.25} />
                  {generatedQuiz.time_limit_minutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                  Generirano
                </span>
              </div>

              {questionError && editingQuestionId === null && (
                <p className="text-sm text-rose-500 font-medium mb-3">{questionError}</p>
              )}

              {/* Questions list */}
              <div className="space-y-3">
                {(generatedQuiz.quiz_questions ?? []).map((q, idx) =>
                  editingQuestionId === q.id ? (
                    <QuestionEditor
                      key={q.id}
                      index={idx}
                      formQuestion={formQuestion}
                      setFormQuestion={setFormQuestion}
                      formType={formType}
                      onTypeChange={handleFormTypeChange}
                      formOptions={formOptions}
                      setFormOptions={setFormOptions}
                      formCorrectAnswer={formCorrectAnswer}
                      setFormCorrectAnswer={setFormCorrectAnswer}
                      formExplanation={formExplanation}
                      setFormExplanation={setFormExplanation}
                      error={questionError}
                      saving={savingQuestion}
                      onSave={handleSaveQuestion}
                      onCancel={cancelEditQuestion}
                    />
                  ) : (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                    >
                      <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                        <button
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                          onClick={() => setPreviewOpen(previewOpen === q.id ? null : q.id)}
                        >
                          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-800 truncate">{q.question}</span>
                        </button>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                            q.question_type === "multiple_choice"
                              ? "bg-sky-50 text-sky-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {q.question_type === "multiple_choice" ? "Večkratni" : "Res/Ni res"}
                          </span>
                          <button
                            onClick={() => startEditQuestion(q)}
                            title="Uredi vprašanje"
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-violet-100 hover:text-violet-700 text-slate-500 flex items-center justify-center transition"
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={2.25} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            disabled={deletingQuestionId === q.id}
                            title="Izbriši vprašanje"
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition disabled:opacity-50"
                          >
                            {deletingQuestionId === q.id ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                            )}
                          </button>
                        </div>
                      </div>
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
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                                  )}
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.explanation && (
                            <p className="text-xs text-slate-500 italic inline-flex items-start gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2.25} />
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {editingQuestionId === "new" && (
                  <QuestionEditor
                    index={(generatedQuiz.quiz_questions ?? []).length}
                    formQuestion={formQuestion}
                    setFormQuestion={setFormQuestion}
                    formType={formType}
                    onTypeChange={handleFormTypeChange}
                    formOptions={formOptions}
                    setFormOptions={setFormOptions}
                    formCorrectAnswer={formCorrectAnswer}
                    setFormCorrectAnswer={setFormCorrectAnswer}
                    formExplanation={formExplanation}
                    setFormExplanation={setFormExplanation}
                    error={questionError}
                    saving={savingQuestion}
                    onSave={handleSaveQuestion}
                    onCancel={cancelEditQuestion}
                  />
                )}
              </div>

              {editingQuestionId === null && (
                <button
                  onClick={startAddQuestion}
                  className="mt-3 w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-violet-700 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Dodaj vprašanje
                </button>
              )}
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
                className="rounded-2xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                Naprej
                <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
              </button>
            </>
          )}
          {step === "config" && (
            <>
              <button onClick={() => setStep("lessons")} className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" strokeWidth={2.25} />
                Nazaj
              </button>
              <button
                onClick={handleConfigNext}
                className="rounded-2xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2.25} />
                Generiraj s Gemini
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
                disabled={editingQuestionId !== null}
                title={editingQuestionId !== null ? "Najprej zaključi urejanje vprašanja" : undefined}
                className="rounded-2xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
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
