// Unit test for cross-device progress merge. Run with:
//   npm test   (node --experimental-strip-types, no test runner needed)
import { mergeProgress } from "../src/lib/merge.ts";
import type { ProgressState, QuestionStat } from "../src/lib/types.ts";

const stat = (o: Partial<QuestionStat> = {}): QuestionStat => ({
  seen: 0,
  correct: 0,
  incorrect: 0,
  flagged: false,
  lastAnswered: null,
  box: 0,
  due: null,
  ...o,
});

// laptop (local): T1A01 answered correctly, T1A02 flagged; one exam
const local: ProgressState = {
  questions: {
    T1A01: stat({ seen: 3, correct: 2, incorrect: 1, box: 2, due: 300, lastAnswered: 100 }),
    T1A02: stat({ seen: 1, flagged: true }),
  },
  exams: [{ date: 1000, score: 30, total: 35, passed: true }],
};

// phone (server): T1A01 answered more recently & wrong (box reset); new T5A01; dup + newer exam
const server: ProgressState = {
  questions: {
    T1A01: stat({ seen: 5, correct: 2, incorrect: 3, box: 0, due: 900, lastAnswered: 500 }),
    T5A01: stat({ seen: 2, correct: 2, box: 3, due: 700, lastAnswered: 600 }),
  },
  exams: [
    { date: 1000, score: 30, total: 35, passed: true },
    { date: 2000, score: 26, total: 35, passed: true },
  ],
};

const m = mergeProgress(local, server);
const a = m.questions.T1A01;
let failures = 0;
function assert(name: string, cond: boolean) {
  if (!cond) failures++;
  console.log(`${cond ? "PASS" : "FAIL"} — ${name}`);
}

assert("T1A01 seen = max(3,5) = 5", a.seen === 5);
assert("T1A01 correct = max(2,2) = 2", a.correct === 2);
assert("T1A01 incorrect = max(1,3) = 3", a.incorrect === 3);
assert("T1A01 box follows more-recent answer (server, box 0)", a.box === 0);
assert("T1A01 due follows more-recent answer (server, 900)", a.due === 900);
assert("T1A01 lastAnswered = max(100,500) = 500", a.lastAnswered === 500);
assert("T1A02 flag preserved (local-only question)", m.questions.T1A02.flagged === true);
assert("T5A01 preserved (server-only question)", m.questions.T5A01?.box === 3);
assert("exams deduped to 2", m.exams.length === 2);
assert("exams sorted newest-first", m.exams[0].date === 2000 && m.exams[1].date === 1000);

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll merge assertions passed.");
