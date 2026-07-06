import { GraduationCap } from "lucide-react";

type BrandLogoProps = {
  subtitle?: string;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function BrandLogo({
  subtitle,
  compact = false,
  className = "",
  onClick,
}: BrandLogoProps) {
  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <GraduationCap className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.2} />
      </span>
      <span className="min-w-0">
        <span
          className={`block font-extrabold tracking-tight text-slate-900 ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          LearnSmart
        </span>
        {subtitle && (
          <span className="block text-xs font-medium leading-tight text-slate-400">
            {subtitle}
          </span>
        )}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 text-left transition hover:opacity-80 ${className}`}
        aria-label="Pojdi na zacetno stran"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {content}
    </div>
  );
}
