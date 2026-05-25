import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

type Dataset = {
  label: string;
  data: number[];
};

type Props = {
  title?: string;
  chartType: "bar" | "line";
  labels: string[];
  datasets: Dataset[];
};

const COLORS = ["#7c3aed", "#60a5fa", "#34d399", "#f59e0b", "#f43f5e"];

export default function ChartBlock({ title, chartType, labels, datasets }: Props) {
  const chartData = labels.map((label, i) => {
    const entry: Record<string, string | number> = { name: label };
    datasets.forEach((ds) => {
      entry[ds.label] = ds.data[i] ?? 0;
    });
    return entry;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-4">
      {title && (
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          {title}
        </p>
      )}
      <div className="w-full h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {datasets.map((ds, i) => (
                <Bar key={ds.label} dataKey={ds.label} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {datasets.map((ds, i) => (
                <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}