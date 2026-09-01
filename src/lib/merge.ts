import type { ExamResult, ProgressState, QuestionStat } from "./types";

function mergeStat(a: QuestionStat | undefined, b: QuestionStat | undefined): QuestionStat {
  if (!a) return b!;
  if (!b) return a;
  const aLast = a.lastAnswered ?? 0;
  const bLast = b.lastAnswered ?? 0;
  const recent = bLast > aLast ? b : a; // box/due follow the more recent answer
  return {
    seen: Math.max(a.seen, b.seen),
    correct: Math.max(a.correct, b.correct),
    incorrect: Math.max(a.incorrect, b.incorrect),
    flagged: Boolean(a.flagged || b.flagged),
    lastAnswered: Math.max(aLast, bLast) || null,
    box: recent.box ?? 0,
    due: recent.due ?? null,
  };
}

/** Union two progress states so nothing is lost across devices. */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const questions: Record<string, QuestionStat> = {};
  const ids = new Set([...Object.keys(a.questions ?? {}), ...Object.keys(b.questions ?? {})]);
  for (const id of ids) questions[id] = mergeStat(a.questions?.[id], b.questions?.[id]);

  const seen = new Set<string>();
  const exams: ExamResult[] = [...(a.exams ?? []), ...(b.exams ?? [])]
    .filter((e) => {
      const key = `${e.date}|${e.score}|${e.total}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((x, y) => y.date - x.date);

  return { questions, exams };
}
