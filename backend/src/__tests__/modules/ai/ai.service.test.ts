import { generateSubjectQuiz } from "../../../modules/ai/ai.service";

const mockGenerateContent = jest.fn();

jest.mock("../../../config/gemini", () => ({
  gemini: {
    models: { generateContent: (...args: any[]) => mockGenerateContent(...args) },
  },
}));

const lessons = [{ title: "Sila", content: "Sila je fizikalna veličina." }];

function geminiResponse(questions: object[]) {
  return { text: JSON.stringify({ questions }) };
}

const validMcQuestion = {
  question: "Kaj je sila?",
  question_type: "multiple_choice",
  options: ["Energija", "Masa krat pospešek", "Hitrost", "Tlak"],
  correct_answer: "Masa krat pospešek",
  explanation: "F = m * a",
};

const validTfQuestion = {
  question: "Sila se meri v Newtonih.",
  question_type: "true_false",
  options: ["Res", "Ni res"],
  correct_answer: "Res",
  explanation: "Enota za silo je Newton (N).",
};

describe("generateSubjectQuiz", () => {
  it("returns parsed and sanitized questions", async () => {
    mockGenerateContent.mockResolvedValue(geminiResponse([validMcQuestion]));

    const result = await generateSubjectQuiz(lessons, 1, "multiple_choice");

    expect(result).toHaveLength(1);
    expect(result[0].question).toBe("Kaj je sila?");
    expect(result[0].question_type).toBe("multiple_choice");
    expect(result[0].order_index).toBe(0);
  });

  it("assigns sequential order_index values", async () => {
    mockGenerateContent.mockResolvedValue(geminiResponse([validMcQuestion, validTfQuestion]));

    const result = await generateSubjectQuiz(lessons, 2, "mixed");

    expect(result[0].order_index).toBe(0);
    expect(result[1].order_index).toBe(1);
  });

  it("filters out malformed questions (missing correct_answer in options)", async () => {
    const badQuestion = { ...validMcQuestion, correct_answer: "Neobstoječa možnost" };
    mockGenerateContent.mockResolvedValue(geminiResponse([badQuestion, validTfQuestion]));

    const result = await generateSubjectQuiz(lessons, 2, "mixed");

    expect(result).toHaveLength(1);
    expect(result[0].question_type).toBe("true_false");
  });

  it("normalises true_false correct_answer variants — 'true' becomes 'Res'", async () => {
    const looseTf = { ...validTfQuestion, correct_answer: "true" };
    mockGenerateContent.mockResolvedValue(geminiResponse([looseTf]));

    const result = await generateSubjectQuiz(lessons, 1, "true_false");

    expect(result[0].correct_answer).toBe("Res");
  });

  it("normalises true_false correct_answer — 'false' becomes 'Ni res'", async () => {
    const looseTf = { ...validTfQuestion, correct_answer: "false" };
    mockGenerateContent.mockResolvedValue(geminiResponse([looseTf]));

    const result = await generateSubjectQuiz(lessons, 1, "true_false");

    expect(result[0].correct_answer).toBe("Ni res");
  });

  it("throws when Gemini returns empty text", async () => {
    mockGenerateContent.mockResolvedValue({ text: "" });

    await expect(generateSubjectQuiz(lessons, 1, "multiple_choice")).rejects.toThrow(
      "Gemini returned empty response"
    );
  });

  it("throws when Gemini response is not valid JSON", async () => {
    mockGenerateContent.mockResolvedValue({ text: "not json at all" });

    await expect(generateSubjectQuiz(lessons, 1, "multiple_choice")).rejects.toThrow();
  });

  it("throws when questions array is missing from response", async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify({ result: [] }) });

    await expect(generateSubjectQuiz(lessons, 1, "multiple_choice")).rejects.toThrow(
      "Gemini response does not contain valid questions array"
    );
  });

  it("throws when all questions fail sanitization", async () => {
    const allBad = [{ question: "", question_type: "multiple_choice", options: [], correct_answer: "" }];
    mockGenerateContent.mockResolvedValue(geminiResponse(allBad));

    await expect(generateSubjectQuiz(lessons, 1, "multiple_choice")).rejects.toThrow(
      "Gemini response did not contain any valid questions"
    );
  });

  it("does not retry on non-transient errors", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("Bad request"));

    await expect(generateSubjectQuiz(lessons, 1, "multiple_choice")).rejects.toThrow("Bad request");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("retries on transient 503 error and succeeds on second attempt", async () => {
    const error503 = new Error("503 model overloaded");
    mockGenerateContent
      .mockRejectedValueOnce(error503)
      .mockResolvedValueOnce(geminiResponse([validMcQuestion]));

    const result = await generateSubjectQuiz(lessons, 1, "multiple_choice");

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
  }, 10000);

  it("throws after all retry attempts are exhausted", async () => {
    const error503 = new Error("503 UNAVAILABLE model overloaded");
    mockGenerateContent.mockRejectedValue(error503);

    await expect(generateSubjectQuiz(lessons, 1, "multiple_choice")).rejects.toThrow();
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  }, 20000);
});
