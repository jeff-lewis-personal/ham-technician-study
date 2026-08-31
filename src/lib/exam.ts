import { SYLLABUS, questionsForGroup } from "./data";
import { randomOf, shuffle } from "./random";
import type { Question } from "./types";

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
