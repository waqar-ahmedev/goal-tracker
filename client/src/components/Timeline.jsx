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

  if (filtered.length === 0) {
    return (
      <div>
        <Tabs horizon={horizon} setHorizon={setHorizon} />
        <p className="text-sm text-gray-400 mt-8 text-center">No {horizon}-term goals yet.</p>
      </div>
    );
  }

  const minMs = Math.min(...filtered.map(g => new Date(g.start_date).getTime()));
  const maxMs = Math.max(...filtered.map(g => new Date(g.target_date).getTime()));
  const todayPct = Math.max(0, Math.min(100, toPct(today, minMs, maxMs)));

  return (
    <div>
      <Tabs horizon={horizon} setHorizon={setHorizon} />

      <div className="mt-6 space-y-3">
        {filtered.map(goal => {
          const startPct = toPct(goal.start_date, minMs, maxMs);
          const endPct   = toPct(goal.target_date, minMs, maxMs);
          const { status } = getRiskStatus(goal);
          const bandColour = STATUS_COLOURS[status] ?? 'bg-violet-400';
          return (
            <div key={goal.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-right text-sm text-gray-600 truncate" title={goal.title}>
                {goal.title}
              </span>
              <div className="flex-1 relative h-4 bg-gray-100 rounded-full">
                {/* goal band — coloured by risk status */}
                <div
                  className={`absolute top-0 h-full rounded-full ${bandColour}`}
                  style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                />
                {/* today marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-red-400 z-10"
                  style={{ left: `${todayPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* date axis */}
      <div className="flex justify-between text-xs text-gray-400 mt-2" style={{ paddingLeft: '7.75rem' }}>
        <span>{fmt(new Date(minMs))}</span>
        <div className="flex items-center gap-1">
          <span className="w-0.5 h-2 bg-red-400 inline-block" />
          <span className="text-red-400">today</span>
        </div>
        <span>{fmt(new Date(maxMs))}</span>
      </div>
    </div>
  );
}

function Tabs({ horizon, setHorizon }) {
  return (
    <div className="flex gap-1">
      {HORIZONS.map(h => (
        <button
          key={h}
          onClick={() => setHorizon(h)}
          className={`px-4 py-1.5 text-sm rounded-lg capitalize cursor-pointer ${
            horizon === h
              ? 'bg-violet-100 text-violet-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {h}
        </button>
      ))}
    </div>
  );
}

export default Timeline;
