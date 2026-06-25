import { useState } from 'react';
import { useAuth } from '@clerk/react';

const today = new Date().toISOString().split('T')[0];

// Presentational for reads: `logs` come from the Dashboard. Still POSTs new
// check-ins itself, then reports them up via `onLogged` so the heatmap updates.
function CheckIn({ goals, logs, onLogged }) {
  const { getToken } = useAuth();
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const alreadyLoggedIds = new Set(
    logs.filter(l => l.log_date === today).map(l => l.goal_id).filter(Boolean)
  );

  function toggleGoal(goalId) {
    if (alreadyLoggedIds.has(goalId)) return;
    const next = new Set(checkedIds);
    next.has(goalId) ? next.delete(goalId) : next.add(goalId);
    setCheckedIds(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (checkedIds.size === 0) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const newLogs = [];
      for (const goalId of checkedIds) {
        const res = await fetch('http://localhost:3000/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ goal_id: goalId, log_date: today, note: note || null }),
        });
        if (res.ok) newLogs.push(await res.json());
      }
      if (newLogs.length) onLogged(newLogs);
      setCheckedIds(new Set());
      setNote('');
    } finally {
      setSubmitting(false);
    }
  }

  const goalMap = Object.fromEntries(goals.map(g => [g.id, g.title]));

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-100">Daily check-in</h2>
        <span className="text-xs font-mono tabular-nums text-zinc-500">{today}</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <p className="text-xs text-zinc-400 mb-3">Which goals did you make progress on today?</p>

        {goals.length === 0 ? (
          <p className="text-sm text-zinc-600 mb-4">Add a goal first to check in.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {goals.map(goal => {
              const done = alreadyLoggedIds.has(goal.id);
              const checked = done || checkedIds.has(goal.id);
              return (
                <li key={goal.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={done}
                    onChange={() => toggleGoal(goal.id)}
                    className="accent-orange-500 cursor-pointer disabled:cursor-default"
                  />
                  <span className={done ? 'text-zinc-600' : 'text-zinc-300'}>
                    {goal.title}
                    {done && <span className="ml-2 text-xs text-orange-400">✓ logged</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional note (what did you do?)"
          className="w-full text-sm text-zinc-100 placeholder-zinc-600 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 mb-4 transition-colors focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        />

        <button
          type="submit"
          disabled={submitting || checkedIds.size === 0}
          className="px-4 py-2 text-sm font-medium bg-orange-500 text-zinc-950 rounded-lg hover:bg-orange-400 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-default"
        >
          {submitting ? 'Saving…' : 'Log progress'}
        </button>
      </form>

      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Past check-ins</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-zinc-600">No check-ins yet.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {logs.map(log => (
            <li key={log.id} className="bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-200">
                  {log.goal_id ? (goalMap[log.goal_id] ?? 'Deleted goal') : 'General'}
                </span>
                <span className="text-zinc-500 text-xs font-mono tabular-nums">{log.log_date}</span>
              </div>
              {log.note && <p className="text-zinc-400 mt-1">{log.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default CheckIn;
