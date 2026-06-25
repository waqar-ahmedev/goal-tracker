import { useState } from 'react';
import { getRiskStatus, STATUS_COLOURS, STATUS_LABELS, STATUS_TEXT_COLOURS } from '../utils/risk';

// Presentational: tasks + handlers come from the Dashboard (the data owner).
// Local state is only the add-task input.
function GoalItem({ goal, tasks, onToggle, onAddTask }) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const ok = await onAddTask(goal.id, newTitle.trim());
      if (ok) setNewTitle('');
    } finally {
      setAdding(false);
    }
  }

  const done = tasks.filter(t => t.is_done).length;
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const { status, message } = getRiskStatus(goal, done, total);

  return (
    <li className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-colors hover:border-zinc-700">
      {/* Header: title clamps to 2 lines; status + horizon never get squeezed */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="min-w-0 break-words line-clamp-2 text-base font-semibold text-zinc-100">
          {goal.title}
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_TEXT_COLOURS[status]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLOURS[status]}`} />
            {STATUS_LABELS[status]}
          </span>
          <span className="text-xs text-zinc-500 capitalize">{goal.horizon} term</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center text-xs text-zinc-500 mb-1.5">
          <span>Progress</span>
          <span className="font-mono tabular-nums">{done} / {total} tasks</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Risk message */}
      {message && (
        <p className={`text-xs mb-4 ${STATUS_TEXT_COLOURS[status]}`}>{message}</p>
      )}

      {/* Task list */}
      <ul className="space-y-1.5 mb-4">
        {tasks.map(task => (
          <li key={task.id} className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={() => onToggle(task)}
              className="mt-0.5 accent-orange-500 cursor-pointer"
            />
            <span className={`min-w-0 break-words ${task.is_done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>

      {/* Add task form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 min-w-0 text-sm text-zinc-100 placeholder-zinc-600 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        />
        <button
          type="submit"
          disabled={adding}
          className="shrink-0 text-sm px-3 py-1.5 bg-orange-500 text-zinc-950 font-medium rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Add
        </button>
      </form>
    </li>
  );
}

export default GoalItem;
