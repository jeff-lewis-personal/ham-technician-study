import { LETTERS, letterToIndex } from "../lib/data";
import type { Question } from "../lib/types";

interface Props {
  question: Question;
  selectedIndex: number | null;
  onSelect?: (index: number) => void;
  revealed: boolean; // when true, show correct/incorrect coloring
  flagged?: boolean;
  onToggleFlag?: () => void;
}

export default function QuestionCard({
  question,
  selectedIndex,
  onSelect,
  revealed,
  flagged,
  onToggleFlag,
}: Props) {
  const correctIndex = letterToIndex(question.correct);

  function choiceClasses(i: number): string {
    const base =
      "flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors";
    if (revealed) {
      if (i === correctIndex) return `${base} border-emerald-500 bg-emerald-500/15 text-emerald-100`;
      if (i === selectedIndex) return `${base} border-rose-500 bg-rose-500/15 text-rose-100`;
      return `${base} border-slate-800 bg-slate-900 text-slate-400`;
    }
    if (i === selectedIndex) return `${base} border-sky-500 bg-sky-500/15 text-sky-100`;
    return `${base} border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600`;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono">{question.id}</span>
          {question.fccRef && <span className="text-slate-500">§{question.fccRef}</span>}
        </div>
        {onToggleFlag && (
          <button
            onClick={onToggleFlag}
            aria-pressed={flagged}
            className={`text-lg leading-none ${flagged ? "text-amber-400" : "text-slate-600 hover:text-slate-400"}`}
            title={flagged ? "Unflag" : "Flag for review"}
          >
            {flagged ? "★" : "☆"}
          </button>
        )}
      </div>

      <p className="mb-3 text-base font-medium leading-snug text-slate-50">{question.question}</p>

      {question.figure && (
        <img
          src={`/figures/${question.figure}.png`}
          alt={`Figure ${question.figure}`}
          className="mb-3 rounded-lg border border-slate-700 bg-white p-2"
        />
      )}

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            className={choiceClasses(i)}
            onClick={() => onSelect?.(i)}
            disabled={!onSelect}
          >
            <span className="mt-0.5 font-mono text-xs opacity-70">{LETTERS[i]}</span>
            <span>{choice}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
