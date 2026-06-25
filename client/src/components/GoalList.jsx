import GoalItem from './GoalItem';

function GoalList({ goals }) {
  if (goals.length === 0) return <p className="text-gray-400 text-sm mt-6">No goals yet.</p>;

  return (
    <ul className="mt-6 list-none p-0">
      {goals.map(goal => (
        <GoalItem key={goal.id} goal={goal} />
      ))}
    </ul>
  );
}

export default GoalList;
