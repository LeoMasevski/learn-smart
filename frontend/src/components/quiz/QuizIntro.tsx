import React from 'react';
import { Brain, Clock, CheckCircle } from 'lucide-react';

interface QuizIntroProps {
  onStart: () => void;
}

export const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
  return (
    <div className="quiz-intro">
      <div className="intro-icon-wrap">
        <Brain className="intro-brain-icon" />
      </div>

      <h1 className="intro-title">Kakšen si učenec?</h1>
      <p className="intro-subtitle">
        Odgovori na 12 kratkih vprašanj in ugotovi svoj učni tip.
        LearnSmart bo vsebine prilagodil točno tebi.
      </p>

      <div className="intro-pills">
        <div className="pill">
          <Clock size={16} />
          <span>~3 minute</span>
        </div>
        <div className="pill">
          <CheckCircle size={16} />
          <span>12 vprašanj</span>
        </div>
        <div className="pill">
          <Brain size={16} />
          <span>3 učni tipi</span>
        </div>
      </div>

      <div className="intro-types">
        <div className="type-card type-visual">
          <span className="type-emoji">👁️</span>
          <span className="type-name">Vizualni</span>
        </div>
        <div className="type-card type-auditory">
          <span className="type-emoji">🎧</span>
          <span className="type-name">Slušni</span>
        </div>
        <div className="type-card type-kinesthetic">
          <span className="type-emoji">🤲</span>
          <span className="type-name">Kinestetični</span>
        </div>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Začni kviz
        <span className="btn-arrow">→</span>
      </button>

      <p className="intro-note">
        Ni pravilnih ali napačnih odgovorov — izberi tisto, kar ti najbolj ustreza.
      </p>
    </div>
  );
};
