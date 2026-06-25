import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 antialiased">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-500/15">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Goal OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-sm text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3 py-1.5 text-sm font-medium bg-orange-500 text-zinc-950 rounded-lg hover:bg-orange-400 transition-colors cursor-pointer">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Show when="signed-in">
          <Dashboard />
        </Show>
        <Show when="signed-out">
          <div className="text-center mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 mb-2">Welcome to Goal OS</h2>
            <p className="text-zinc-500">Sign in or create an account to start tracking your goals.</p>
          </div>
        </Show>
      </main>
    </div>
  );
}

export default App;
