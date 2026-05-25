type Props = {
  content: string;
  level?: 1 | 2 | 3;
};

export default function HeadingBlock({ content, level = 1 }: Props) {
  const sizes: Record<number, string> = {
    1: "text-2xl sm:text-3xl font-bold text-gray-900 border-b-2 border-purple-100 pb-3",
    2: "text-xl sm:text-2xl font-bold text-gray-800",
    3: "text-lg sm:text-xl font-semibold text-gray-700",
  };

  return (
    <div className="mb-4">
      {level === 1 && <h1 className={sizes[1]}>{content}</h1>}
      {level === 2 && <h2 className={sizes[2]}>{content}</h2>}
      {level === 3 && <h3 className={sizes[3]}>{content}</h3>}
    </div>
  );
}