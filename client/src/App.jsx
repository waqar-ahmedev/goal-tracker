import { useState, useEffect } from 'react';
import { useAuth, Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';

function App() {
  const { getToken, isSignedIn } = useAuth();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchGoals() {
      const token = await getToken();
      const res = await fetch('http://localhost:3000/api/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGoals(data);
    }

    fetchGoals().catch(err => console.error('Failed to fetch goals:', err));
  }, [isSignedIn]);

  function handleGoalCreated(newGoal) {
    setGoals([...goals, newGoal]);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">Goal OS</span>
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer">
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <Show when="signed-in">
          <GoalForm onGoalCreated={handleGoalCreated} />
          <GoalList goals={goals} />
        </Show>
        <Show when="signed-out">
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Welcome to Goal OS</h2>
            <p className="text-gray-500">Sign in or create an account to start tracking your goals.</p>
          </div>
        </Show>
      </main>
    </div>
  );
}

export default App;
