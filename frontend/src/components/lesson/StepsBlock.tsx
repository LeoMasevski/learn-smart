type Props = {
  title?: string;
  items: string[];
};

export default function StepsBlock({ title, items }: Props) {
  return (
    <div className="mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          {title}
        </p>
      )}
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
              {i + 1}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm sm:text-base text-gray-700">{item}</p>
              {i < items.length - 1 && (
                <div className="mt-3 ml-[-28px] w-px h-3 bg-purple-200 ml-4" />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}