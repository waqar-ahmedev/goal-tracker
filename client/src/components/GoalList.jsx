function GoalList({ goals }) {
  if (goals.length === 0) return <p>No goals yet.</p>;

  return (
    <ul>
      {goals.map(goal => (
        <li key={goal.id}>
          <strong>{goal.title}</strong> — {goal.horizon} term
        </li>
      ))}
    </ul>
  );
}

export default GoalList;
