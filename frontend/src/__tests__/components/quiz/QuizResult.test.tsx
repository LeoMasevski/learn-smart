import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizResult } from '../../../components/quiz/QuizResult';

const mockResult = {
  type: 'visual' as const,
  scores: { visual: 5, auditory: 2, kinesthetic: 1 },
  percentage: { visual: 63, auditory: 25, kinesthetic: 12 },
};

describe("QuizResult", () => {
  const onRetake = vi.fn();
  const onContinue = vi.fn();

  it("displays the dominant learning type label in the heading", () => {
    render(<QuizResult result={mockResult} onRetake={onRetake} />);
    expect(screen.getByRole('heading', { name: /vizualni/i })).toBeInTheDocument();
  });

  it("shows percentage bars for all three types", () => {
    render(<QuizResult result={mockResult} onRetake={onRetake} />);
    expect(screen.getByText("63%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("calls onRetake when Ponovi kviz is clicked", () => {
    render(<QuizResult result={mockResult} onRetake={onRetake} />);
    fireEvent.click(screen.getByText(/Ponovi kviz/i));
    expect(onRetake).toHaveBeenCalled();
  });

  it("renders Nadaljuj button when onContinue is provided and calls it with learning type", () => {
    render(<QuizResult result={mockResult} onRetake={onRetake} onContinue={onContinue} />);
    const btn = screen.getByText(/Nadaljuj/i);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onContinue).toHaveBeenCalledWith('visual');
  });

  it("does not render Nadaljuj button when onContinue is not provided", () => {
    render(<QuizResult result={mockResult} onRetake={onRetake} />);
    expect(screen.queryByText(/Nadaljuj/i)).not.toBeInTheDocument();
  });

  it("shows strengths and tips from the result data", () => {
    render(<QuizResult result={mockResult} onRetake={onRetake} />);
    expect(screen.getByText(/Tvoje prednosti/i)).toBeInTheDocument();
    expect(screen.getByText(/Nasveti za učenje/i)).toBeInTheDocument();
  });
});
