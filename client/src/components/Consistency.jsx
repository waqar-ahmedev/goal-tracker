import { logCountsByDate, lastNDays, toISODate, currentStreak } from '../utils/logs';

// Heatmap intensity by number of check-ins on a day.
const LEVELS = [
  'bg-zinc-800',       // 0 — no check-in
  'bg-orange-500/30',  // 1
  'bg-orange-500/60',  // 2
  'bg-orange-500',     // 3+
];

function level(count) {
  if (!count) return 0;
  if (count >= 3) return 3;
  return count;
}

function Consistency({ logs }) {
  const counts = logCountsByDate(logs);
  const days = lastNDays(84); // 12 weeks
  const streak = currentStreak(logs);
  const totalCheckins = logs.length;
  const goalsLogged = new Set(logs.map(l => l.goal_id).filter(Boolean)).size;

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-zinc-100 mb-4">Consistency</h2>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        {/* Heatmap: 84 cells filled column-by-column, 7 rows = one week per column */}
        <div className="overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-1 w-max">
            {days.map(d => {
              const iso = toISODate(d);
              const n = counts[iso] || 0;
              return (
                <div
                  key={iso}
                  title={`${iso} — ${n} check-in${n === 1 ? '' : 's'}`}
                  className={`h-3 w-3 rounded-sm ${LEVELS[level(n)]}`}
                />
              );
            })}
          </div>
          <p className="mt-3 text-xs text-zinc-600">Last 12 weeks</p>
        </div>

        {/* Session stats */}
        <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-3 lg:border-l lg:border-zinc-800 lg:pl-6">
          <Stat label="Current streak" value={`${streak}d`} accent="text-orange-400" />
          <Stat label="Total check-ins" value={totalCheckins} />
          <Stat label="Goals logged" value={goalsLogged} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className={`mt-1 text-xl font-mono tabular-nums ${accent ?? 'text-zinc-100'}`}>{value}</dd>
    </div>
  );
}

export default Consistency;
