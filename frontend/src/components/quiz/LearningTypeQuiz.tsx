import React from "react";
import { GraduationCap } from "lucide-react";
import { useQuiz } from "../../hooks/useQuiz";
import { QuizIntro } from "./QuizIntro";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResult } from "./QuizResult";
import { LearningType } from "../../data/quizQuestions";
import "../../styles/quiz.css";

interface LearningTypeQuizProps {
  onComplete?: (learningType: LearningType) => void;
}

export const LearningTypeQuiz: React.FC<LearningTypeQuizProps> = ({ onComplete }) => {
  const {
    phase,
    currentQuestion,
    currentQuestionData,
    answers,
    totalQuestions,
    progress,
    result,
    startQuiz,
    answerQuestion,
    goBack,
    retakeQuiz,
  } = useQuiz();

  const pageTitle = phase === "result" ? "Tvoj učni profil" : "Kviz učnega profila";
  const pageSubtitle =
    phase === "intro"
      ? "Odkrij, katere strategije ti najpogosteje pomagajo pri učenju."
      : phase === "result"
      ? "Rezultat je pripravljen. LearnSmart bo prilagodil vsebine tvojemu najmočnejšemu profilu."
      : `Vprašanje ${currentQuestion + 1} od ${totalQuestions}`;

  return (
    <div className="quiz-shell">
      <main className="quiz-main">
        <div className="quiz-card">
          <div className="quiz-card-header">
            <div className="quiz-brand">
              <GraduationCap size={20} strokeWidth={2.25} />
              <span>LearnSmart</span>
            </div>
            <div>
              <h1 className="page-title">{pageTitle}</h1>
              <p className="page-subtitle">{pageSubtitle}</p>
            </div>
          </div>

          {phase === "intro" && <QuizIntro onStart={startQuiz} />}

          {phase === "questions" && currentQuestionData && (
            <QuizQuestion
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              totalQuestions={totalQuestions}
              progress={progress}
              selectedTypes={answers[currentQuestionData.id] ?? []}
              onAnswer={answerQuestion}
              onBack={goBack}
            />
          )}

          {phase === "result" && result && (
            <QuizResult result={result} onRetake={retakeQuiz} onContinue={onComplete} />
          )}
        </div>
      </main>
    </div>
  );
};
