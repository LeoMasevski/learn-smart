import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { QuizQuestion as QuizQuestionType, LearningType } from '../../data/quizQuestions';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  progress: number;
  onAnswer: (questionId: number, type: LearningType) => void;
  onBack: () => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  progress,
  onAnswer,
  onBack,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Reset & animate when question changes
  useEffect(() => {
    setSelected(null);
    setAnimateIn(false);
    const t = setTimeout(() => setAnimateIn(true), 30);
    return () => clearTimeout(t);
  }, [question.id]);

  const handleSelect = (optionId: string, type: LearningType) => {
    if (selected) return;
    setSelected(optionId);
    setTimeout(() => onAnswer(question.id, type), 340);
  };

  return (
    <div className={`quiz-question ${animateIn ? 'slide-in' : ''}`}>
      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-label">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Vprašanje */}
      <div className="question-body">
        <span className="question-number">Vprašanje {questionNumber}</span>
        <h2 className="question-text">{question.question}</h2>
      </div>

      {/* Opcije */}
      <div className="options-list">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isOther = selected !== null && selected !== option.id;
          return (
            <button
              key={option.id}
              className={`option-btn
                ${isSelected ? 'option-selected' : ''}
                ${isOther ? 'option-faded' : ''}
                option-${option.type}`}
              onClick={() => handleSelect(option.id, option.type)}
              disabled={!!selected}
            >
              <span className="option-letter">
                {option.id.slice(-1).toUpperCase()}
              </span>
              <span className="option-text">{option.text}</span>
              {isSelected && <span className="option-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Nazaj */}
      <button className="btn-back" onClick={onBack}>
        <ChevronLeft size={16} />
        Nazaj
      </button>
    </div>
  );
};
