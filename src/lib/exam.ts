import { SYLLABUS, questionsForGroup } from "./data";
import type { Question } from "./types";

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a practice exam the way a VE session does: exactly one question drawn
 * from each of the 35 groups, then shuffled. Yields correct FCC weighting.
 */
export function generateExam(): Question[] {
  const picks: Question[] = [];
  for (const sub of SYLLABUS) {
    for (const group of sub.groupCodes) {
      const pool = questionsForGroup(group);
      if (pool.length) picks.push(randomOf(pool));
    }
  }
  return shuffle(picks);
}

export const PASS_FRACTION = 26 / 35;

export function isPassing(score: number, total: number): boolean {
  return total > 0 && score / total >= PASS_FRACTION;
}
