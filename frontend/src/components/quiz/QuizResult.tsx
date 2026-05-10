import React from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { learningTypeResults, LearningType } from '../../data/quizQuestions';

interface QuizResultProps {
  result: {
    type: LearningType;
    scores: Record<LearningType, number>;
    percentage: Record<LearningType, number>;
  };
  onRetake: () => void;
  onContinue?: (type: LearningType) => void;
}

const TYPE_ORDER: LearningType[] = ['visual', 'auditory', 'kinesthetic'];

export const QuizResult: React.FC<QuizResultProps> = ({ result, onRetake, onContinue }) => {
  const main = learningTypeResults[result.type];

  return (
    <div className="quiz-result">
      <div className="result-header">
        <div className="result-emoji">{main.emoji}</div>
        <p className="result-label">Tvoj učni tip je</p>
        <h1 className="result-type-name" style={{ color: main.color }}>
          {main.label}
        </h1>
        <p className="result-description">{main.description}</p>
      </div>

      {/* Navigacija za rezultat */}
      <div className="score-bars">
        {TYPE_ORDER.map((t) => {
          const info = learningTypeResults[t];
          const pct = result.percentage[t];
          const isMain = t === result.type;
          return (
            <div key={t} className={`score-bar-row ${isMain ? 'score-bar-main' : ''}`}>
              <span className="score-bar-emoji">{info.emoji}</span>
              <div className="score-bar-wrap">
                <div className="score-bar-label-row">
                  <span className="score-bar-name">{info.label}</span>
                  <span className="score-bar-pct">{pct}%</span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${pct}%`, background: info.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prednosti */}
      <div className="result-section">
        <h3 className="result-section-title">Tvoje prednosti</h3>
        <ul className="result-list">
          {main.strengths.map((s, i) => (
            <li key={i} className="result-list-item">
              <span className="list-dot" style={{ background: main.color }} />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Nasveti */}
      <div className="result-section">
        <h3 className="result-section-title">Nasveti za učenje</h3>
        <ul className="result-list">
          {main.tips.map((tip, i) => (
            <li key={i} className="result-list-item">
              <span className="list-dot" style={{ background: main.color }} />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Akcije */}
      <div className="result-actions">
        {onContinue && (
          <button
            className="btn-primary"
            onClick={() => onContinue(result.type)}
            style={{ background: main.color }}
          >
            Nadaljuj v LearnSmart
            <ArrowRight size={18} />
          </button>
        )}
        <button className="btn-secondary" onClick={onRetake}>
          <RotateCcw size={16} />
          Ponovi kviz
        </button>
      </div>
    </div>
  );
};
