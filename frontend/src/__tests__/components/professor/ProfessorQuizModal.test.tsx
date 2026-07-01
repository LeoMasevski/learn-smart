import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfessorQuizModal from '../../../components/professor/ProfessorQuizModal';
import type { Lesson, SubjectQuiz } from '../../../types/professor';
import * as apiModule from '../../../api/api';

vi.mock('../../../api/api', () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = apiModule.api as any;

const lessons: Lesson[] = [
  {
    id: 'lesson-1',
    subject_id: 'sub-1',
    title: 'Uvod v fiziko',
    original_content: 'Fizika je ...',
  },
  {
    id: 'lesson-2',
    subject_id: 'sub-1',
    title: 'Sila in gibanje',
    original_content: 'Newtonovi zakoni ...',
  },
];

const generatedQuiz: SubjectQuiz = {
  id: 'quiz-1',
  subject_id: 'sub-1',
  title: 'Kviz iz fizike',
  time_limit_minutes: 15,
  question_count: 2,
  question_type: 'multiple_choice',
  status: 'ready',
  created_by: 'prof-1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  quiz_lessons: [],
  quiz_questions: [
    {
      id: 'q-1',
      quiz_id: 'quiz-1',
      question: 'Kaj je sila?',
      options: ['Energija', 'Masa × pospešek', 'Hitrost', 'Tlak'],
      correct_answer: 'Masa × pospešek',
      question_type: 'multiple_choice',
      explanation: 'F = m × a',
      order_index: 0,
    },
    {
      id: 'q-2',
      quiz_id: 'quiz-1',
      question: 'Newton je enota za silo.',
      options: ['Res', 'Ni res'],
      correct_answer: 'Res',
      question_type: 'true_false',
      explanation: null,
      order_index: 1,
    },
  ],
};

const defaultProps = {
  subjectId: 'sub-1',
  lessons,
  onClose: vi.fn(),
  onCreated: vi.fn(),
};

async function renderAtPreview() {
  mockApi.post
    .mockResolvedValueOnce({ data: { quiz: { id: 'quiz-1' } } })
    .mockResolvedValueOnce({ data: { quiz: generatedQuiz } });

  render(<ProfessorQuizModal {...defaultProps} />);

  // Step 1: select a lesson
  fireEvent.click(screen.getByText('Uvod v fiziko'));
  fireEvent.click(screen.getByText('Naprej →'));

  // Step 2: fill title and generate
  fireEvent.change(screen.getByPlaceholderText(/npr\. Zaključni kviz/i), {
    target: { value: 'Kviz iz fizike' },
  });
  fireEvent.click(screen.getByText(/Generiraj s Gemini/i));

  // Step 4: wait for preview
  await waitFor(() => expect(screen.getByText('Predogled kviza')).toBeInTheDocument());
}

describe("ProfessorQuizModal — navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onClose.mockClear();
    defaultProps.onCreated.mockClear();
  });

  it("renders lesson selection on open", () => {
    render(<ProfessorQuizModal {...defaultProps} />);
    expect(screen.getByText('Izberi gradiva')).toBeInTheDocument();
    expect(screen.getByText('Uvod v fiziko')).toBeInTheDocument();
    expect(screen.getByText('Sila in gibanje')).toBeInTheDocument();
  });

  it("Naprej button is disabled until a lesson is selected", () => {
    render(<ProfessorQuizModal {...defaultProps} />);
    expect(screen.getByText('Naprej →')).toBeDisabled();
  });

  it("advances to config step after selecting a lesson", () => {
    render(<ProfessorQuizModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Uvod v fiziko'));
    fireEvent.click(screen.getByText('Naprej →'));
    expect(screen.getByText('Nastavi kviz')).toBeInTheDocument();
  });

  it("goes back to lesson selection from config step", () => {
    render(<ProfessorQuizModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Uvod v fiziko'));
    fireEvent.click(screen.getByText('Naprej →'));
    fireEvent.click(screen.getByText('← Nazaj'));
    expect(screen.getByText('Izberi gradiva')).toBeInTheDocument();
  });

  it("shows error when trying to generate without a title", async () => {
    render(<ProfessorQuizModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Uvod v fiziko'));
    fireEvent.click(screen.getByText('Naprej →'));
    fireEvent.click(screen.getByText(/Generiraj s Gemini/i));
    await waitFor(() => expect(screen.getByText(/Naslov kviza je obvezen/i)).toBeInTheDocument());
  });
});

describe("ProfessorQuizModal — preview step", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onClose.mockClear();
    defaultProps.onCreated.mockClear();
  });

  it("shows all generated questions in the preview", async () => {
    await renderAtPreview();
    expect(screen.getByText('Kaj je sila?')).toBeInTheDocument();
    expect(screen.getByText('Newton je enota za silo.')).toBeInTheDocument();
  });

  it("shows question count badge", async () => {
    await renderAtPreview();
    expect(screen.getByText(/2 vprašanj/)).toBeInTheDocument();
  });

  it("calls onCreated with quiz when Shrani kviz is clicked", async () => {
    await renderAtPreview();
    fireEvent.click(screen.getByText('Shrani kviz'));
    expect(defaultProps.onCreated).toHaveBeenCalledWith(generatedQuiz);
  });

  it("expands question details when question row is clicked", async () => {
    await renderAtPreview();
    fireEvent.click(screen.getByText('Kaj je sila?'));
    expect(screen.getByText('Masa × pospešek')).toBeInTheDocument();
    expect(screen.getByText(/F = m/)).toBeInTheDocument();
  });
});

