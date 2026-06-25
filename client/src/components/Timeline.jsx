import { useState } from 'react';
import { getRiskStatus, STATUS_COLOURS } from '../utils/risk';

const HORIZONS = ['short', 'medium', 'long'];
const today = new Date().toISOString().split('T')[0];

function toPct(dateStr, minMs, maxMs) {
  return ((new Date(dateStr).getTime() - minMs) / (maxMs - minMs)) * 100;
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function Timeline({ goals }) {
  const [horizon, setHorizon] = useState('short');

  const filtered = goals.filter(g => g.horizon === horizon);

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-100">Timeline</h2>
        <Tabs horizon={horizon} setHorizon={setHorizon} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 py-6 text-center">No {horizon}-term goals yet.</p>
      ) : (
        <TimelineBars filtered={filtered} />
      )}
    </section>
  );
}

function TimelineBars({ filtered }) {
  const minMs = Math.min(...filtered.map(g => new Date(g.start_date).getTime()));
  const maxMs = Math.max(...filtered.map(g => new Date(g.target_date).getTime()));
  const todayPct = Math.max(0, Math.min(100, toPct(today, minMs, maxMs)));

  return (
    <>
      <div className="space-y-3">
        {filtered.map(goal => {
          const startPct = toPct(goal.start_date, minMs, maxMs);
          const endPct = toPct(goal.target_date, minMs, maxMs);
          const { status } = getRiskStatus(goal);
          const bandColour = STATUS_COLOURS[status] ?? 'bg-orange-500';
          return (
            <div key={goal.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-xs text-zinc-400 truncate" title={goal.title}>
                {goal.title}
              </span>
              <div className="flex-1 relative h-4 bg-zinc-800 rounded-full">
                {/* goal band — coloured by risk status */}
                <div
                  className={`absolute top-0 h-full rounded-full ${bandColour}`}
                  style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                />
                {/* today marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-zinc-100 z-10"
                  style={{ left: `${todayPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* date axis */}
      <div className="flex justify-between text-xs text-zinc-600 mt-3" style={{ paddingLeft: '6.75rem' }}>
        <span>{fmt(new Date(minMs))}</span>
        <div className="flex items-center gap-1">
          <span className="w-0.5 h-2 bg-zinc-100 inline-block" />
          <span className="text-zinc-400">today</span>
        </div>
        <span>{fmt(new Date(maxMs))}</span>
      </div>
    </>
  );
}

function Tabs({ horizon, setHorizon }) {
  return (
    <div className="flex gap-1">
      {HORIZONS.map(h => (
        <button
          key={h}
          onClick={() => setHorizon(h)}
          className={`px-3 py-1 text-xs rounded-md capitalize cursor-pointer transition-colors ${
            horizon === h
              ? 'bg-zinc-800 text-zinc-100 font-medium'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {h}
        </button>
      ))}
    </div>
  );
}

export default Timeline;
