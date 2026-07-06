import React from "react";
import { ArrowRight, Eye, Headphones, Layers, PersonStanding, RotateCcw } from "lucide-react";
import {
  learningTypeResults,
  learningTypes,
  LearningType,
  LearningTypeCalculation,
} from "../../data/quizQuestions";

interface QuizResultProps {
  result: LearningTypeCalculation;
  onRetake: () => void;
  onContinue?: (type: LearningType) => void;
}

const TYPE_ICONS = {
  visual: Eye,
  auditory: Headphones,
  kinesthetic: PersonStanding,
} satisfies Record<LearningType, typeof Eye>;

export const QuizResult: React.FC<QuizResultProps> = ({ result, onRetake, onContinue }) => {
  const main = learningTypeResults[result.type];
  const ResultIcon = result.isMultimodal ? Layers : TYPE_ICONS[result.type];

  return (
    <div className="quiz-result">
      <div className="result-header">
        <div className="result-icon" style={{ color: main.color, background: main.background }}>
          <ResultIcon size={34} strokeWidth={2.1} />
        </div>
        <p className="result-label">Tvoj rezultat</p>
        <h2 className="result-type-name" style={{ color: main.color }}>
          {result.profileLabel}
        </h2>
        <p className="result-description">{result.profileDescription}</p>
        {result.isMultimodal && (
          <p className="result-save-note">
            Za prilagoditev lekcij bo shranjen profil: <strong>{main.label}</strong>.
          </p>
        )}
      </div>

      <div className="score-bars">
        {learningTypes.map((type) => {
          const info = learningTypeResults[type];
          const Icon = TYPE_ICONS[type];
          const pct = result.percentage[type];
          const isMain = type === result.type;
          return (
            <div key={type} className={`score-bar-row ${isMain ? "score-bar-main" : ""}`}>
              <span
                className="score-bar-icon"
                style={{ color: info.color, background: info.background }}
                aria-hidden="true"
              >
                <Icon size={17} strokeWidth={2.2} />
              </span>
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

      <div className="result-section">
        <h3 className="result-section-title">Močne strani</h3>
        <ul className="result-list">
          {main.strengths.map((strength) => (
            <li key={strength} className="result-list-item">
              <span className="list-dot" style={{ background: main.color }} />
              {strength}
            </li>
          ))}
        </ul>
      </div>

      <div className="result-section">
        <h3 className="result-section-title">Strategije za učenje</h3>
        <ul className="result-list">
          {main.tips.map((tip) => (
            <li key={tip} className="result-list-item">
              <span className="list-dot" style={{ background: main.color }} />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="result-actions">
        {onContinue && (
          <button
            className="btn-primary"
            onClick={() => onContinue(result.type)}
            style={{ background: main.color }}
          >
            Nadaljuj v LearnSmart
            <ArrowRight size={18} strokeWidth={2.25} />
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
