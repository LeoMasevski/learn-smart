type Props = {
  title?: string;
  items: string[];
};

export default function KeyPointsBlock({ title, items }: Props) {
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 sm:p-5 mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-3">
          {title}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}