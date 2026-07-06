import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QuizQuestion } from "../../../components/quiz/QuizQuestion";
import type { QuizQuestion as QuizQuestionType } from "../../../data/quizQuestions";

const mockQuestion: QuizQuestionType = {
  id: 1,
  question: "Ko se učiš novo snov, kaj ti najbolj pomaga?",
  options: [
    { id: "1a", text: "Narisati shemo", type: "visual", points: 1 },
    { id: "1b", text: "Poslušati razlago", type: "auditory", points: 1 },
    { id: "1c", text: "Sam preizkusiti", type: "kinesthetic", points: 1 },
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
        selectedTypes={[]}
        onAnswer={onAnswer}
        onBack={onBack}
        {...props}
      />
    );

  it("renders the question text", () => {
    renderQuestion();
    expect(screen.getByText("Ko se učiš novo snov, kaj ti najbolj pomaga?")).toBeInTheDocument();
  });

  it("renders all answer options", () => {
    renderQuestion();
    expect(screen.getByText("Narisati shemo")).toBeInTheDocument();
    expect(screen.getByText("Poslušati razlago")).toBeInTheDocument();
    expect(screen.getByText("Sam preizkusiti")).toBeInTheDocument();
  });

  it("renders progress as X / total", () => {
    renderQuestion();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("calls onAnswer with all selected learning types when continuing", () => {
    renderQuestion();
    fireEvent.click(screen.getByText("Narisati shemo"));
    fireEvent.click(screen.getByText("Sam preizkusiti"));
    fireEvent.click(screen.getByText("Nadaljuj"));

    expect(onAnswer).toHaveBeenCalledWith(1, ["visual", "kinesthetic"]);
  });

  it("does not continue until at least one option is selected", () => {
    renderQuestion();
    const nextButton = screen.getByText("Nadaljuj").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("allows a selected option to be toggled off", () => {
    renderQuestion();
    const option = screen.getByText("Narisati shemo");

    fireEvent.click(option);
    fireEvent.click(option);

    const nextButton = screen.getByText("Nadaljuj").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("calls onBack when the Nazaj button is clicked", () => {
    renderQuestion();
    fireEvent.click(screen.getByText(/Nazaj/i));
    expect(onBack).toHaveBeenCalled();
  });

  it("loads previous selections when question props change", () => {
    const { rerender } = renderQuestion();

    const newQuestion: QuizQuestionType = {
      ...mockQuestion,
      id: 2,
      question: "Novo vprašanje",
      options: [
        { id: "2a", text: "Opcija A", type: "visual", points: 1 },
        { id: "2b", text: "Opcija B", type: "auditory", points: 1 },
        { id: "2c", text: "Opcija C", type: "kinesthetic", points: 1 },
      ],
    };

    rerender(
      <QuizQuestion
        question={newQuestion}
        questionNumber={2}
        totalQuestions={5}
        progress={40}
        selectedTypes={["auditory"]}
        onAnswer={onAnswer}
        onBack={onBack}
      />
    );

    act(() => {
      vi.advanceTimersByTime(40);
    });

    expect(screen.getByText("Opcija B").closest("button")).toHaveAttribute("aria-pressed", "true");
  });
});
