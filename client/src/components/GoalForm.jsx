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
    <form onSubmit={handleSubmit}>
      <div>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      </div>
      <div>
        <input name="why" placeholder="Why (optional)" value={form.why} onChange={handleChange} />
      </div>
      <div>
        <select name="horizon" value={form.horizon} onChange={handleChange}>
          <option value="short">Short term</option>
          <option value="medium">Medium term</option>
          <option value="long">Long term</option>
        </select>
      </div>
      <div>
        <label>Start date: <input name="start_date" type="date" value={form.start_date} onChange={handleChange} required /></label>
      </div>
      <div>
        <label>Target date: <input name="target_date" type="date" value={form.target_date} onChange={handleChange} required /></label>
      </div>
      <div>
        <input name="hours_per_period" type="number" placeholder="Hours per period" value={form.hours_per_period} onChange={handleChange} required />
      </div>
      <div>
        <select name="period" value={form.period} onChange={handleChange}>
          <option value="day">Per day</option>
          <option value="week">Per week</option>
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Add Goal'}
      </button>
    </form>
  );
}

export default GoalForm;
