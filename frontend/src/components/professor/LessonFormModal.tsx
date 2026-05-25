import { useState } from "react";
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveLesson = async () => {
    if (saving) return;

    if (!subjectId) {
      setError("Izberi predmet.");
      return;
    }

    if (!title.trim() || !originalContent.trim()) {
      setError("Vnesi naslov in vsebino gradiva.");
      return;
    }

    if (originalContent.trim().length < 20) {
      setError("Vsebina gradiva mora imeti vsaj 20 znakov.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        subjectId,
        title: `[${materialType}] ${title.trim()}`,
        originalContent: originalContent.trim(),
      };

      if (lesson) {
        await api.put(`/lessons/${lesson.id}`, payload);
      } else {
        await api.post("/lessons", payload);
      }

      onSaved();
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lesson ? "Uredi učno gradivo" : "Dodaj učno gradivo"}
        </h2>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4"
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

        <div className="mb-5 grid grid-cols-2 gap-3">
          {(["Prezentacija", "Dodatno gradivo"] as MaterialType[]).map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMaterialType(type)}
                disabled={saving}
                className={`rounded-2xl border px-4 py-3 font-semibold ${
                  materialType === type
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {type === "Prezentacija"
                  ? "📚 Prezentacija"
                  : "📄 Dodatno gradivo"}
              </button>
            )
          )}
        </div>

        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Naslov gradiva"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />

        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-48"
          placeholder="Vsebina učnega gradiva kot tekst..."
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          disabled={saving}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="bg-slate-100 px-5 py-3 rounded-xl disabled:opacity-60"
          >
            Prekliči
          </button>

          <button
            onClick={saveLesson}
            disabled={saving}
            className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Shranjujem..." : "Shrani"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonFormModal;