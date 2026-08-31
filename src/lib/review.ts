import { QUESTIONS } from "./data";
import type { ProgressState, Question } from "./types";

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
