import { useState, useCallback } from 'react';
import {
  quizQuestions,
  calculateLearningType,
  LearningType,
} from '../data/quizQuestions';

export type QuizPhase = 'intro' | 'questions' | 'result';

export interface QuizState {
  phase: QuizPhase;
  currentQuestion: number;
  answers: Record<number, LearningType>;
  result: ReturnType<typeof calculateLearningType> | null;
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>({
    phase: 'intro',
    currentQuestion: 0,
    answers: {},
    result: null,
  });

  const startQuiz = useCallback(() => {
    setState({ phase: 'questions', currentQuestion: 0, answers: {}, result: null });
  }, []);

  const answerQuestion = useCallback((questionId: number, type: LearningType) => {
    setState((prev) => {
      const newAnswers = { ...prev.answers, [questionId]: type };
      const isLast = prev.currentQuestion === quizQuestions.length - 1;

      if (isLast) {
        const result = calculateLearningType(newAnswers);
        return { ...prev, answers: newAnswers, phase: 'result', result };
      }

      return { ...prev, answers: newAnswers, currentQuestion: prev.currentQuestion + 1 };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestion === 0) return { ...prev, phase: 'intro' };
      const newAnswers = { ...prev.answers };
      delete newAnswers[quizQuestions[prev.currentQuestion - 1].id];
      return { ...prev, currentQuestion: prev.currentQuestion - 1, answers: newAnswers };
    });
  }, []);

  const retakeQuiz = useCallback(() => {
    setState({ phase: 'intro', currentQuestion: 0, answers: {}, result: null });
  }, []);

  const progress =
    state.phase === 'questions'
      ? Math.round((state.currentQuestion / quizQuestions.length) * 100)
      : state.phase === 'result'
      ? 100
      : 0;

  return {
    ...state,
    totalQuestions: quizQuestions.length,
    currentQuestionData: quizQuestions[state.currentQuestion] ?? null,
    progress,
    startQuiz,
    answerQuestion,
    goBack,
    retakeQuiz,
  };
}
