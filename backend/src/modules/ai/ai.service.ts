import { gemini } from "../../config/gemini";

type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

export type LessonImageForGeneration = {
  id: string;
  url: string;
  storagePath: string;
  pageNumber: number;
  imageIndex: number;
  title: string;
  alt: string;
  width?: number;
  height?: number;
  contextText: string;
};

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
  aiInstructions?: string,
  lessonImages: LessonImageForGeneration[] = []
): Promise<
  {
    learningType: LearningType;
    blocks: unknown[];
  }[]
> {
  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : "";
  const imagePrompt = buildLessonImagePrompt(lessonImages);

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

Learning type requirements:
- VISUAL: explain with clear structure, visual grouping, tables/charts/images when useful.
- AUDITORY: explain in conversational language, with memorable wording and short recap-style sections.
- KINESTHETIC: teach by doing. Do not create mostly random standalone quizzes. Build the lesson as repeated cycles:
  1. brief explanation of one concept,
  2. concrete worked example or real-life scenario,
  3. practice steps the learner can follow,
  4. a quiz that directly checks that same example/scenario.
- KINESTHETIC must include at least 3 example blocks and at least 3 quiz blocks when the source content is long enough.
- Every KINESTHETIC quiz title and questions must refer to the immediately preceding example/practice section.
- KINESTHETIC quizzes must test application of the explained example, not unrelated facts from elsewhere in the lesson.
- KINESTHETIC should prefer example, steps, quiz, and text blocks. Use key_points only as a short recap after practice.
- Keep every quiz short: 1-2 questions, 3-4 options each, with exactly one correctAnswer.

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

Kinesthetic sequence example:
[
  {
    "type": "text",
    "content": "Briefly explain one concept."
  },
  {
    "type": "example",
    "title": "Worked example: specific situation",
    "content": "Show how the concept works in a concrete case."
  },
  {
    "type": "steps",
    "title": "Try it yourself",
    "items": ["Step 1 based on the example", "Step 2 based on the example"]
  },
  {
    "type": "quiz",
    "title": "Check the worked example",
    "questions": [
      {
        "question": "Question that directly checks the example above",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    ]
  }
]

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
  "alt": "Image description",
  "sourceImageId": "pdf-image-1",
  "pageNumber": 1
}

PDF images available for this lesson:
${imagePrompt}

Image rules:
- Use only image URLs from "PDF images available for this lesson".
- Do not invent image URLs.
- Each image belongs only to this lesson.
- Place images near the section they support, using pageNumber and pageContext to decide where they fit.
- The VISUAL variant should include all useful PDF images in page order.
- The AUDITORY and KINESTHETIC variants may include images when they directly support the explanation or activity.
- If no PDF images are available, do not create image blocks.

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

  return sanitizeGeneratedLessonImages(parsed.variants, lessonImages);
}

