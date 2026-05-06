export default function MetricCard({ label, value, change, trend }) {
  return (
    <div className="metric-card">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value?.toLocaleString?.() || 0}</p>
      {change !== undefined && (
        <p className={`mt-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}%
        </p>
      )}
    </div>
  )
}
