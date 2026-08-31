import type { ExamResult, ProgressState, QuestionStat } from "./types";

const STORAGE_KEY = "ham-technician-progress-v1";

export const EMPTY_STAT: QuestionStat = {
  seen: 0,
  correct: 0,
  incorrect: 0,
  flagged: false,
  lastAnswered: null,
};

/**
 * Progress persistence contract. v1 uses localStorage; a future backend or
 * offline layer can implement the same interface without touching the UI.
 */
export interface ProgressStore {
  getState(): ProgressState;
  getStat(questionId: string): QuestionStat;
  markSeen(questionId: string): void;
  recordAnswer(questionId: string, wasCorrect: boolean): void;
  toggleFlag(questionId: string): void;
  recordExam(result: ExamResult): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

function emptyState(): ProgressState {
  return { questions: {}, exams: [] };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { questions: parsed.questions ?? {}, exams: parsed.exams ?? [] };
  } catch {
    return emptyState();
  }
}

export class LocalProgressStore implements ProgressStore {
  private state: ProgressState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = load();
  }

  getState(): ProgressState {
    return this.state;
  }

  getStat(questionId: string): QuestionStat {
    return this.state.questions[questionId] ?? EMPTY_STAT;
  }

  private mutateStat(questionId: string, fn: (s: QuestionStat) => QuestionStat) {
    const current = this.state.questions[questionId] ?? { ...EMPTY_STAT };
    this.state = {
      ...this.state,
      questions: { ...this.state.questions, [questionId]: fn({ ...current }) },
    };
    this.persist();
  }

  markSeen(questionId: string): void {
    this.mutateStat(questionId, (s) => ({ ...s, seen: s.seen + 1 }));
  }

  recordAnswer(questionId: string, wasCorrect: boolean): void {
    this.mutateStat(questionId, (s) => ({
      ...s,
      seen: s.seen + 1,
      correct: s.correct + (wasCorrect ? 1 : 0),
      incorrect: s.incorrect + (wasCorrect ? 0 : 1),
      lastAnswered: Date.now(),
    }));
  }

  toggleFlag(questionId: string): void {
    this.mutateStat(questionId, (s) => ({ ...s, flagged: !s.flagged }));
  }

  recordExam(result: ExamResult): void {
    this.state = { ...this.state, exams: [result, ...this.state.exams] };
    this.persist();
  }

  reset(): void {
    this.state = emptyState();
    this.persist();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // storage unavailable (private mode / quota) — keep in-memory state
    }
    this.listeners.forEach((l) => l());
  }
}

export const progressStore: ProgressStore = new LocalProgressStore();
