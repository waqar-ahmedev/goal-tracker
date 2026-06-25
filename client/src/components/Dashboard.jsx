import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { getRiskStatus } from '../utils/risk';
import { currentStreak } from '../utils/logs';
import StatCard from './StatCard';
import DriftPanel from './DriftPanel';
import GoalForm from './GoalForm';
import GoalList from './GoalList';
import Timeline from './Timeline';
import CheckIn from './CheckIn';
import Consistency from './Consistency';

const API = 'http://localhost:3000/api';

// The single data owner. Fetches goals, all tasks, and all logs once, derives
// everything the page needs, and passes data + handlers down to presentational
// children.
function Dashboard() {
  const { getToken } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [g, t, l] = await Promise.all([
        fetch(`${API}/goals`, { headers }).then(r => r.json()),
        fetch(`${API}/tasks`, { headers }).then(r => r.json()),
        fetch(`${API}/logs`, { headers }).then(r => r.json()),
      ]);
      setGoals(g);
      setTasks(t);
      setLogs(l);
      setLoading(false);
    }
    load().catch(err => {
      console.error('Failed to load dashboard:', err);
      setLoading(false);
    });
  }, []);

  // Group tasks by their goal so each card gets just its own tasks.
  const tasksByGoal = {};
  for (const task of tasks) {
    (tasksByGoal[task.goal_id] ||= []).push(task);
  }

  function handleGoalCreated(newGoal) {
    setGoals(prev => [...prev, newGoal]);
  }

  async function handleToggle(task) {
    const token = await getToken();
    const res = await fetch(`${API}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_done: !task.is_done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    }
  }

  async function handleAddTask(goalId, title) {
    const token = await getToken();
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ goal_id: goalId, title }),
    });
    if (!res.ok) return false;
    const created = await res.json();
    setTasks(prev => [...prev, created]);
    return true;
  }

  function handleLogged(newLogs) {
    setLogs(prev => [...newLogs, ...prev]);
  }

  // Derived numbers — recomputed each render from the shared state above.
  const statuses = goals.map(goal => {
    const gt = tasksByGoal[goal.id] || [];
    const done = gt.filter(t => t.is_done).length;
    const { status, message } = getRiskStatus(goal, done, gt.length);
    return { goal, status, message };
  });
  const atRisk = statuses.filter(s => s.status === 'at-risk').length;
  const driftItems = statuses.filter(s => s.status === 'at-risk' || s.status === 'slipping');
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.is_done).length;
  const donePct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const streak = currentStreak(logs);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Your goals at a glance</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active goals"
          value={goals.length}
          sub={`${goals.length === 1 ? 'goal' : 'goals'} tracked`}
        />
        <StatCard
          label="At risk"
          value={atRisk}
          accent={atRisk ? 'text-red-400' : 'text-emerald-400'}
          sub={atRisk ? 'need attention' : 'all on track'}
        />
        <StatCard
          label="Tasks done"
          value={`${donePct}%`}
          sub={`${doneTasks}/${totalTasks} tasks`}
        />
        <StatCard
          label="Check-in streak"
          value={`${streak}d`}
          accent="text-orange-400"
          sub="consecutive days"
        />
      </div>

      <DriftPanel items={driftItems} />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-100">Goals</h2>
        <GoalForm onGoalCreated={handleGoalCreated} />
        <GoalList
          goals={goals}
          tasksByGoal={tasksByGoal}
          onToggle={handleToggle}
          onAddTask={handleAddTask}
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Timeline goals={goals} />
        <CheckIn goals={goals} logs={logs} onLogged={handleLogged} />
      </div>

      <Consistency logs={logs} />
    </div>
  );
}

export default Dashboard;
