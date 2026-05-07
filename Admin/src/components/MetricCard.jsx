export default function MetricCard({
  label,
  value,
  change,
  trend,
  suffix,
  onClick,
  active,
  helper,
  accent = 'teal',
}) {
  const displayValue = typeof value === 'number' && value !== null ? (value.toLocaleString?.() ?? value) : value
  const accentClasses = {
    teal: 'from-teal-600 to-emerald-500 shadow-teal-500/20',
    blue: 'from-sky-600 to-blue-500 shadow-sky-500/20',
    amber: 'from-amber-500 to-orange-400 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-500 shadow-rose-500/20',
  }

  return (
    <button
      type="button"
      className={`metric-card group text-left ${onClick ? 'cursor-pointer' : 'cursor-default'} ${
        active ? 'ring-2 ring-teal-600/35 ring-offset-2 ring-offset-white/50' : ''
      }`}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {displayValue ?? 0}
            {suffix || ''}
          </p>
        </div>
        <span
          className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${
            accentClasses[accent] || accentClasses.teal
          } shadow-lg transition duration-300 group-hover:scale-105`}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="truncate text-xs font-medium text-slate-500">{helper || 'Updated every 5 minutes'}</p>
        {change !== undefined && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : trend === 'down'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {change}%
          </span>
        )}
      </div>
    </button>
  )
}
