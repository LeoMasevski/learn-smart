import { useState } from "react";
import { api } from "../../api/api";
import type { Lesson } from "../../types/professor";

type Props = {
  subjectId: string;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
};

const LessonFormModal = ({ subjectId, lesson, onClose, onSaved }: Props) => {
  const [title, setTitle] = useState(lesson?.title || "");
  const [originalContent, setOriginalContent] = useState(
    lesson?.original_content || ""
  );

  const saveLesson = async () => {
    if (!title.trim() || !originalContent.trim()) {
      alert("Vnesi naslov in učno gradivo.");
      return;
    }

    if (lesson) {
      await api.put(`/lessons/${lesson.id}`, {
        subjectId,
        title,
        originalContent,
      });
    } else {
      await api.post("/lessons", {
        subjectId,
        title,
        originalContent,
      });
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {lesson ? "Uredi učno gradivo" : "Dodaj učno gradivo"}
        </h2>

        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Naslov lekcije"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-48"
          placeholder="Učno gradivo kot tekst..."
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