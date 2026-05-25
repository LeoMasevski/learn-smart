type Props = {
  title?: string;
  headers: string[];
  rows: string[][];
};

export default function TableBlock({ title, headers, rows }: Props) {
  return (
    <div className="mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          {title}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 last:border-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}