export async function generateLessonVariantFromText(
  title: string,
  originalContent: string,
  learningType: LearningType,
  aiInstructions?: string,
  lessonImages: LessonImageForGeneration[] = []
): Promise<{
  learningType: LearningType;
  blocks: unknown[];
}> {
  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : "";
  const imagePrompt = buildLessonImagePrompt(lessonImages);
  const learningTypeInstruction =
    learningType === "VISUAL"
      ? "Explain with clear structure, visual grouping, tables/charts/images when useful."
      : learningType === "AUDITORY"
      ? "Explain in conversational language, with memorable wording and short recap-style sections."
      : `Teach by doing. Build repeated cycles: brief explanation, concrete worked example or real-life scenario, practice steps, then a quiz that directly checks that same example/scenario. Include at least 3 example blocks and 3 quiz blocks when the source content is long enough. Do not create random standalone quizzes.`;

  const prompt = `
You are generating one structured lesson variant for LearnSmart in Slovenian.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside JSON.
Do not generate HTML or React code.

Generate exactly one lesson variant:
${learningType}

Required JSON shape:
{
  "variant": {
    "learningType": "${learningType}",
    "blocks": []
  }
}

Learning type requirement:
${learningTypeInstruction}

Allowed block types:
heading, text, key_points, table, example, steps, quiz, chart, code, image

Important block rules:
- All visible text must be in Slovenian.
- Quizzes must be short: 1-2 questions, 3-4 options each, exactly one correctAnswer.
- For KINESTHETIC, every quiz must directly refer to the immediately preceding example or practice steps.
- Do not invent facts that are not supported by the lesson content.

Block examples:
{"type":"heading","content":"Section title"}
{"type":"text","content":"Explanation text"}
{"type":"key_points","title":"Important points","items":["point 1","point 2"]}
{"type":"example","title":"Worked example","content":"Concrete example explanation"}
{"type":"steps","title":"Try it yourself","items":["step 1","step 2"]}
{"type":"quiz","title":"Check the example","questions":[{"question":"Question text","options":["A","B","C","D"],"correctAnswer":"A"}]}
{"type":"image","title":"Image title","url":"https://example.com/image.png","alt":"Image description","sourceImageId":"pdf-image-1","pageNumber":1}

PDF images available for this lesson:
${imagePrompt}

Image rules:
- Use only image URLs from "PDF images available for this lesson".
- Do not invent image URLs.
- Place images near the section they support.
- If no PDF images are available, do not create image blocks.

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
  const variant = parsed.variant || parsed.variants?.[0];

  if (!variant || !Array.isArray(variant.blocks)) {
    throw new Error("Gemini response does not contain a valid lesson variant");
  }

  const sanitized = sanitizeGeneratedLessonImages(
    [
      {
        learningType,
        blocks: variant.blocks,
      },
    ],
    lessonImages
  );

  return sanitized[0];
}

export async function generateLessonVariantBlockBatch(
  title: string,
  originalContent: string,
  learningType: LearningType,
  batchIndex: number,
  totalBatches: number,
  existingBlocks: unknown[],
  aiInstructions?: string,
  lessonImages: LessonImageForGeneration[] = []
): Promise<unknown[]> {
  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : "";
  const imagePrompt = buildLessonImagePrompt(lessonImages);
  const existingBlocksSummary = JSON.stringify(existingBlocks).slice(0, 5000);
  const sectionInstruction = getBatchInstruction(
    learningType,
    batchIndex,
    totalBatches
  );

  const prompt = `
You are generating one incremental section batch for a LearnSmart lesson variant in Slovenian.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside JSON.
Do not generate HTML or React code.

Learning type:
${learningType}

Batch:
${batchIndex} of ${totalBatches}

Goal for this batch:
${sectionInstruction}

Required JSON shape:
{
  "blocks": []
}

Allowed block types:
heading, text, key_points, table, example, steps, quiz, chart, code, image

Rules:
- Generate only the next coherent section(s), not the whole lesson.
- Do not repeat blocks already generated.
- Return 2-5 blocks for this batch.
- All visible text must be in Slovenian.
- Quizzes must be short: 1-2 questions, 3-4 options each, exactly one correctAnswer.
- For KINESTHETIC, every quiz must directly check the example or practice steps in this same batch.
- Do not invent facts that are not supported by the lesson content.

PDF images available for this lesson:
${imagePrompt}

Image rules:
- Use only image URLs from "PDF images available for this lesson".
- Do not invent image URLs.
- Use images only when they directly support this batch.
- If no relevant PDF image is available for this batch, do not create image blocks.

Professor additional instructions:
${safeAiInstructions || "No additional professor instructions provided."}

Lesson title:
${title}

Existing generated blocks:
${existingBlocksSummary || "[]"}

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

  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    throw new Error("Gemini response does not contain valid blocks");
  }

  const sanitized = sanitizeGeneratedLessonImages(
    [
      {
        learningType,
        blocks: parsed.blocks,
      },
    ],
    lessonImages
  );

  return sanitized[0].blocks;
}

