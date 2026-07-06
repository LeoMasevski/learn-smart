import {
  startAttempt,
  submitAttempt,
  getMyAttemptForQuiz,
} from "../../../modules/quiz-attempts/quizAttempt.service";
import { makeBuilder } from "../../helpers/supabaseMock";

const mockFrom = jest.fn();

jest.mock("../../../config/supabase", () => ({
  supabaseAdmin: { from: (...args: any[]) => mockFrom(...args) },
}));

const QUIZ_ID = "quiz-abc";
const STUDENT_ID = "student-xyz";
const ATTEMPT_ID = "attempt-1";

describe("startAttempt", () => {
  it("abandons existing in_progress attempt and creates a new one", async () => {
    const completedBuilder = makeBuilder({ data: null, error: null });
    const abandonedBuilder = makeBuilder({ data: null, error: null });
    const createdBuilder = makeBuilder({ data: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, student_id: STUDENT_ID, status: "in_progress" }, error: null });
    mockFrom
      .mockReturnValueOnce(completedBuilder)
      .mockReturnValueOnce(abandonedBuilder)
      .mockReturnValueOnce(createdBuilder);

    const { data, error } = await startAttempt(QUIZ_ID, STUDENT_ID);

    expect(abandonedBuilder.update).toHaveBeenCalledWith({ status: "abandoned" });
    expect(createdBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ quiz_id: QUIZ_ID, student_id: STUDENT_ID }));
    expect(data?.quiz_id).toBe(QUIZ_ID);
    expect(error).toBeNull();
  });

  it("does not start a new attempt after the quiz is completed", async () => {
    mockFrom.mockReturnValueOnce(
      makeBuilder({ data: { id: "completed-1" }, error: null })
    );

    const { data, error } = await startAttempt(QUIZ_ID, STUDENT_ID);

    expect(data).toBeNull();
    expect(error?.message).toContain("Quiz already completed");
  });
});

describe("submitAttempt", () => {
  const answers = [
    { question_id: "q-1", selected_answer: "Res" },
    { question_id: "q-2", selected_answer: "Option B" },
  ];

  function setupMocks({ attemptData = null as any, questionsData = null as any, completedData = null as any } = {}) {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return makeBuilder({ data: attemptData, error: attemptData ? null : new Error("not found") });
      if (callCount === 2) return makeBuilder({ data: questionsData, error: questionsData ? null : new Error("not found") });
      if (callCount === 3) return makeBuilder({ data: null, error: null }); // upsert answers
      return makeBuilder({ data: completedData, error: null }); // update attempt
    });
  }

  it("returns error when attempt is not found", async () => {
    setupMocks({ attemptData: null });
    const { data, error } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, answers, 60);
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it("returns error when attempt is already completed", async () => {
    setupMocks({
      attemptData: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, status: "completed" },
    });
    const { data, error } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, answers, 60);
    expect(data).toBeNull();
    expect(error?.message).toContain("Already completed");
  });

  it("returns error when no valid answers are submitted", async () => {
    setupMocks({
      attemptData: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, status: "in_progress" },
    });
    const { data, error } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, [], 60);
    expect(data).toBeNull();
    expect(error?.message).toContain("No valid answers");
  });

  it("returns error when question count mismatches (invalid question submitted)", async () => {
    setupMocks({
      attemptData: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, status: "in_progress" },
      questionsData: [{ id: "q-1", correct_answer: "Res", options: ["Res", "Ni res"] }],
    });
    const { data, error } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, answers, 60);
    expect(data).toBeNull();
    expect(error?.message).toContain("Invalid question");
  });

  it("calculates score correctly — all correct", async () => {
    const completedAttempt = {
      id: ATTEMPT_ID,
      status: "completed",
      score: 100,
      correct_count: 2,
      total_count: 2,
      quiz_attempt_answers: [],
    };
    setupMocks({
      attemptData: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, status: "in_progress" },
      questionsData: [
        { id: "q-1", correct_answer: "Res", options: ["Res", "Ni res"] },
        { id: "q-2", correct_answer: "Option B", options: ["Option A", "Option B", "Option C", "Option D"] },
      ],
      completedData: completedAttempt,
    });

    const { data, error } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, answers, 60);
    expect(error).toBeNull();
    expect(data?.score).toBe(100);
  });

  it("calculates score correctly — half correct", async () => {
    const completedAttempt = {
      id: ATTEMPT_ID,
      status: "completed",
      score: 50,
      correct_count: 1,
      total_count: 2,
      quiz_attempt_answers: [],
    };
    setupMocks({
      attemptData: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, status: "in_progress" },
      questionsData: [
        { id: "q-1", correct_answer: "Res", options: ["Res", "Ni res"] },       // correct
        { id: "q-2", correct_answer: "Option A", options: ["Option A", "Option B", "Option C", "Option D"] },  // incorrect (student answered B)
      ],
      completedData: completedAttempt,
    });

    const { data, error } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, answers, 60);
    expect(error).toBeNull();
    expect(data?.score).toBe(50);
  });

  it("deduplicates answers with the same question_id (last one wins)", async () => {
    const duplicatedAnswers = [
      { question_id: "q-1", selected_answer: "Ni res" },
      { question_id: "q-1", selected_answer: "Res" }, // duplicate — this should win
    ];
    const completedAttempt = { id: ATTEMPT_ID, status: "completed", score: 100, correct_count: 1, total_count: 1, quiz_attempt_answers: [] };
    setupMocks({
      attemptData: { id: ATTEMPT_ID, quiz_id: QUIZ_ID, status: "in_progress" },
      questionsData: [{ id: "q-1", correct_answer: "Res", options: ["Res", "Ni res"] }],
      completedData: completedAttempt,
    });

    const { data } = await submitAttempt(ATTEMPT_ID, STUDENT_ID, duplicatedAnswers, 30);
    expect(data?.score).toBe(100);
  });
});

describe("getMyAttemptForQuiz", () => {
  it("returns the most recent attempt for the given quiz and student", async () => {
    const attempt = { id: ATTEMPT_ID, quiz_id: QUIZ_ID, student_id: STUDENT_ID, status: "completed", score: 80 };
    mockFrom.mockReturnValue(makeBuilder({ data: attempt, error: null }));

    const { data, error } = await getMyAttemptForQuiz(QUIZ_ID, STUDENT_ID);
    expect(data).toEqual(attempt);
    expect(error).toBeNull();
  });

  it("returns null data when no attempt exists", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }));
    const { data } = await getMyAttemptForQuiz(QUIZ_ID, STUDENT_ID);
    expect(data).toBeNull();
  });
});
