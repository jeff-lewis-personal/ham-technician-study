import { QUESTIONS, questionsForSubelement } from "./data";
import { subelementStats, type SubelementStats } from "./stats";
import type { ProgressState, Question } from "./types";

const PASS_LINE = 0.74;

/** Subelements the user has attempted but scores below the 74% pass line. */
export function weakSubelements(state: ProgressState): SubelementStats[] {
  return subelementStats(state).filter((s) => s.attempts > 0 && s.accuracy < PASS_LINE);
}

/** All questions from the user's weak (sub-74%) subelements. */
export function weakQuestions(state: ProgressState): Question[] {
  return weakSubelements(state).flatMap((s) => questionsForSubelement(s.code));
}

/** Questions answered incorrectly at least once. */
export function missedQuestions(state: ProgressState): Question[] {
  return QUESTIONS.filter((q) => (state.questions[q.id]?.incorrect ?? 0) > 0);
}

/** Questions the user flagged for review. */
export function flaggedQuestions(state: ProgressState): Question[] {
  return QUESTIONS.filter((q) => state.questions[q.id]?.flagged);
}

/** Questions never seen yet (coverage gaps). */
export function unseenQuestions(state: ProgressState): Question[] {
  return QUESTIONS.filter((q) => (state.questions[q.id]?.seen ?? 0) === 0);
}

export type ReviewKey = "missed" | "flagged" | "unseen";

export function reviewDeck(key: ReviewKey, state: ProgressState): Question[] {
  switch (key) {
    case "missed":
      return missedQuestions(state);
    case "flagged":
      return flaggedQuestions(state);
    case "unseen":
      return unseenQuestions(state);
  }
}
