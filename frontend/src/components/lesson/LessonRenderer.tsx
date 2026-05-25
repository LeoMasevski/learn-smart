import HeadingBlock from "./HeadingBlock";
import TextBlock from "./TextBlock";
import KeyPointsBlock from "./KeyPointsBlock";
import TableBlock from "./TableBlock";
import ExampleBlock from "./ExampleBlock";
import StepsBlock from "./StepsBlock";
import QuizBlock from "./QuizBlock";
import ChartBlock from "./ChartBlock";
import CodeBlock from "./CodeBlock";
import ImageBlock from "./ImageBlock";

// ─── Block types ────────────────────────────────────────────────────────────

type HeadingBlockData = {
  type: "heading";
  content: string;
  level?: 1 | 2 | 3;
};

type TextBlockData = {
  type: "text";
  content: string;
};

type KeyPointsBlockData = {
  type: "key_points";
  title?: string;
  items: string[];
};

type TableBlockData = {
  type: "table";
  title?: string;
  headers: string[];
  rows: string[][];
};

type ExampleBlockData = {
  type: "example";
  title?: string;
  content: string;
};

type StepsBlockData = {
  type: "steps";
  title?: string;
  items: string[];
};

type QuizBlockData = {
  type: "quiz";
  title?: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
};

type ChartBlockData = {
  type: "chart";
  title?: string;
  chartType: "bar" | "line";
  labels: string[];
  datasets: { label: string; data: number[] }[];
};

type CodeBlockData = {
  type: "code";
  title?: string;
  language?: string;
  content: string;
};

type ImageBlockData = {
  type: "image";
  title?: string;
  url: string;
  alt?: string;
};

export type LessonBlock =
  | HeadingBlockData
  | TextBlockData
  | KeyPointsBlockData
  | TableBlockData
  | ExampleBlockData
  | StepsBlockData
  | QuizBlockData
  | ChartBlockData
  | CodeBlockData
  | ImageBlockData;

export type LessonData = {
  lessonTitle: string;
  learningType?: "VISUAL" | "AUDITORY" | "KINESTHETIC";
  blocks: LessonBlock[];
};

// ─── Learning type badge ─────────────────────────────────────────────────────

const LEARNING_TYPE_META = {
  VISUAL:       { emoji: "👁️",  label: "Vizualni",       color: "bg-purple-100 text-purple-700" },
  AUDITORY:     { emoji: "🎧",  label: "Slušni",         color: "bg-green-100 text-green-700" },
  KINESTHETIC:  { emoji: "🤲",  label: "Kinestetični",   color: "bg-amber-100 text-amber-700" },
};

// ─── Block renderer ───────────────────────────────────────────────────────────

function renderBlock(block: LessonBlock, index: number) {
  switch (block.type) {
    case "heading":
      return <HeadingBlock key={index} content={block.content} level={block.level} />;
    case "text":
      return <TextBlock key={index} content={block.content} />;
    case "key_points":
      return <KeyPointsBlock key={index} title={block.title} items={block.items} />;
    case "table":
      return <TableBlock key={index} title={block.title} headers={block.headers} rows={block.rows} />;
    case "example":
      return <ExampleBlock key={index} title={block.title} content={block.content} />;
    case "steps":
      return <StepsBlock key={index} title={block.title} items={block.items} />;
    case "quiz":
      return <QuizBlock key={index} title={block.title} questions={block.questions} />;
    case "chart":
      return (
        <ChartBlock
          key={index}
          title={block.title}
          chartType={block.chartType}
          labels={block.labels}
          datasets={block.datasets}
        />
      );
    case "code":
      return <CodeBlock key={index} title={block.title} language={block.language} content={block.content} />;
    case "image":
      return <ImageBlock key={index} title={block.title} url={block.url} alt={block.alt} />;
    default:
      return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  lesson: LessonData;
};

export default function LessonRenderer({ lesson }: Props) {
  const meta = lesson.learningType ? LEARNING_TYPE_META[lesson.learningType] : null;

  return (
    <article className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {meta && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${meta.color}`}>
            {meta.emoji} {meta.label} učni tip
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {lesson.lessonTitle}
        </h1>
        <div className="mt-3 h-1 w-16 bg-purple-500 rounded-full" />
      </div>

      {/* Blocks */}
      <div className="flex flex-col gap-1">
        {lesson.blocks.map((block, i) => renderBlock(block, i))}
      </div>

    </article>
  );
}