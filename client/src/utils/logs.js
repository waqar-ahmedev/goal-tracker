// Helpers that turn a list of check-in logs into the shapes the consistency
// heatmap and the streak counter need. Every log row has a `log_date` string
// in 'YYYY-MM-DD' (UTC) form — created that way in CheckIn — so we work in UTC
// here too, to stay consistent with the stored values.

// Format a Date as a UTC 'YYYY-MM-DD' string.
export function toISODate(date) {
  return date.toISOString().split('T')[0];
}

// Count how many check-ins happened on each date: { '2026-06-20': 2, ... }
export function logCountsByDate(logs) {
  const counts = {};
  for (const log of logs) {
    counts[log.log_date] = (counts[log.log_date] || 0) + 1;
  }
  return counts;
}

// An array of the last n calendar days (UTC), oldest first, as Date objects.
export function lastNDays(n) {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(todayUTC - i * 86400000));
  }
  return days;
}

// How many consecutive days up to today have at least one check-in. If there's
// no check-in today yet, the streak can still count up to yesterday.
export function currentStreak(logs) {
  const dates = new Set(logs.map(l => l.log_date));
  const now = new Date();
  let cursor = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (!dates.has(toISODate(new Date(cursor)))) {
    cursor -= 86400000; // nothing logged today — start counting from yesterday
  }

  let streak = 0;
  while (dates.has(toISODate(new Date(cursor)))) {
    streak++;
    cursor -= 86400000;
  }
  return streak;
}
