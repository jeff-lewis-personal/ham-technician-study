export type ChoiceIndex = 0 | 1 | 2 | 3;
export type CorrectLetter = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  subelement: string; // e.g. "T1"
  group: string; // e.g. "T1A"
  correct: CorrectLetter;
  fccRef: string | null;
  figure: string | null; // e.g. "T-1"
  question: string;
  choices: [string, string, string, string];
}

export interface Subelement {
  code: string; // "T1"
  name: string; // "Commission's Rules"
  examQuestions: number; // weight on a 35-Q exam
  groups: number;
  questionCount: number;
  groupCodes: string[];
}

export interface QuestionStat {
  seen: number;
  correct: number;
  incorrect: number;
  flagged: boolean;
  lastAnswered: number | null;
}

export interface ExamResult {
  date: number;
  score: number;
  total: number;
  passed: boolean;
}

export interface ProgressState {
  questions: Record<string, QuestionStat>;
  exams: ExamResult[];
}
