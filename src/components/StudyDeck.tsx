import { useMemo, useState } from "react";
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

  // count seen for the whole deck for the header progress
  const seenCount = useMemo(
    () => questions.filter((q) => (state.questions[q.id]?.seen ?? 0) > 0).length,
    [questions, state],
  );

  function reveal() {
    if (revealed) return;
    if (selected === null) {
      progressStore.markSeen(question.id);
    } else {
      progressStore.recordAnswer(question.id, selected === letterToIndex(question.correct));
    }
    setRevealed(true);
  }

  function go(delta: number) {
    const next = index + delta;
    if (next < 0 || next >= questions.length) return;
    setIndex(next);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="text-sm text-slate-400 hover:text-slate-200">
          ← Sections
        </button>
        <span className="text-sm font-medium text-slate-300">{title}</span>
        <span className="text-xs text-slate-500">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Seen in this set</span>
          <span>
            {seenCount}/{questions.length}
          </span>
        </div>
        <ProgressBar value={seenCount / questions.length} colorClass="bg-emerald-500" />
      </div>

      <QuestionCard
        question={question}
        selectedIndex={selected}
        onSelect={revealed ? undefined : setSelected}
        revealed={revealed}
        flagged={stat?.flagged ?? false}
        onToggleFlag={() => progressStore.toggleFlag(question.id)}
      />

      {!revealed ? (
        <button
          onClick={reveal}
          className="rounded-xl bg-sky-600 py-3 font-semibold text-white transition-colors hover:bg-sky-500"
        >
          {selected === null ? "Show answer" : "Check answer"}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="rounded-xl border border-slate-700 py-3 font-semibold text-slate-200 disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => go(1)}
            disabled={index === questions.length - 1}
            className="rounded-xl bg-sky-600 py-3 font-semibold text-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
