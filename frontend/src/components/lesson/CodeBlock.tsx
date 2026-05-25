import { useState } from "react";

type Props = {
  title?: string;
  language?: string;
  content: string;
};

export default function CodeBlock({ title, language, content }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 ml-2">
            {title ?? language ?? "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-gray-700"
        >
          {copied ? "Kopirano ✓" : "Kopiraj"}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 text-xs sm:text-sm p-4 overflow-x-auto leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  );
}