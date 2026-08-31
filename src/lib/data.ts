import questionsJson from "../data/questions.json";
import syllabusJson from "../data/syllabus.json";
import explanationsJson from "../data/explanations.json";
import type { CorrectLetter, Question, Subelement } from "./types";

const EXPLANATIONS = explanationsJson as Record<string, string>;

export const QUESTIONS = (questionsJson as Question[]).map((q) => ({
  ...q,
  explanation: EXPLANATIONS[q.id],
}));
export const SYLLABUS = syllabusJson as Subelement[];

export const LETTERS: CorrectLetter[] = ["A", "B", "C", "D"];

export function letterToIndex(letter: CorrectLetter): number {
  return LETTERS.indexOf(letter);
}

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
export function questionById(id: string): Question | undefined {
  return BY_ID.get(id);
}

const BY_SUBELEMENT = new Map<string, Question[]>();
for (const q of QUESTIONS) {
  const list = BY_SUBELEMENT.get(q.subelement) ?? [];
  list.push(q);
  BY_SUBELEMENT.set(q.subelement, list);
}
export function questionsForSubelement(code: string): Question[] {
  return BY_SUBELEMENT.get(code) ?? [];
}

const BY_GROUP = new Map<string, Question[]>();
for (const q of QUESTIONS) {
  const list = BY_GROUP.get(q.group) ?? [];
  list.push(q);
  BY_GROUP.set(q.group, list);
}
export function questionsForGroup(group: string): Question[] {
  return BY_GROUP.get(group) ?? [];
}

export function subelementByCode(code: string): Subelement | undefined {
  return SYLLABUS.find((s) => s.code === code);
}
