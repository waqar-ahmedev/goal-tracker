import { STATUS_COLOURS, STATUS_LABELS, STATUS_TEXT_COLOURS } from '../utils/risk';

// `items` is [{ goal, status, message }] for goals that are slipping or at-risk.
function DriftPanel({ items }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-100">Drift &amp; risk</h2>
        <span className="text-xs font-mono tabular-nums text-zinc-500">
          {items.length} need{items.length === 1 ? 's' : ''} attention
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-emerald-400">All goals are on track.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ goal, status, message }) => (
            <li
              key={goal.id}
              className={`flex items-start gap-3 rounded-lg border-l-2 bg-zinc-950/40 px-3 py-2.5 ${
                status === 'at-risk' ? 'border-red-500' : 'border-amber-500'
              }`}
            >
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLOURS[status]}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-zinc-100">{goal.title}</span>
                  <span className={`shrink-0 text-xs font-medium ${STATUS_TEXT_COLOURS[status]}`}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                {message && <p className="mt-0.5 text-xs text-zinc-400">{message}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DriftPanel;
