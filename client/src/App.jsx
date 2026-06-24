import { useState, useEffect } from 'react';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import './App.css';

function App() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/goals')
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(err => console.error('Failed to fetch goals:', err));
  }, []);

  function handleGoalCreated(newGoal) {
    setGoals([...goals, newGoal]);
  }

  return (
    <div>
      <h1>Goal OS</h1>
      <GoalForm onGoalCreated={handleGoalCreated} />
      <GoalList goals={goals} />
    </div>
  );
}

export default App;
