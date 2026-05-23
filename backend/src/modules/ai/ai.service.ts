import { gemini } from "../../config/gemini";

type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

export async function generateLessonVariantsFromText(
  title: string,
  originalContent: string
): Promise<
  {
    learningType: LearningType;
    blocks: unknown[];
  }[]
> {
  const prompt = `
You are generating structured lesson content for LearnSmart in Slovenian.

Return ONLY valid JSON. No markdown. No explanation.

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

  return parsed.variants;
}