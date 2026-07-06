import React from "react";
import { ArrowRight, Brain, CheckCircle, Clock, Eye, Headphones, PersonStanding } from "lucide-react";

interface QuizIntroProps {
  onStart: () => void;
}

export const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
  return (
    <div className="quiz-intro">
      <div className="intro-icon-wrap">
        <Brain className="intro-brain-icon" />
      </div>

      <h2 className="intro-title">Kako naj se LearnSmart prilagodi tebi?</h2>
      <p className="intro-subtitle">
        Odgovori na kratke situacijske izbire. Pri vsakem vprašanju lahko izbereš več odgovorov,
        če se ti zdi, da zate velja več pristopov.
      </p>

      <div className="intro-pills" aria-label="Podrobnosti kviza">
        <div className="pill">
          <Clock size={16} />
          <span>3 minute</span>
        </div>
        <div className="pill">
          <CheckCircle size={16} />
          <span>12 vprašanj</span>
        </div>
        <div className="pill">
          <Brain size={16} />
          <span>3 profili</span>
        </div>
      </div>

      <div className="intro-types">
        <div className="type-card type-visual">
          <Eye size={22} strokeWidth={2.25} />
          <span className="type-name">Vizualni</span>
        </div>
        <div className="type-card type-auditory">
          <Headphones size={22} strokeWidth={2.25} />
          <span className="type-name">Slušni</span>
        </div>
        <div className="type-card type-kinesthetic">
          <PersonStanding size={22} strokeWidth={2.25} />
          <span className="type-name">Kinestetični</span>
        </div>
      </div>

      <button className="btn-primary" onClick={onStart}>
        Začni kviz
        <ArrowRight size={18} strokeWidth={2.25} />
      </button>

      <p className="intro-note">
        Rezultat je začetna usmeritev za izbiro strategij, ne trajna oznaka.
      </p>
    </div>
  );
};
