// Dark-theme friendly. Used for status dots and timeline bands.
export const STATUS_COLOURS = {
  'on-track': 'bg-emerald-500',
  'slipping':  'bg-amber-500',
  'at-risk':   'bg-red-500',
  'done':      'bg-zinc-600',
  'neutral':   'bg-zinc-600',
};

export const STATUS_LABELS = {
  'on-track': 'On track',
  'slipping':  'Slipping',
  'at-risk':   'At risk',
  'done':      'Done',
  'neutral':   'No tasks',
};

export const STATUS_TEXT_COLOURS = {
  'on-track': 'text-emerald-400',
  'slipping':  'text-amber-400',
  'at-risk':   'text-red-400',
  'done':      'text-zinc-500',
  'neutral':   'text-zinc-500',
};

/**
 * Compute drift/risk status for a goal.
 *
 * Pass done + total for the full calculation (used in GoalItem where task
 * data is available). Omit them to get a time-only approximation (used in
 * Timeline where task data is not fetched).
 */
export function getRiskStatus(goal, done, total) {
  const now = Date.now();
  const start = new Date(goal.start_date).getTime();
  const end   = new Date(goal.target_date).getTime();
  const totalDays   = Math.max(1, (end - start) / 86400000);
  const daysElapsed = Math.max(0, (now - start) / 86400000);
  const timePct     = Math.min(100, (daysElapsed / totalDays) * 100);

  // Time-only mode — used when task counts are not available (Timeline)
  if (done === undefined || done === null) {
    if (timePct >= 80) return { status: 'at-risk' };
    if (timePct >= 50) return { status: 'slipping' };
    return { status: 'on-track' };
  }

  // Full computation — used when task data is available (GoalItem)
  if (total === 0) {
    return { status: 'neutral', message: 'No tasks — can\'t measure progress.' };
  }

  const workPct = (done / total) * 100;

  if (workPct >= 100) {
    return { status: 'done', message: 'All tasks complete.' };
  }

  const gap = timePct - workPct;

  if (gap <= 10) {
    return { status: 'on-track', message: 'On track.' };
  }

  let message;
  if (workPct === 0) {
    message = 'No progress recorded — falling behind.';
  } else {
    const projectedTotalDays = daysElapsed / (workPct / 100);
    const overshootDays      = projectedTotalDays - totalDays;
    const overshootWeeks     = Math.round(overshootDays / 7);
    if (overshootWeeks <= 0) {
      message = 'Behind but may still make it.';
    } else {
      message = `At this pace you'll finish about ${overshootWeeks} week${overshootWeeks !== 1 ? 's' : ''} late.`;
    }
  }

  if (gap <= 30) return { status: 'slipping', message };
  return { status: 'at-risk', message };
}
