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

  const [materialType, setMaterialType] =
    useState<MaterialType>("Prezentacija");

  const cleanTitle = lesson?.title
    ?.replace("[Prezentacija] ", "")
    ?.replace("[Dodatno gradivo] ", "");

  const [title, setTitle] = useState(cleanTitle || "");
  const [originalContent, setOriginalContent] = useState(
    lesson?.original_content || ""
  );

  const saveLesson = async () => {
    if (!subjectId) {
      alert("Izberi predmet.");
      return;
    }

    if (!title.trim() || !originalContent.trim()) {
      alert("Vnesi naslov in vsebino gradiva.");
      return;
    }

    const payload = {
      subjectId,
      title: `[${materialType}] ${title}`,
      originalContent,
    };

    if (lesson) {
      await api.put(`/lessons/${lesson.id}`, payload);
    } else {
      await api.post("/lessons", payload);
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {lesson ? "Uredi učno gradivo" : "Dodaj učno gradivo"}
        </h2>

        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
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
        />

        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-48"
          placeholder="Vsebina učnega gradiva kot tekst..."
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="bg-slate-100 px-5 py-3 rounded-xl">
            Prekliči
          </button>

          <button
            onClick={saveLesson}
            className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Shrani
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonFormModal;