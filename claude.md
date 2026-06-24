# CLAUDE.md — Goal OS

## What this project is

A multi-user goal-tracking web app. Users sign up, create goals across three time
horizons (short / medium / long term), break goals into tasks, log daily progress,
and see a visual timeline. The app warns users when they are falling behind the pace
needed to hit a goal's deadline.

This is an MVP intended to grow into a larger product, but it is ALSO a learning
project. The developer (a junior dev) must understand every line. Teaching matters
more than speed.

## The most important rule

I (the developer) must be able to explain every piece of code in my own words.
Do NOT write code I have not been walked through. If you write something, explain
what each part does and why, in simple language, right after writing it.

## How to work with me

- ONE small feature/slice at a time. Never build multiple features in a single go.
- ALWAYS use Plan Mode first: propose your plan, wait for my approval, THEN write code.
- Before adding ANY library, dependency, file, or feature I did not explicitly ask
  for: STOP and ask me first. Do not "helpfully" add extras.
- If my request is bigger than one slice, tell me and help me break it down. Do not
  silently build the whole thing.
- Keep code simple and readable over clever or "optimized." I am learning.
- After each working slice, remind me to commit to git before we move on.
- If I ask for something that seems like scope creep or premature optimization, say
  so directly. I have a known habit of "preparing to prepare" — over-planning and
  over-building instead of shipping. Call it out when you see it.
- Be direct and honest. No motivational filler. If something I want to do is a bad
  idea, tell me plainly and explain why.

## Tech stack (do not change without asking)

- Frontend: React (Vite)
- Backend: Express (Node.js)
- Database: Supabase (hosted Postgres)
- Auth: Clerk (do NOT hand-roll authentication — Clerk handles login/signup/sessions)
- No TypeScript for now (keep it simple); plain JavaScript.

## Architecture rules

- The Express server's job is to talk to the database and protect secrets. The React
  app never touches the database or secret keys directly.
- All secret keys (Supabase service key, Clerk secret key) live in a .env file on the
  server and are NEVER committed to git or exposed to the frontend.
- Every goal, task, and daily log in the database belongs to a user. Always tag rows
  with the Clerk userId. A user must only ever see and edit their own data — protect
  every data route so one user can never read or change another user's data.
- Keep frontend and backend code in their existing folders (client/ and server/).

## Data model (current plan — confirm before changing)

- users: handled by Clerk (we just store the Clerk userId as a reference)
- goals: id, user_id, title, why (the motivation), horizon (short/medium/long),
  start_date, target_date, hours_per_period, period (day/week), created_at
- tasks: id, goal_id, title, is_done, created_at
- daily_logs: id, user_id, goal_id, log_date, note, created_at

## Security (this app has real users — take this seriously)

- Never log secret keys or full user records to the console.
- Validate and sanitize anything coming from the user before it touches the database.
- Never put user data or secrets in a URL.
- If you are about to do anything irreversible (delete data, change DB schema in a way
  that drops data), STOP and warn me first.

## Build order (do not skip ahead)

1. Express server with a health-check route. (DONE / IN PROGRESS — update me)
2. Connect to Supabase; create the goals table; one route to create + list goals.
3. React: a form to create a goal, and a list showing the goals.
4. Add Clerk login so each user sees only their own goals.
5. Tasks under a goal + check them off + progress bar.
6. Daily check-in screen.
7. The timeline view (visual progress bar with goals placed along it).
8. The drift/risk warnings (pure date math — no AI needed).
   Everything past step 8 is "later." Do not suggest building it now.
