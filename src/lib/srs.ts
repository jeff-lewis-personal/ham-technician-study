import { QUESTIONS } from "./data";
import type { ProgressState, Question } from "./types";

export const MAX_BOX = 5;
const DAY = 86_400_000;
// interval (in days) before a card in each box becomes due again
const INTERVAL_DAYS = [0, 1, 3, 7, 16, 35]; // index by box (0..MAX_BOX)

/** How many cards a Smart Review session serves at once. */
export const SESSION_SIZE = 20;

/** Leitner update: correct promotes a box, wrong resets to box 0 (due now). */
export function nextSchedule(
  box: number,
  wasCorrect: boolean,
  now: number = Date.now(),
): { box: number; due: number } {
  const current = Number.isInteger(box) ? box : 0;
  if (!wasCorrect) return { box: 0, due: now };
  const newBox = Math.min(current + 1, MAX_BOX);
  return { box: newBox, due: now + INTERVAL_DAYS[newBox] * DAY };
}

function attempts(state: ProgressState, id: string): number {
  const s = state.questions[id];
  return (s?.correct ?? 0) + (s?.incorrect ?? 0);
}

export interface SrsCounts {
  due: number; // previously answered and due for review now
  fresh: number; // never attempted
}

export function srsCounts(state: ProgressState, now: number = Date.now()): SrsCounts {
  let due = 0;
  let fresh = 0;
  for (const q of QUESTIONS) {
    const s = state.questions[q.id];
    if (attempts(state, q.id) === 0) {
      fresh += 1;
    } else if (s?.due != null && s.due <= now) {
      due += 1;
    }
  }
  return { due, fresh };
}

/** How many cards are available for a Smart Review session right now. */
export function srsAvailable(state: ProgressState, now: number = Date.now()): number {
  const { due, fresh } = srsCounts(state, now);
  return Math.min(SESSION_SIZE, due + fresh);
}

/**
 * Build a Smart Review session: most-overdue cards first, then fill with new
 * cards up to SESSION_SIZE. Order is randomized by the caller.
 */
export function buildSrsDeck(state: ProgressState, now: number = Date.now()): Question[] {
  const due = QUESTIONS.filter((q) => {
    const s = state.questions[q.id];
    return attempts(state, q.id) > 0 && s?.due != null && s.due <= now;
  }).sort((a, b) => (state.questions[a.id]!.due! - state.questions[b.id]!.due!));

  const fresh = QUESTIONS.filter((q) => attempts(state, q.id) === 0);

  return [...due, ...fresh].slice(0, SESSION_SIZE);
}
