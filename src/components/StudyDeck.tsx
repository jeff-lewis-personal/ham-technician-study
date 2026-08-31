import { useEffect, useMemo, useState } from "react";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { progressStore } from "../lib/progress";
import { useProgress } from "../lib/useProgress";
import type { Question } from "../lib/types";
import { letterToIndex } from "../lib/data";

interface Props {
  questions: Question[];
  title: string;
  onExit: () => void;
}

export default function StudyDeck({ questions, title, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const state = useProgress();

  const question = questions[index];
  const stat = state.questions[question.id];

  // mark each card seen as it comes into view
  useEffect(() => {
    progressStore.markSeen(question.id);
  }, [question.id]);

  const seenCount = useMemo(
    () => questions.filter((q) => (state.questions[q.id]?.seen ?? 0) > 0).length,
    [questions, state],
  );

  function handleSelect(i: number) {
    if (revealed) return; // lock after first answer
    setSelected(i);
    setRevealed(true);
    progressStore.recordAnswer(question.id, i === letterToIndex(question.correct));
  }

  function go(delta: number) {
    const next = index + delta;
    if (next < 0 || next >= questions.length) return;
    setIndex(next);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between font-mono text-[11px]">
        <button onClick={onExit} className="text-brick transition-colors hover:text-[#66280f]">
          ← Sections
        </button>
        <span className="font-semibold tracking-[0.08em] text-ink">{title}</span>
        <span className="text-muted">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          <span>Seen in this set</span>
          <span>
            {seenCount}/{questions.length}
          </span>
        </div>
        <ProgressBar value={seenCount / questions.length} colorClass="bg-moss" />
      </div>

      <QuestionCard
        question={question}
        selectedIndex={selected}
        onSelect={revealed ? undefined : handleSelect}
        revealed={revealed}
        flagged={stat?.flagged ?? false}
        onToggleFlag={() => progressStore.toggleFlag(question.id)}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="border border-rule py-3.5 text-center font-mono text-[12px] tracking-[0.08em] text-muted transition-colors disabled:opacity-40"
        >
          ← PREV
        </button>
        <button
          onClick={() => go(1)}
          disabled={index === questions.length - 1}
          className="border border-brick bg-brick py-3.5 text-center font-mono text-[12px] font-semibold tracking-[0.08em] text-paper transition-colors disabled:opacity-40"
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}
