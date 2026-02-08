import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function buildData(runs, windowSize = 5) {
  const sorted = [...runs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  return sorted.map((run, index) => {
    const sliceStart = Math.max(0, index - windowSize + 1);
    const window = sorted.slice(sliceStart, index + 1);
    const avg =
      window.reduce((sum, item) => sum + item.score, 0) / window.length;
    return {
      id: run.id,
      date: new Date(run.created_at).toLocaleDateString(),
      score: run.score,
      avg: Math.round(avg * 10) / 10,
    };
  });
}

export default function HistoryChart({ runs, showAvg }) {
  const data = buildData(runs);

  return (
    <div className="chart-card">
      <div className="chart-title">Score over time</div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#ff7a18" strokeWidth={3} />
            {showAvg && (
              <Line type="monotone" dataKey="avg" stroke="#1456ff" strokeWidth={2} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
