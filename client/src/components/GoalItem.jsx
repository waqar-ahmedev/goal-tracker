import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { getRiskStatus, STATUS_COLOURS, STATUS_LABELS, STATUS_TEXT_COLOURS } from '../utils/risk';

function GoalItem({ goal }) {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:3000/api/tasks?goal_id=${goal.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTasks(data);
    }
    fetchTasks().catch(err => console.error('Failed to fetch tasks:', err));
  }, [goal.id]);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal_id: goal.id, title: newTitle.trim() }),
      });
      const created = await res.json();
      if (res.ok) {
        setTasks([...tasks, created]);
        setNewTitle('');
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(task) {
    const token = await getToken();
    const res = await fetch(`http://localhost:3000/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_done: !task.is_done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
    }
  }

  const done = tasks.filter(t => t.is_done).length;
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const { status, message } = getRiskStatus(goal, done, total);

  return (
    <li className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${STATUS_COLOURS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <span className="text-xs text-gray-400 capitalize">{goal.horizon} term</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{done} / {total} tasks</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Risk message */}
      {message && (
        <p className={`text-xs mb-3 ${STATUS_TEXT_COLOURS[status]}`}>{message}</p>
      )}

      {/* Task list */}
      <ul className="mb-3 space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={() => handleToggle(task)}
              className="accent-violet-600 cursor-pointer"
            />
            <span className={task.is_done ? 'line-through text-gray-400' : 'text-gray-700'}>
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
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          type="submit"
          disabled={adding}
          className="text-sm px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
        >
          Add
        </button>
      </form>
    </li>
  );
}

export default GoalItem;
