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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveSubject = async () => {
    if (!name.trim()) {
      setError("Vnesi ime predmeta.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (subject) {
        await api.put(`/subjects/${subject.id}`, { name: name.trim(), description: description.trim() });
      } else {
        await api.post("/subjects", { name: name.trim(), description: description.trim() });
      }

      onSaved();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Napaka pri shranjevanju predmeta."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {subject ? "Uredi predmet" : "Dodaj predmet"}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {subject ? "Posodobi podatke predmeta." : "Ustvari nov predmet za učno gradivo."}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Ime predmeta <span className="text-red-400">*</span>
        </label>
        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:opacity-60"
          placeholder="npr. Uvod v programiranje"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          onKeyDown={(e) => e.key === "Enter" && saveSubject()}
        />

        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Opis predmeta <span className="text-slate-400 font-normal">(neobvezno)</span>
        </label>
        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-28 focus:outline-none focus:ring-2 focus:ring-violet-400 transition resize-y disabled:opacity-60"
          placeholder="Kratek opis vsebine predmeta..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-medium disabled:opacity-60 hover:bg-slate-200 transition"
          >
            Prekliči
          </button>
          <button
            onClick={saveSubject}
            disabled={saving}
            className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-violet-700 transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Shranjujem...
              </>
            ) : subject ? (
              "Shrani spremembe"
            ) : (
              "Ustvari predmet"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectFormModal;
