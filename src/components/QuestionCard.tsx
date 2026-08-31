import { LETTERS, letterToIndex, ecfrLink, hambookLink } from "../lib/data";
import type { Question } from "../lib/types";

const LINK_CLASS = "self-start border-b border-[#d9bfb5] font-mono text-[11px] text-brick";

interface Props {
  question: Question;
  selectedIndex: number | null;
  onSelect?: (index: number) => void;
  revealed: boolean; // when true, show correct/incorrect coloring
  flagged?: boolean;
  onToggleFlag?: () => void;
  metaRight?: React.ReactNode; // e.g. "T5 · Electrical Principles" in exam mode
  wrongAnswerNote?: boolean; // tag the user's wrong pick with "— YOUR ANSWER" (exam review)
  footer?: React.ReactNode; // rendered inside the card, below the choices
}

type ChoiceState = "default" | "selected" | "correct" | "wrong";

const CHOICE_STYLES: Record<ChoiceState, { row: string; letter: string; text: string }> = {
  default: { row: "border-rule bg-paper", letter: "text-muted", text: "text-body" },
  selected: {
    row: "border-brick bg-brick-tint",
    letter: "text-brick font-semibold",
    text: "text-ink font-medium",
  },
  correct: {
    row: "border-moss bg-moss-tint",
    letter: "text-moss font-semibold",
    text: "text-[#243A22] font-medium",
  },
  wrong: {
    row: "border-wrong bg-wrong-tint",
    letter: "text-wrong font-semibold",
    text: "text-[#5C231A] font-medium",
  },
};

export default function QuestionCard({
  question,
  selectedIndex,
  onSelect,
  revealed,
  flagged,
  onToggleFlag,
  metaRight,
  wrongAnswerNote,
  footer,
}: Props) {
  const correctIndex = letterToIndex(question.correct);

  function stateFor(i: number): ChoiceState {
    if (revealed) {
      if (i === correctIndex) return "correct";
      if (i === selectedIndex) return "wrong";
      return "default";
    }
    return i === selectedIndex ? "selected" : "default";
  }

  return (
    <div className="flex flex-col gap-4 border border-rule bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-muted">
          <span className="border border-rule bg-well px-1.5 py-[3px] text-ink">{question.id}</span>
          {metaRight ?? (question.fccRef && <span>§{question.fccRef}</span>)}
        </div>
        {onToggleFlag && (
          <button
            onClick={onToggleFlag}
            aria-pressed={flagged}
            className={`text-[17px] leading-none ${flagged ? "text-amber" : "text-[#c3bbaa]"}`}
            title={flagged ? "Unflag" : "Flag for review"}
          >
            {flagged ? "★" : "☆"}
          </button>
        )}
      </div>

      <p className="text-[21px] font-normal leading-[1.35] text-ink [text-wrap:pretty] md:text-[27px] md:leading-[1.3]">
        {question.question}
      </p>

      {question.figure && (
        <img
          src={`/figures/${question.figure}.png`}
          alt={`Figure ${question.figure}`}
          className="border border-rule bg-paper p-2"
        />
      )}

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => {
          const s = stateFor(i);
          const style = CHOICE_STYLES[s];
          return (
            <button
              key={i}
              className={`flex w-full items-start gap-3 border px-3.5 py-3 text-left transition-colors ${style.row} ${onSelect ? "hover:border-brick" : ""}`}
              onClick={() => onSelect?.(i)}
              disabled={!onSelect}
            >
              <span className={`mt-0.5 font-mono text-[11px] ${style.letter}`}>{LETTERS[i]}</span>
              <span className={`text-base leading-[1.4] md:text-[17px] ${style.text}`}>
                {choice}
                {wrongAnswerNote && s === "wrong" && (
                  <span className="ml-1 font-mono text-[10px] tracking-[0.08em]">— YOUR ANSWER</span>
                )}
              </span>
              {revealed && (s === "correct" || s === "wrong") && (
                <span
                  className={`ml-auto self-center pl-2 text-[19px] font-semibold leading-none ${
                    s === "correct" ? "text-moss" : "text-wrong"
                  }`}
                  aria-label={s === "correct" ? "correct answer" : "your incorrect answer"}
                >
                  {s === "correct" ? "✓" : "✗"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="flex flex-col gap-2 border-t border-rule pt-3.5">
          {selectedIndex !== null && (
            <div
              className={`text-[16px] font-medium ${
                selectedIndex === correctIndex ? "text-moss" : "text-wrong"
              }`}
            >
              {selectedIndex === correctIndex ? "Correct." : "Incorrect."}
            </div>
          )}
          <div className="text-[14px] leading-[1.4] text-body">
            <span className="text-ink">Correct answer:</span> {LETTERS[correctIndex]}.{" "}
            {question.choices[correctIndex]}
          </div>
          {question.explanation && (
            <div className="flex gap-2.5 pt-0.5">
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Why
              </span>
              <span className="text-[15px] leading-[1.45] text-body [text-wrap:pretty]">
                {question.explanation}
              </span>
            </div>
          )}
          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
            {ecfrLink(question.fccRef) && (
              <a
                href={ecfrLink(question.fccRef)!.url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                {ecfrLink(question.fccRef)!.label} on eCFR ↗
              </a>
            )}
            {hambookLink(question.subelement) && (
              <a
                href={hambookLink(question.subelement)!.url}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                HamBook: {hambookLink(question.subelement)!.title} ↗
              </a>
            )}
          </div>
        </div>
      )}

      {footer}
    </div>
  );
}
