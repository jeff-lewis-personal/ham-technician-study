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

/** Deep link to the FCC Part 97 section on eCFR (public domain), from a fccRef. */
export function ecfrLink(fccRef: string | null): { url: string; label: string } | null {
  if (!fccRef) return null;
  const m = fccRef.match(/(\d+)\.(\d+)/);
  if (!m) return null;
  const section = `${m[1]}.${m[2]}`;
  return {
    url: `https://www.ecfr.gov/current/title-47/section-${section}`,
    label: `§${section}`,
  };
}

// Subelement -> the HamBook (hambook.org) chapter that covers it. Linking only;
// HamBook is CC BY-NC-ND, so we link with attribution rather than reproduce text.
const HAMBOOK_BASE = "https://hambook.org";
const HAMBOOK_CHAPTERS: Record<string, { path: string; title: string }> = {
  T0: { path: "/tech2026/pt2/chpt5/", title: "Safety" },
  T1: { path: "/tech2026/pt2/chpt8/", title: "Rules & Regulations" },
  T2: { path: "/tech2026/pt2/chpt7/", title: "Operating Practices" },
  T3: { path: "/tech2026/pt1/chpt3/", title: "Radio Wave Principles" },
  T4: { path: "/tech2026/pt2/chpt6/", title: "Station Setup" },
  T5: { path: "/tech2026/pt1/chpt1/", title: "Electrical Principles" },
  T6: { path: "/tech2026/pt1/chpt2/", title: "Electrical Components" },
  T7: { path: "/tech2026/pt2/chpt6/", title: "Station Setup" },
  T8: { path: "/tech2026/pt1/chpt3/", title: "Radio Wave Principles" },
  T9: { path: "/tech2026/pt1/chpt4/", title: "Antennas" },
};

/** Further-reading link to the HamBook chapter covering this subelement. */
export function hambookLink(subelement: string): { url: string; title: string } | null {
  const c = HAMBOOK_CHAPTERS[subelement];
  return c ? { url: HAMBOOK_BASE + c.path, title: c.title } : null;
}
