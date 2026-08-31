import { useState } from "react";
import QuestionCard from "../components/QuestionCard";
import ProgressBar from "../components/ProgressBar";
import { generateExam, isPassing, PASS_FRACTION } from "../lib/exam";
import { letterToIndex } from "../lib/data";
import { progressStore } from "../lib/progress";
import type { Question } from "../lib/types";

type Phase = "start" | "active" | "results";

export default function PracticePage() {
  const [phase, setPhase] = useState<Phase>("start");
  const [exam, setExam] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [index, setIndex] = useState(0);

  function start() {
    const questions = generateExam();
    setExam(questions);
    setAnswers(new Array(questions.length).fill(null));
    setIndex(0);
    setPhase("active");
  }

  function select(i: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = i;
      return next;
    });
  }

  function finish() {
    let score = 0;
    exam.forEach((q, i) => {
      const correct = answers[i] === letterToIndex(q.correct);
      if (correct) score += 1;
      if (answers[i] !== null) progressStore.recordAnswer(q.id, correct);
    });
    progressStore.recordExam({
      date: Date.now(),
      score,
      total: exam.length,
      passed: isPassing(score, exam.length),
    });
    setPhase("results");
  }

  if (phase === "start") {
    return (
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Practice exam</h1>
          <p className="text-sm text-slate-400">
            35 questions — one from each group, just like the real VE session. You need{" "}
            <span className="font-semibold text-slate-200">26 correct (74%)</span> to pass.
          </p>
        </header>
        <button
          onClick={start}
          className="rounded-xl bg-sky-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-sky-500"
        >
          Start exam
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const score = exam.filter((q, i) => answers[i] === letterToIndex(q.correct)).length;
    const passed = isPassing(score, exam.length);
    const missed = exam
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => answers[i] !== letterToIndex(q.correct));
    return (
      <div className="flex flex-col gap-5">
        <div
          className={`rounded-2xl border p-6 text-center ${
            passed ? "border-emerald-600 bg-emerald-500/10" : "border-rose-600 bg-rose-500/10"
          }`}
        >
          <div className={`text-5xl font-bold ${passed ? "text-emerald-400" : "text-rose-400"}`}>
            {score}/{exam.length}
          </div>
          <div className="mt-1 text-lg font-semibold">{passed ? "PASS 🎉" : "Not yet"}</div>
          <div className="mt-1 text-sm text-slate-400">
            {Math.round((score / exam.length) * 100)}% · need {Math.round(PASS_FRACTION * 100)}%
          </div>
        </div>

        <button
          onClick={start}
          className="rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500"
        >
          New exam
        </button>

        {missed.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-300">
              Review — {missed.length} missed
            </h2>
            {missed.map(({ q, i }) => (
              <QuestionCard key={q.id} question={q} selectedIndex={answers[i]} revealed />
            ))}
          </section>
        )}
      </div>
    );
  }

  // active
  const question = exam[index];
  const answered = answers.filter((a) => a !== null).length;
  const isLast = index === exam.length - 1;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Question {index + 1}/{exam.length}
        </span>
        <span className="text-slate-500">{answered} answered</span>
      </div>
      <ProgressBar value={(index + 1) / exam.length} />

      <QuestionCard question={question} selectedIndex={answers[index]} onSelect={select} revealed={false} />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-xl border border-slate-700 py-3 font-semibold text-slate-200 disabled:opacity-40"
        >
          ← Prev
        </button>
        {isLast ? (
          <button
            onClick={finish}
            className="rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            Finish
          </button>
        ) : (
          <button
            onClick={() => setIndex((i) => Math.min(exam.length - 1, i + 1))}
            className="rounded-xl bg-sky-600 py-3 font-semibold text-white"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
