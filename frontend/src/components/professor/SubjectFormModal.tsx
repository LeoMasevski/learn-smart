import { useState } from "react";
import { api } from "../../api/api";
import type { Subject } from "../../types/professor";

type Props = {
  subject: Subject | null;
  onClose: () => void;
  onSaved: () => void;
};

const SubjectFormModal = ({ subject, onClose, onSaved }: Props) => {
  const [name, setName] = useState(subject?.name || "");
  const [description, setDescription] = useState(subject?.description || "");

  const saveSubject = async () => {
    if (!name.trim()) {
      alert("Vnesi ime predmeta.");
      return;
    }

    if (subject) {
      await api.put(`/subjects/${subject.id}`, { name, description });
    } else {
      await api.post("/subjects", { name, description });
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {subject ? "Uredi predmet" : "Dodaj predmet"}
        </h2>

        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Ime predmeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-32"
          placeholder="Opis predmeta"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="bg-slate-100 px-5 py-3 rounded-xl">
            Prekliči
          </button>

          <button
            onClick={saveSubject}
            className="bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Shrani
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectFormModal;