import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type Props = {
  title?: string;
  questions: Question[];
};

export default function QuizBlock({ title, questions }: Props) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.filter((q, i) => selected[i] === q.correctAnswer).length
    : 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-4">
          {title}
        </p>
      )}

      <div className="flex flex-col gap-5">
        {questions.map((q, i) => (
          <div key={i}>
            <p className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
              {i + 1}. {q.question}
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => {
                const isSelected = selected[i] === opt;
                const isCorrect = opt === q.correctAnswer;
                let style =
                  "border border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50";
                if (submitted && isSelected && isCorrect)
                  style = "border border-green-400 bg-green-50 text-green-700";
                else if (submitted && isSelected && !isCorrect)
                  style = "border border-red-400 bg-red-50 text-red-700";
                else if (submitted && isCorrect)
                  style = "border border-green-300 bg-green-50/50 text-green-600";
                else if (isSelected)
                  style = "border-2 border-purple-500 bg-purple-50 text-purple-700";

                return (
                  <button
                    key={opt}
                    disabled={submitted}
                    onClick={() => setSelected((s) => ({ ...s, [i]: opt }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(selected).length < questions.length}
          className="mt-5 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-40"
        >
          Potrdi odgovore
        </button>
      ) : (
        <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-sm text-gray-600">
            Rezultat:{" "}
            <span className="font-bold text-purple-600">
              {score} / {questions.length}
            </span>
          </p>
          <button
            onClick={() => { setSelected({}); setSubmitted(false); }}
            className="text-xs text-purple-500 hover:underline font-semibold"
          >
            Ponovi
          </button>
        </div>
      )}
    </div>
  );
}