import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

type Props = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
};

const ICON_PATHS: Record<ToastType, string> = {
  success: "M5 13l4 4L19 7",
  error: "M6 18L18 6M6 6l12 12",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const BG: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-violet-500",
};

const Toast = ({ message, type = "success", onClose, duration = 3500 }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 ${BG[type]} text-white px-5 py-4 rounded-2xl shadow-2xl max-w-xs`}
    >
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[type]} />
        </svg>
      </div>
      <span className="font-semibold text-sm flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-70 hover:opacity-100 transition shrink-0"
        aria-label="Zapri"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
