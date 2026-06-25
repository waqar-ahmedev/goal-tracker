import { useState } from 'react';
import { useAuth } from '@clerk/react';

const INITIAL_FORM = {
  title: '',
  why: '',
  horizon: 'short',
  start_date: '',
  target_date: '',
  hours_per_period: '',
  period: 'day',
};

// Shared field styling — kept in one place so every input matches.
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1';
const fieldCls =
  'w-full text-sm text-zinc-100 placeholder-zinc-600 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 transition-colors focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30';

function GoalForm({ onGoalCreated }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const newGoal = await res.json();
      if (!res.ok) {
        setError(newGoal.error || 'Server returned an error');
        return;
      }
      onGoalCreated(newGoal);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError('Could not reach the server. Is it running on port 3000?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-100 mb-4">New goal</h3>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className={labelCls}>Title</label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Ship the MVP"
            value={form.title}
            onChange={handleChange}
            required
            className={fieldCls}
          />
        </div>

        <div>
          <label htmlFor="why" className={labelCls}>
            Why <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            id="why"
            name="why"
            placeholder="What makes this matter?"
            value={form.why}
            onChange={handleChange}
            className={fieldCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="horizon" className={labelCls}>Horizon</label>
            <select id="horizon" name="horizon" value={form.horizon} onChange={handleChange} className={fieldCls}>
              <option value="short">Short term</option>
              <option value="medium">Medium term</option>
              <option value="long">Long term</option>
            </select>
          </div>

          <div>
            <label htmlFor="period" className={labelCls}>Period</label>
            <select id="period" name="period" value={form.period} onChange={handleChange} className={fieldCls}>
              <option value="day">Per day</option>
              <option value="week">Per week</option>
            </select>
          </div>

          <div>
            <label htmlFor="start_date" className={labelCls}>Start date</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              required
              className={fieldCls}
            />
          </div>

          <div>
            <label htmlFor="target_date" className={labelCls}>Target date</label>
            <input
              id="target_date"
              name="target_date"
              type="date"
              value={form.target_date}
              onChange={handleChange}
              required
              className={fieldCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="hours_per_period" className={labelCls}>Hours per period</label>
            <input
              id="hours_per_period"
              name="hours_per_period"
              type="number"
              placeholder="e.g. 2"
              value={form.hours_per_period}
              onChange={handleChange}
              required
              className={fieldCls}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 px-4 py-2 text-sm font-medium bg-orange-500 text-zinc-950 rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {submitting ? 'Saving…' : 'Add goal'}
      </button>
    </form>
  );
}

export default GoalForm;
