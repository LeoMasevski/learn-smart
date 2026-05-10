import React from 'react';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizIntro } from './QuizIntro';
import { QuizQuestion } from './QuizQuestion';
import { QuizResult } from './QuizResult';
import { LearningType } from '../../data/quizQuestions';
import '../../styles/quiz.css';

interface LearningTypeQuizProps {
  onComplete?: (learningType: LearningType) => void;
}

// Navigacija
const NAV_ITEMS = [
  { label: 'Moji predmeti', emoji: '📚', key: 'subjects' },
  { label: 'Kvizi',         emoji: '⭐', key: 'quizzes' },
  { label: 'Rezultati',     emoji: '🏆', key: 'results' },
  { label: 'Profil',        emoji: '👤', key: 'profile' },
];

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
        <div className="sidebar-logo">LearnSmart</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${item.key === 'quizzes' ? 'active' : ''}`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </nav>
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
