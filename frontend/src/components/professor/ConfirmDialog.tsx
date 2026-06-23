type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Potrdi",
  cancelLabel = "Prekliči",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            variant === "danger" ? "bg-red-50" : "bg-amber-50"
          }`}
        >
          <svg
            className={`w-6 h-6 ${variant === "danger" ? "text-red-500" : "text-amber-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">{title}</h2>
        <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white px-4 py-3 rounded-xl font-semibold transition text-sm ${
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
