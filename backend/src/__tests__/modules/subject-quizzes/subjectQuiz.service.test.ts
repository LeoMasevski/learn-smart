import {
  createQuiz,
  savequizQuestions,
  updateQuizStatus,
  updateQuizQuestion,
  addQuizQuestion,
  deleteQuizQuestion,
  updateQuizQuestionCount,
  getQuizById,
} from "../../../modules/subject-quizzes/subjectQuiz.service";
import { makeBuilder } from "../../helpers/supabaseMock";

const mockFrom = jest.fn();

jest.mock("../../../config/supabase", () => ({
  supabaseAdmin: { from: (...args: any[]) => mockFrom(...args) },
}));

const quizFixture = {
  id: "quiz-1",
  subject_id: "sub-1",
  title: "Osnove fizike",
  time_limit_minutes: 15,
  question_count: 5,
  question_type: "multiple_choice",
  status: "draft",
  created_by: "prof-1",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  quiz_lessons: [],
  quiz_questions: [],
};

const questionFixture = {
  id: "q-1",
  quiz_id: "quiz-1",
  question: "Kaj je sila?",
  options: ["Energija", "Masa krat pospešek", "Hitrost", "Tlak"],
  correct_answer: "Masa krat pospešek",
  question_type: "multiple_choice",
  explanation: "F = m * a",
  order_index: 0,
};

describe("createQuiz", () => {
  it("inserts and returns a new quiz", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: quizFixture, error: null }));
    const { data, error } = await createQuiz("sub-1", "prof-1", "Osnove fizike", 15, 5, "multiple_choice");
    expect(data).toEqual(quizFixture);
    expect(error).toBeNull();
  });

  it("returns error on insert failure", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { data, error } = await createQuiz("sub-1", "prof-1", "Test", 10, 5, "true_false");
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});

describe("getQuizById", () => {
  it("returns quiz with questions and lessons", async () => {
    const quizWithQuestions = { ...quizFixture, quiz_questions: [questionFixture] };
    mockFrom.mockReturnValue(makeBuilder({ data: quizWithQuestions, error: null }));
    const { data, error } = await getQuizById("quiz-1");
    expect(data?.quiz_questions).toHaveLength(1);
    expect(error).toBeNull();
  });
});

describe("savequizQuestions", () => {
  it("deletes existing questions and inserts new ones", async () => {
    const builder = makeBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    await savequizQuestions("quiz-1", [
      { question: "Q1", options: ["A", "B"], correct_answer: "A", question_type: "multiple_choice", order_index: 0 },
    ]);

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.insert).toHaveBeenCalled();
  });
});

describe("updateQuizStatus", () => {
  it("updates quiz status to ready", async () => {
    const updated = { ...quizFixture, status: "ready" };
    mockFrom.mockReturnValue(makeBuilder({ data: updated, error: null }));
    const { data } = await updateQuizStatus("quiz-1", "ready");
    expect(data?.status).toBe("ready");
  });

  it("updates quiz status to generating", async () => {
    const updated = { ...quizFixture, status: "generating" };
    mockFrom.mockReturnValue(makeBuilder({ data: updated, error: null }));
    const { data } = await updateQuizStatus("quiz-1", "generating");
    expect(data?.status).toBe("generating");
  });
});

describe("updateQuizQuestionCount", () => {
  it("calls update on subject_quizzes", async () => {
    const builder = makeBuilder({ data: null, error: null });
    mockFrom.mockReturnValue(builder);
    await updateQuizQuestionCount("quiz-1", 3);
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ question_count: 3 }));
  });
});

describe("updateQuizQuestion", () => {
  it("updates question fields and returns updated question", async () => {
    const updated = { ...questionFixture, question: "Kaj je masa?" };
    mockFrom.mockReturnValue(makeBuilder({ data: updated, error: null }));

    const { data, error } = await updateQuizQuestion("q-1", {
      question: "Kaj je masa?",
      options: ["1kg", "1g", "1t", "1mg"],
      correct_answer: "1kg",
      question_type: "multiple_choice",
      explanation: "SI enota za maso je kilogram",
    });

    expect(data?.question).toBe("Kaj je masa?");
    expect(error).toBeNull();
  });
});

describe("addQuizQuestion", () => {
  it("inserts a new question and returns it", async () => {
    const newQuestion = { ...questionFixture, id: "q-2", order_index: 1 };
    mockFrom.mockReturnValue(makeBuilder({ data: newQuestion, error: null }));

    const { data, error } = await addQuizQuestion("quiz-1", {
      question: "Kaj je masa?",
      options: ["A", "B", "C", "D"],
      correct_answer: "A",
      question_type: "multiple_choice",
      explanation: null,
      order_index: 1,
    });

    expect(data).toEqual(newQuestion);
    expect(error).toBeNull();
  });

  it("returns error on insert failure", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { data, error } = await addQuizQuestion("quiz-1", {
      question: "Q?",
      options: ["A", "B"],
      correct_answer: "A",
      question_type: "multiple_choice",
      explanation: null,
      order_index: 0,
    });
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});

describe("deleteQuizQuestion", () => {
  it("deletes question and returns it", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: questionFixture, error: null }));
    const { data, error } = await deleteQuizQuestion("q-1");
    expect(data).toEqual(questionFixture);
    expect(error).toBeNull();
  });

  it("returns error when question not found", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("not found") }));
    const { data, error } = await deleteQuizQuestion("non-existent");
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});
