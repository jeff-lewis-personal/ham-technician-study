import { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { progressStore } from "../lib/progress";
import { useProgress } from "../lib/useProgress";
import { nextAdaptiveQuestion } from "../lib/adaptive";
import { letterToIndex } from "../lib/data";
import { overallStats, pct } from "../lib/stats";
import type { Question } from "../lib/types";

interface Props {
  onExit: () => void;
}

export default function AdaptiveDeck({ onExit }: Props) {
  const state = useProgress();
  const [current, setCurrent] = useState<Question>(() =>
    nextAdaptiveQuestion(progressStore.getState(), null),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ answered: 0, correct: 0 });

  const stat = state.questions[current.id];
  const overall = overallStats(state);

  // mark each question seen as it comes into view
  useEffect(() => {
    progressStore.markSeen(current.id);
  }, [current.id]);

  function handleSelect(i: number) {
    if (revealed) return;
    const ok = i === letterToIndex(current.correct);
    setSelected(i);
    setRevealed(true);
    progressStore.recordAnswer(current.id, ok);
    setSession((s) => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0) }));
  }

  function nextQuestion() {
    setCurrent(nextAdaptiveQuestion(progressStore.getState(), current.id));
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between font-mono text-[11px]">
        <button onClick={onExit} className="text-brick transition-colors hover:text-[#66280f]">
          ← Sections
        </button>
        <span className="font-semibold tracking-[0.08em] text-ink">🔁 Adaptive</span>
        <span className="text-muted">
          {session.answered > 0
            ? `${pct(session.correct / session.answered)} · ${session.answered}q`
            : "0 answered"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          <span>Pool seen</span>
          <span>{pct(overall.coverage)}</span>
        </div>
        <ProgressBar value={overall.coverage} colorClass="bg-brick" />
      </div>

      <QuestionCard
        question={current}
        selectedIndex={selected}
        onSelect={revealed ? undefined : handleSelect}
        revealed={revealed}
        flagged={stat?.flagged ?? false}
        onToggleFlag={() => progressStore.toggleFlag(current.id)}
      />

      {revealed && (
        <button
          onClick={nextQuestion}
          className="border border-brick bg-brick py-3.5 text-center font-mono text-[12px] font-semibold tracking-[0.08em] text-paper transition-colors"
        >
          NEXT QUESTION →
        </button>
      )}
    </div>
  );
}
