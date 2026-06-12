import { gemini } from "../../config/gemini";

type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

// Gemini occasionally returns transient 503 "model overloaded" errors — retry a few times before giving up
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const message = err?.message ?? "";
      const isRetryable = message.includes("503") || message.includes("UNAVAILABLE") || message.includes("overloaded");
      if (!isRetryable || attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error("Unreachable");
}

export type GeneratedQuestion = {
  question: string;
  options: string[] | null;
  correct_answer: string;
  question_type: "multiple_choice" | "true_false";
  explanation: string;
  order_index: number;
};

export async function generateSubjectQuiz(
  lessons: { title: string; content: string }[],
  questionCount: number,
  questionType: "multiple_choice" | "true_false" | "mixed"
): Promise<GeneratedQuestion[]> {
  const combinedContent = lessons
    .map((l) => `## ${l.title}\n${l.content.slice(0, 3000)}`)
    .join("\n\n---\n\n");

  const typeInstruction =
    questionType === "multiple_choice"
      ? `Generate ONLY multiple_choice questions (4 options each, exactly one correct).`
      : questionType === "true_false"
      ? `Generate ONLY true_false questions. Options must always be exactly ["Res", "Ni res"]. correct_answer must be either "Res" or "Ni res".`
      : `Generate a mix of multiple_choice and true_false questions. For true_false: options must be ["Res", "Ni res"].`;

  const prompt = `
You are a quiz generator for an e-learning platform called LearnSmart. Generate quiz questions IN SLOVENIAN language.

Return ONLY valid JSON. No markdown. No explanations outside JSON.

${typeInstruction}

Generate exactly ${questionCount} questions based on the lesson content below.

Required JSON shape:
{
  "questions": [
    {
      "question": "Question text in Slovenian",
      "question_type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Short explanation why this is correct"
    },
    {
      "question": "True/false question text in Slovenian",
      "question_type": "true_false",
      "options": ["Res", "Ni res"],
      "correct_answer": "Res",
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- All text must be in Slovenian
- For multiple_choice: exactly 4 options, 1 correct
- For true_false: options must always be exactly ["Res", "Ni res"]
- correct_answer must exactly match one of the options
- Questions must be directly based on the lesson content
- explanations should be concise (1-2 sentences)
- Do not repeat the same question

Lesson content:
${combinedContent}
`;

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response");

  const parsed = JSON.parse(text);
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Gemini response does not contain valid questions array");
  }

  return parsed.questions.map(
    (q: Omit<GeneratedQuestion, "order_index">, idx: number) => ({
      ...q,
      order_index: idx,
    })
  );
}

export async function generateLessonVariantsFromText(
  title: string,
  originalContent: string,
  aiInstructions?: string
): Promise<
  {
    learningType: LearningType;
    blocks: unknown[];
  }[]
> {
  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : "";

  const prompt = `
You are generating structured lesson content for LearnSmart in Slovenian.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside JSON.
Do not generate HTML.
Do not generate React code.

Generate exactly 3 lesson variants:
1. VISUAL
2. AUDITORY
3. KINESTHETIC

Allowed block types:
heading, text, key_points, table, example, steps, quiz, chart, code, image

Required JSON shape:
{
  "variants": [
    {
      "learningType": "VISUAL",
      "blocks": []
    },
    {
      "learningType": "AUDITORY",
      "blocks": []
    },
    {
      "learningType": "KINESTHETIC",
      "blocks": []
    }
  ]
}

Block format examples:

Heading:
{
  "type": "heading",
  "content": "Lesson section title"
}

Text:
{
  "type": "text",
  "content": "Explanation text"
}

Key points:
{
  "type": "key_points",
  "title": "Important points",
  "items": ["point 1", "point 2"]
}

Table:
{
  "type": "table",
  "title": "Comparison table",
  "headers": ["Column 1", "Column 2"],
  "rows": [["value 1", "value 2"]]
}

Example:
{
  "type": "example",
  "title": "Example title",
  "content": "Example explanation"
}

Steps:
{
  "type": "steps",
  "title": "Step-by-step process",
  "items": ["step 1", "step 2"]
}

Quiz:
{
  "type": "quiz",
  "title": "Quick quiz",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ]
}

Chart:
{
  "type": "chart",
  "title": "Chart title",
  "chartType": "bar",
  "labels": ["A", "B", "C"],
  "datasets": [
    {
      "label": "Dataset label",
      "data": [1, 2, 3]
    }
  ]
}

Code:
{
  "type": "code",
  "language": "javascript",
  "title": "Code example",
  "content": "console.log('example');"
}

Image:
{
  "type": "image",
  "title": "Image title",
  "url": "https://example.com/image.png",
  "alt": "Image description"
}

Professor additional instructions:
${safeAiInstructions || "No additional professor instructions provided."}

Lesson title:
${title}

Original lesson content:
${originalContent}
`;

  const response = await withRetry(() =>
    gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    })
  );

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  const parsed = JSON.parse(text);

  if (!parsed.variants || !Array.isArray(parsed.variants)) {
    throw new Error("Gemini response does not contain valid variants array");
  }

  return parsed.variants;
}