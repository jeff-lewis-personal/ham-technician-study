import { QUESTIONS, SYLLABUS, questionsForSubelement } from "./data";
import type { ProgressState } from "./types";

export interface SubelementStats {
  code: string;
  name: string;
  total: number; // pool questions in subelement
  seen: number; // distinct questions answered at least once
  attempts: number; // total answers
  correct: number; // total correct answers
  coverage: number; // seen / total (0..1)
  accuracy: number; // correct / attempts (0..1); 0 if no attempts
}

function statsForQuestionSet(
  ids: string[],
  state: ProgressState,
): { seen: number; attempts: number; correct: number } {
  let seen = 0;
  let attempts = 0;
  let correct = 0;
  for (const id of ids) {
    const s = state.questions[id];
    if (!s) continue;
    if (s.seen > 0) seen += 1;
    attempts += s.correct + s.incorrect;
    correct += s.correct;
  }
  return { seen, attempts, correct };
}

export function subelementStats(state: ProgressState): SubelementStats[] {
  return SYLLABUS.map((s) => {
    const ids = questionsForSubelement(s.code).map((q) => q.id);
    const { seen, attempts, correct } = statsForQuestionSet(ids, state);
    return {
      code: s.code,
      name: s.name,
      total: ids.length,
      seen,
      attempts,
      correct,
      coverage: ids.length ? seen / ids.length : 0,
      accuracy: attempts ? correct / attempts : 0,
    };
  });
}

export interface OverallStats {
  total: number;
  seen: number;
  coverage: number;
  accuracy: number;
  flagged: number;
}

export function overallStats(state: ProgressState): OverallStats {
  const ids = QUESTIONS.map((q) => q.id);
  const { seen, attempts, correct } = statsForQuestionSet(ids, state);
  const flagged = Object.values(state.questions).filter((s) => s.flagged).length;
  return {
    total: ids.length,
    seen,
    coverage: ids.length ? seen / ids.length : 0,
    accuracy: attempts ? correct / attempts : 0,
    flagged,
  };
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
