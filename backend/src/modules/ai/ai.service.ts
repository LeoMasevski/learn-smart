import { gemini } from "../../config/gemini";

type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

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

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

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