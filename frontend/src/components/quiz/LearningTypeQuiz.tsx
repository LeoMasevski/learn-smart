import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizIntro } from './QuizIntro';
import { QuizQuestion } from './QuizQuestion';
import { QuizResult } from './QuizResult';
import { LearningType } from '../../data/quizQuestions';
import '../../styles/quiz.css';

interface LearningTypeQuizProps {
  onComplete?: (learningType: LearningType) => void;
}

export const LearningTypeQuiz: React.FC<LearningTypeQuizProps> = ({ onComplete }) => {
  const {
    phase, currentQuestion, currentQuestionData,
    totalQuestions, progress, result,
    startQuiz, answerQuestion, goBack, retakeQuiz,
  } = useQuiz();

  const pageTitle = phase === 'result' ? 'Tvoj učni tip' : 'Kviz učnega tipa';
  const pageSubtitle =
    phase === 'intro'    ? 'Ugotovi, kako se najlažje učiš.' :
    phase === 'result'   ? 'Rezultati so pripravljeni. LearnSmart bo prilagodil vsebine zate.' :
                          `Vprašanje ${currentQuestion + 1} od ${totalQuestions}`;

  return (
    <div className="quiz-shell">
      {/* Stranski meni */}
      <aside className="quiz-sidebar">
        <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GraduationCap size={20} strokeWidth={2.25} />
          LearnSmart
        </div>
        <div className="sidebar-step-info">
          <p className="sidebar-step-label">
            {phase === 'intro' ? 'Korak 1: Uvod' : phase === 'questions' ? `Korak 2: Vprašanja` : 'Korak 3: Rezultat'}
          </p>
          <div className="sidebar-step-track">
            <div
              className="sidebar-step-fill"
              style={{ width: phase === 'intro' ? '5%' : phase === 'result' ? '100%' : `${Math.max(progress, 8)}%` }}
            />
          </div>
          <p className="sidebar-step-hint">
            Vsak študent najprej določi svoj učni tip, da LearnSmart prilagodi gradivo.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="quiz-main">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>

        <div className="quiz-card">
          {phase === 'intro' && <QuizIntro onStart={startQuiz} />}

          {phase === 'questions' && currentQuestionData && (
            <QuizQuestion
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              totalQuestions={totalQuestions}
              progress={progress}
              onAnswer={answerQuestion}
              onBack={goBack}
            />
          )}

          {phase === 'result' && result && (
            <QuizResult
              result={result}
              onRetake={retakeQuiz}
              onContinue={onComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
};