import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import { generateExam, isPassing, PASS_FRACTION } from "../lib/exam";
import { letterToIndex, subelementByCode } from "../lib/data";
import { progressStore } from "../lib/progress";
import type { Question } from "../lib/types";

type Phase = "start" | "active" | "results";

const PREV_BTN =
  "border border-rule py-3.5 text-center font-mono text-[12px] tracking-[0.08em] text-muted transition-colors disabled:opacity-40";
const PRIMARY_BTN =
  "border border-brick bg-brick py-3.5 text-center font-mono text-[12px] font-semibold tracking-[0.08em] text-paper transition-colors disabled:opacity-40";

export default function PracticePage() {
  const navigate = useNavigate();
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
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h1 className="text-[28px] font-medium leading-[1.05] text-ink md:text-[34px] md:leading-[1.1]">
            Practice exam
          </h1>
          <p className="text-[15px] leading-[1.45] text-body [text-wrap:pretty] md:text-[17px]">
            35 questions — one from each group, just like the real VE session. You need{" "}
            <span className="font-medium text-ink">26 correct (74%)</span> to pass.
          </p>
        </header>
        <button onClick={start} className={PRIMARY_BTN + " py-4 text-[13px]"}>
          START EXAM
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
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div
          className={`flex flex-col items-center gap-1.5 border p-[26px] ${
            passed ? "border-moss bg-moss-tint" : "border-wrong bg-wrong-tint"
          }`}
        >
          <div
            className={`text-[56px] font-medium leading-none ${passed ? "text-moss" : "text-wrong"}`}
          >
            {score}/{exam.length}
          </div>
          <div
            className={`font-mono text-[11px] font-semibold tracking-[0.18em] ${
              passed ? "text-moss" : "text-wrong"
            }`}
          >
            {passed ? "PASS" : "FAIL"}
          </div>
          <div className="font-mono text-[10.5px] text-body">
            {Math.round((score / exam.length) * 100)}% · need {Math.round(PASS_FRACTION * 100)}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/study/missed")}
            disabled={missed.length === 0}
            className={PREV_BTN}
          >
            DRILL MISSED
          </button>
          <button onClick={start} className={PRIMARY_BTN}>
            NEW EXAM
          </button>
        </div>

        {missed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="border-b border-rule pb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
              Review — {missed.length} missed
            </h2>
            {missed.map(({ q, i }) => (
              <QuestionCard key={q.id} question={q} selectedIndex={answers[i]} revealed wrongAnswerNote />
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
  const sub = subelementByCode(question.subelement);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-baseline justify-between font-mono text-[10.5px] uppercase tracking-[0.1em]">
        <span className="font-semibold text-ink">
          Question {index + 1} / {exam.length}
        </span>
        <span className="text-muted">{answered} answered</span>
      </div>

      <div className="flex gap-0.5">
        {exam.map((_, i) => (
          <div
            key={i}
            className={`h-[6px] flex-1 ${answers[i] !== null || i === index ? "bg-brick" : "bg-rule-soft"}`}
          />
        ))}
      </div>

      <QuestionCard
        question={question}
        selectedIndex={answers[index]}
        onSelect={select}
        revealed={false}
        metaRight={<span>{sub ? `${question.subelement} · ${sub.name}` : question.subelement}</span>}
        footer={
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            Answers are graded at the end
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className={PREV_BTN}>
          ← PREV
        </button>
        {isLast ? (
          <button onClick={finish} className={PRIMARY_BTN}>
            FINISH
          </button>
        ) : (
          <button onClick={() => setIndex((i) => Math.min(exam.length - 1, i + 1))} className={PRIMARY_BTN}>
            NEXT →
          </button>
        )}
      </div>
    </div>
  );
}
