import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import { getSafeImageUrl } from "../../utils/security";

type Props = {
  title?: string;
  url: string;
  alt?: string;
};

export default function ImageBlock({ title, url, alt }: Props) {
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const safeUrl = getSafeImageUrl(url);
  const imageAlt = alt ?? title ?? "";

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  return (
    <div className="mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
        {error || !safeUrl ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Slika ni na voljo
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="group relative block w-full cursor-zoom-in bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              aria-label="Odpri sliko"
            >
              <img
                src={safeUrl}
                alt={imageAlt}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setError(true)}
                className="h-auto w-full object-contain"
              />
              <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>

            {expanded &&
              createPortal(
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 sm:p-6"
                  onClick={() => setExpanded(false)}
                  role="dialog"
                  aria-modal="true"
                  aria-label={title || "Slika"}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Zapri sliko"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <img
                    src={safeUrl}
                    alt={imageAlt}
                    referrerPolicy="no-referrer"
                    onClick={(event) => event.stopPropagation()}
                    className="max-h-[90vh] max-w-[96vw] object-contain shadow-2xl"
                  />
                </div>,
                document.body
              )}
          </>
        )}
      </div>
    </div>
  );
}
