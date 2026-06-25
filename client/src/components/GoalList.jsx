import GoalItem from './GoalItem';

// Grid wrapper. Tasks + handlers are threaded through from the Dashboard.
function GoalList({ goals, tasksByGoal, onToggle, onAddTask }) {
  if (goals.length === 0) {
    return (
      <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl px-6 py-12 text-center">
        <h3 className="text-sm font-semibold text-zinc-200">No goals yet</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Add your first goal above to start tracking progress.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 list-none p-0 m-0">
      {goals.map(goal => (
        <GoalItem
          key={goal.id}
          goal={goal}
          tasks={tasksByGoal[goal.id] || []}
          onToggle={onToggle}
          onAddTask={onAddTask}
        />
      ))}
    </ul>
  );
}

export default GoalList;
