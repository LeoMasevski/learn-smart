import { useState } from "react";

type Props = {
  title?: string;
  url: string;
  alt?: string;
};

export default function ImageBlock({ title, url, alt }: Props) {
  const [error, setError] = useState(false);

  return (
    <div className="mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          {title}
        </p>
      )}
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
        {error ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Slika ni na voljo
          </div>
        ) : (
          <img
            src={url}
            alt={alt ?? title ?? ""}
            onError={() => setError(true)}
            className="w-full object-cover max-h-72 sm:max-h-96"
          />
        )}
      </div>
    </div>
  );
}