type Props = {
  title?: string;
  content: string;
};

export default function ExampleBlock({ title, content }: Props) {
  return (
    <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-2xl px-4 sm:px-5 py-4 mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
        {title ?? "Primer"}
      </p>
      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}