function getBatchInstruction(
  learningType: LearningType,
  batchIndex: number,
  totalBatches: number
) {
  if (learningType === "KINESTHETIC") {
    if (batchIndex === totalBatches) {
      return "Finish with applied practice, a final example-based quiz, and a short recap.";
    }

    return "Create one learn-by-doing cycle: brief explanation, concrete worked example, practice steps, and a quiz that checks that exact example.";
  }

  if (learningType === "VISUAL") {
    if (batchIndex === 1) {
      return "Introduce the topic with a clear visual structure and the most important concepts.";
    }

    if (batchIndex === totalBatches) {
      return "Finish with a structured recap, comparison, chart/table, or final visual summary.";
    }

    return "Expand the lesson with organized visual sections, examples, tables, charts, or relevant images.";
  }

  if (batchIndex === 1) {
    return "Introduce the topic in conversational language with a clear mental model.";
  }

  if (batchIndex === totalBatches) {
    return "Finish with a concise spoken-style recap and a short self-check quiz.";
  }

  return "Expand the lesson with memorable explanations, spoken-style examples, and short recap points.";
}

function buildLessonImagePrompt(lessonImages: LessonImageForGeneration[]) {
  return lessonImages.length > 0
    ? JSON.stringify(
        lessonImages.map((image) => ({
          id: image.id,
          url: image.url,
          pageNumber: image.pageNumber,
          imageIndex: image.imageIndex,
          title: image.title,
          alt: image.alt,
          width: image.width,
          height: image.height,
          pageContext: image.contextText.slice(0, 700),
        })),
        null,
        2
      )
    : "[]";
}

function sanitizeGeneratedLessonImages(
  variants: { learningType: LearningType; blocks: unknown[] }[],
  lessonImages: LessonImageForGeneration[]
) {
  if (lessonImages.length === 0) {
    return variants.map((variant) => ({
      ...variant,
      blocks: Array.isArray(variant.blocks)
        ? variant.blocks.filter((block: any) => block?.type !== "image")
        : [],
    }));
  }

  const imagesByUrl = new Map(lessonImages.map((image) => [image.url, image]));
  const usedVisualImageUrls = new Set<string>();

  const sanitizedVariants = variants.map((variant) => {
    const blocks = Array.isArray(variant.blocks) ? variant.blocks : [];
    const sanitizedBlocks = blocks.flatMap((block: any) => {
      if (block?.type !== "image") {
        return [block];
      }

      const image = imagesByUrl.get(String(block.url || ""));
      if (!image) {
        return [];
      }

      if (variant.learningType === "VISUAL") {
        usedVisualImageUrls.add(image.url);
      }

      return [
        {
          type: "image",
          title: block.title || image.title,
          url: image.url,
          alt: block.alt || image.alt,
          sourceImageId: image.id,
          storagePath: image.storagePath,
          pageNumber: image.pageNumber,
        },
      ];
    });

    return {
      ...variant,
      blocks:
        variant.learningType === "KINESTHETIC"
          ? enforceKinestheticPracticeFlow(sanitizedBlocks)
          : sanitizedBlocks,
    };
  });

  const visualVariant = sanitizedVariants.find(
    (variant) => variant.learningType === "VISUAL"
  );

  if (visualVariant) {
    const missingVisualImages = lessonImages.filter(
      (image) => !usedVisualImageUrls.has(image.url)
    );

    if (missingVisualImages.length > 0) {
      visualVariant.blocks.push(
        ...missingVisualImages.map((image) => ({
          type: "image",
          title: image.title,
          url: image.url,
          alt: image.alt,
          sourceImageId: image.id,
          storagePath: image.storagePath,
          pageNumber: image.pageNumber,
        }))
      );
    }
  }

  return sanitizedVariants;
}

function enforceKinestheticPracticeFlow(blocks: unknown[]) {
  const sanitizedBlocks: unknown[] = [];

  for (const block of blocks) {
    const blockType = (block as any)?.type;
    const previousBlockType =
      (sanitizedBlocks[sanitizedBlocks.length - 1] as any)?.type;

    if (blockType === "quiz") {
      const hasPracticeContext =
        previousBlockType === "example" || previousBlockType === "steps";

      if (!hasPracticeContext) {
        continue;
      }
    }

    sanitizedBlocks.push(block);
  }

  return sanitizedBlocks;
}
