import { QUESTIONS } from "./data";
import type { ProgressState, Question } from "./types";

// Selection weight by Leitner box (0 = missed/lapsed … 5 = mastered). Higher =
// asked more often. Mastered questions keep a small nonzero weight so they still
// resurface occasionally. Unseen questions sit between box 0 and box 1 so new
// material gets introduced while weak spots stay the priority.
const BOX_WEIGHT = [8, 4, 2, 1, 0.6, 0.3];
const UNSEEN_WEIGHT = 6;

function weightFor(state: ProgressState, q: Question): number {
  const s = state.questions[q.id];
  if (!s || s.correct + s.incorrect === 0) return UNSEEN_WEIGHT;
  const box = Math.min(Math.max(s.box ?? 0, 0), BOX_WEIGHT.length - 1);
  return BOX_WEIGHT[box];
}

/**
 * Draw the next adaptive question by weighted random, biased toward weak/unseen
 * questions. `excludeId` avoids immediately repeating the current question.
 */
export function nextAdaptiveQuestion(
  state: ProgressState,
  excludeId?: string | null,
): Question {
  const pool = excludeId ? QUESTIONS.filter((q) => q.id !== excludeId) : QUESTIONS;
  const weights = pool.map((q) => weightFor(state, q));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
