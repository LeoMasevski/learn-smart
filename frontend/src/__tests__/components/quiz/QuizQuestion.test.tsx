import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuizQuestion } from '../../../components/quiz/QuizQuestion';
import type { QuizQuestion as QuizQuestionType } from '../../../data/quizQuestions';

const mockQuestion: QuizQuestionType = {
  id: 1,
  question: 'Ko se učiš novo snov, ti najbolj pomaga?',
  options: [
    { id: '1a', text: 'Brati razlago', type: 'visual', points: 1 },
    { id: '1b', text: 'Poslušati razlago', type: 'auditory', points: 1 },
    { id: '1c', text: 'Sam preizkusiti', type: 'kinesthetic', points: 1 },
  ],
};

describe("QuizQuestion", () => {
  const onAnswer = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    onAnswer.mockClear();
    onBack.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderQuestion = (props = {}) =>
    render(
      <QuizQuestion
        question={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        progress={20}
        onAnswer={onAnswer}
        onBack={onBack}
        {...props}
      />
    );

  it("renders the question text", () => {
    renderQuestion();
    expect(screen.getByText("Ko se učiš novo snov, ti najbolj pomaga?")).toBeInTheDocument();
  });

  it("renders all answer options", () => {
    renderQuestion();
    expect(screen.getByText("Brati razlago")).toBeInTheDocument();
    expect(screen.getByText("Poslušati razlago")).toBeInTheDocument();
    expect(screen.getByText("Sam preizkusiti")).toBeInTheDocument();
  });

  it("renders progress as X / total", () => {
    renderQuestion();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("calls onAnswer with the correct learning type after selecting an option", async () => {
    renderQuestion();
    fireEvent.click(screen.getByText("Brati razlago"));
    act(() => { vi.advanceTimersByTime(400); });
    expect(onAnswer).toHaveBeenCalledWith(1, 'visual');
  });

  it("disables all options after one is selected (no double-selecting)", () => {
    renderQuestion();
    const options = screen.getAllByRole('button').filter(b => !b.textContent?.includes('Nazaj'));
    fireEvent.click(options[0]);
    options.forEach(opt => expect(opt).toBeDisabled());
  });

  it("calls onBack when the Nazaj button is clicked", () => {
    renderQuestion();
    fireEvent.click(screen.getByText(/Nazaj/i));
    expect(onBack).toHaveBeenCalled();
  });

  it("resets selection when question prop changes", () => {
    const { rerender } = renderQuestion();
    fireEvent.click(screen.getByText("Brati razlago"));

    const newQuestion: QuizQuestionType = {
      ...mockQuestion,
      id: 2,
      question: 'Novo vprašanje',
      options: [
        { id: '2a', text: 'Opcija A', type: 'visual', points: 1 },
        { id: '2b', text: 'Opcija B', type: 'auditory', points: 1 },
      ],
    };

    rerender(
      <QuizQuestion
        question={newQuestion}
        questionNumber={2}
        totalQuestions={5}
        progress={40}
        onAnswer={onAnswer}
        onBack={onBack}
      />
    );

    const buttons = screen.getAllByRole('button').filter(b => !b.textContent?.includes('Nazaj'));
    expect(buttons[0]).not.toBeDisabled();
  });
});
