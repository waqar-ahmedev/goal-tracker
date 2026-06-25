import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';

const today = new Date().toISOString().split('T')[0];

function CheckIn({ goals }) {
  const { getToken } = useAuth();
  const [todayLogs, setTodayLogs] = useState([]);
  const [pastLogs, setPastLogs] = useState([]);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [todayRes, allRes] = await Promise.all([
        fetch(`http://localhost:3000/api/logs?date=${today}`, { headers }),
        fetch('http://localhost:3000/api/logs', { headers }),
      ]);

      setTodayLogs(await todayRes.json());
      setPastLogs(await allRes.json());
    }
    load().catch(err => console.error('Failed to load logs:', err));
  }, []);

  const alreadyLoggedIds = new Set(todayLogs.map(l => l.goal_id).filter(Boolean));

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
      setTodayLogs([...todayLogs, ...newLogs]);
      setPastLogs([...newLogs, ...pastLogs]);
      setCheckedIds(new Set());
      setNote('');
    } finally {
      setSubmitting(false);
    }
  }

  const goalMap = Object.fromEntries(goals.map(g => [g.id, g.title]));

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Daily Check-in</h2>
      <p className="text-sm text-gray-400 mb-6">{today}</p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3">Which goals did you make progress on today?</p>

        <ul className="space-y-2 mb-4">
          {goals.map(goal => {
            const done = alreadyLoggedIds.has(goal.id);
            const checked = done || checkedIds.has(goal.id);
            return (
              <li key={goal.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={done}
                  onChange={() => toggleGoal(goal.id)}
                  className="accent-violet-600 cursor-pointer disabled:cursor-default"
                />
                <span className={done ? 'text-gray-400' : 'text-gray-700'}>
                  {goal.title}
                  {done && <span className="ml-2 text-xs text-violet-400">✓ logged</span>}
                </span>
              </li>
            );
          })}
        </ul>

        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional note (what did you do?)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />

        <button
          type="submit"
          disabled={submitting || checkedIds.size === 0}
          className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 cursor-pointer disabled:cursor-default"
        >
          {submitting ? 'Saving…' : 'Log progress'}
        </button>
      </form>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past check-ins</h3>
      {pastLogs.length === 0 ? (
        <p className="text-sm text-gray-400">No check-ins yet.</p>
      ) : (
        <ul className="space-y-2">
          {pastLogs.map(log => (
            <li key={log.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {log.goal_id ? (goalMap[log.goal_id] ?? 'Deleted goal') : 'General'}
                </span>
                <span className="text-gray-400 text-xs">{log.log_date}</span>
              </div>
              {log.note && <p className="text-gray-500 mt-1">{log.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CheckIn;