describe("ProfessorQuizModal — question editing in preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onClose.mockClear();
    defaultProps.onCreated.mockClear();
  });

  it("shows edit and delete buttons for each question", async () => {
    await renderAtPreview();
    const editButtons = screen.getAllByTitle('Uredi vprašanje');
    expect(editButtons).toHaveLength(2);
    const deleteButtons = screen.getAllByTitle('Izbriši vprašanje');
    expect(deleteButtons).toHaveLength(2);
  });

  it("shows question editor when edit button is clicked", async () => {
    await renderAtPreview();
    fireEvent.click(screen.getAllByTitle('Uredi vprašanje')[0]);
    expect(screen.getByText('Urejanje vprašanja')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kaj je sila?')).toBeInTheDocument();
  });

  it("cancelling edit hides the editor", async () => {
    await renderAtPreview();
    fireEvent.click(screen.getAllByTitle('Uredi vprašanje')[0]);
    fireEvent.click(screen.getByText('Prekliči'));
    expect(screen.queryByText('Urejanje vprašanja')).not.toBeInTheDocument();
  });

  it("disables Shrani kviz while a question is being edited", async () => {
    await renderAtPreview();
    fireEvent.click(screen.getAllByTitle('Uredi vprašanje')[0]);
    expect(screen.getByText('Shrani kviz')).toBeDisabled();
  });

  it("saves edited question and updates the list", async () => {
    const updatedQuestion = {
      ...generatedQuiz.quiz_questions![0],
      question: 'Kaj je masa?',
    };

    await renderAtPreview();
    mockApi.put.mockResolvedValueOnce({ data: { question: updatedQuestion } });

    fireEvent.click(screen.getAllByTitle('Uredi vprašanje')[0]);

    const textarea = screen.getByDisplayValue('Kaj je sila?');
    fireEvent.change(textarea, { target: { value: 'Kaj je masa?' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Shrani vprašanje'));
    });

    await waitFor(() => expect(screen.getByText('Kaj je masa?')).toBeInTheDocument());
    expect(mockApi.put).toHaveBeenCalledWith(
      '/subject-quizzes/quiz-1/questions/q-1',
      expect.objectContaining({ question: 'Kaj je masa?' })
    );
  });

  it("removes deleted question from list", async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockApi.delete.mockResolvedValueOnce({});

    await renderAtPreview();
    const deleteButtons = screen.getAllByTitle('Izbriši vprašanje');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => expect(screen.queryByText('Kaj je sila?')).not.toBeInTheDocument());
    expect(screen.getByText('Newton je enota za silo.')).toBeInTheDocument();
  });

  it("shows add question form when Dodaj vprašanje is clicked", async () => {
    await renderAtPreview();
    fireEvent.click(screen.getByText('Dodaj vprašanje'));
    expect(screen.getByText('Urejanje vprašanja')).toBeInTheDocument();
    expect(screen.getByText('Shrani vprašanje')).toBeInTheDocument();
  });

  it("adds new question to list after saving", async () => {
    const newQuestion = {
      id: 'q-3',
      quiz_id: 'quiz-1',
      question: 'Je voda kemična spojina?',
      options: ['Res', 'Ni res'],
      correct_answer: 'Res',
      question_type: 'true_false' as const,
      explanation: null,
      order_index: 2,
    };

    await renderAtPreview();
    mockApi.post.mockResolvedValueOnce({ data: { question: newQuestion } });

    fireEvent.click(screen.getByText('Dodaj vprašanje'));

   
    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'Je voda kemična spojina?' } });

   
    fireEvent.click(screen.getByText('Res / Ni res'));

    const resRadio = screen.getAllByTitle('Označi kot pravilen odgovor')[0];
    fireEvent.click(resRadio);

    await act(async () => {
      fireEvent.click(screen.getByText('Shrani vprašanje'));
    });

    await waitFor(() => expect(screen.getByText('Je voda kemična spojina?')).toBeInTheDocument());
    expect(mockApi.post).toHaveBeenCalledWith(
      '/subject-quizzes/quiz-1/questions',
      expect.objectContaining({ question_type: 'true_false', correct_answer: 'Res' })
    );
  });
});
