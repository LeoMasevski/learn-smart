import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import { QuizQuestion as QuizQuestionType, LearningType } from "../../data/quizQuestions";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  progress: number;
  selectedTypes: LearningType[];
  onAnswer: (questionId: number, types: LearningType[]) => void;
  onBack: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  progress,
  selectedTypes,
  onAnswer,
  onBack,
}) => {
  const initialSelectedIds = useMemo(
    () =>
      question.options
        .filter((option) => selectedTypes.includes(option.type))
        .map((option) => option.id),
    [question.options, selectedTypes]
  );
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setSelected(initialSelectedIds);
    setAnimateIn(false);
    const t = window.setTimeout(() => setAnimateIn(true), 30);
    return () => window.clearTimeout(t);
  }, [question.id, initialSelectedIds]);

  const handleToggle = (optionId: string) => {
    setSelected((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  };

  const handleContinue = () => {
    const selectedQuestionTypes = question.options
      .filter((option) => selected.includes(option.id))
      .map((option) => option.type);

    if (selectedQuestionTypes.length === 0) return;
    onAnswer(question.id, selectedQuestionTypes);
  };

  return (
    <div className={`quiz-question ${animateIn ? "slide-in" : ""}`}>
      <div className="progress-bar-wrap">
        <div className="progress-bar-track" aria-hidden="true">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-label">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      <div className="question-body">
        <span className="question-number">Vprašanje {questionNumber}</span>
        <h2 className="question-text">{question.question}</h2>
        <p className="question-hint">Izberi enega ali več odgovorov.</p>
      </div>

      <div className="options-list">
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={`option-btn ${isSelected ? "option-selected" : ""} option-${option.type}`}
              onClick={() => handleToggle(option.id)}
              aria-pressed={isSelected}
            >
              <span className="option-letter">{OPTION_LETTERS[index]}</span>
              <span className="option-text">{option.text}</span>
              <span className="option-check-wrap" aria-hidden="true">
                {isSelected && <Check className="option-check" size={16} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="question-actions">
        <button className="btn-back" type="button" onClick={onBack}>
          <ChevronLeft size={16} />
          Nazaj
        </button>
        <button
          className="btn-primary question-next"
          type="button"
          onClick={handleContinue}
          disabled={selected.length === 0}
        >
          {questionNumber === totalQuestions ? "Prikaži rezultat" : "Nadaljuj"}
          <ArrowRight size={18} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
};
