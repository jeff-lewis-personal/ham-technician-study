import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudyDeck from "../components/StudyDeck";
import ProgressBar from "../components/ProgressBar";
import { QUESTIONS, SYLLABUS, questionsForGroup, questionsForSubelement } from "../lib/data";
import { shuffle } from "../lib/random";
import {
  flaggedQuestions,
  missedQuestions,
  reviewDeck,
  unseenQuestions,
  weakQuestions,
} from "../lib/review";
import { buildSrsDeck, srsAvailable } from "../lib/srs";
import { useProgress } from "../lib/useProgress";
import { pct } from "../lib/stats";
import type { ProgressState, Question } from "../lib/types";

const DECK_TITLES: Record<string, string> = {
  srs: "🧠 Smart Review",
  all: "🔀 All questions",
  missed: "❌ Missed questions",
  flagged: "★ Flagged questions",
  unseen: "🆕 Unseen questions",
  weak: "🎯 Weak areas",
};

function coverage(questions: Question[], state: ProgressState): number {
  if (!questions.length) return 0;
  const seen = questions.filter((q) => (state.questions[q.id]?.seen ?? 0) > 0).length;
  return seen / questions.length;
}

function buildDeck(group: string, state: ProgressState): Question[] {
  if (group === "srs") return buildSrsDeck(state);
  if (group === "all") return QUESTIONS;
  if (group === "weak") return weakQuestions(state);
  if (group === "missed" || group === "flagged" || group === "unseen")
    return reviewDeck(group, state);
  if (group.length === 2) return questionsForSubelement(group);
  return questionsForGroup(group);
}

export default function StudyPage() {
  const { group } = useParams();
  const navigate = useNavigate();
  const state = useProgress();

  // shuffle the selected deck; reshuffles/rebuilds whenever the selection changes
  const deck = useMemo<Question[]>(
    () => (group ? shuffle(buildDeck(group, state)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild only on entry, not on every answer
    [group],
  );

  if (group && deck.length) {
    const title = DECK_TITLES[group] ?? group;
    return <StudyDeck questions={deck} title={title} onExit={() => navigate("/study")} />;
  }

  const srsCount = srsAvailable(state);
  const reviewBuckets = [
    { key: "missed", label: "Missed", icon: "❌", count: missedQuestions(state).length },
    { key: "flagged", label: "Flagged", icon: "★", count: flaggedQuestions(state).length },
    { key: "unseen", label: "Unseen", icon: "🆕", count: unseenQuestions(state).length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-medium leading-[1.05] text-ink md:text-[34px] md:leading-[1.1]">
          Study
        </h1>
        <p className="text-[15px] leading-[1.45] text-body [text-wrap:pretty] md:text-[17px]">
          Shuffle the whole pool, drill your weak spots, or pick a section. Every deck is
          randomized.
        </p>
      </header>

      <button
        onClick={() => navigate("/study/srs")}
        disabled={srsCount === 0}
        className="flex items-center justify-between border border-brick bg-brick-tint px-[18px] py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="flex flex-col gap-0.5">
          <div className="text-[19px] font-medium text-ink">🧠 Smart Review</div>
          <div className="font-mono text-[10px] text-muted">
            {srsCount > 0
              ? `${srsCount} card${srsCount === 1 ? "" : "s"} due — spaced repetition`
              : "All caught up — check back later"}
          </div>
        </div>
        <span className="text-[20px] text-brick">→</span>
      </button>

      <button
        onClick={() => navigate("/study/all")}
        className="flex items-center justify-between border border-rule bg-card px-[18px] py-4 text-left transition-colors hover:border-brick"
      >
        <div className="flex flex-col gap-0.5">
          <div className="text-[19px] font-medium text-ink">🔀 Shuffle all questions</div>
          <div className="font-mono text-[10px] text-muted">
            Random cards from all {QUESTIONS.length}
          </div>
        </div>
        <span className="text-[20px] text-brick">→</span>
      </button>

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
          Review &amp; drill
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {reviewBuckets.map((b) => (
            <button
              key={b.key}
              onClick={() => navigate(`/study/${b.key}`)}
              disabled={b.count === 0}
              className="flex flex-col items-center gap-1 border border-rule bg-card p-4 transition-colors hover:border-brick disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-rule"
            >
              <span className="text-lg leading-none">{b.icon}</span>
              <span className="text-[22px] font-medium leading-none text-ink">{b.count}</span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                {b.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
          By section
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-[14px]">
          {SYLLABUS.map((sub) => {
            const subQ = questionsForSubelement(sub.code);
            const cov = coverage(subQ, state);
            return (
              <div
                key={sub.code}
                className="flex flex-col gap-2.5 border border-rule bg-card p-[14px] transition-colors hover:border-brick md:p-[18px]"
              >
                <button
                  onClick={() => navigate(`/study/${sub.code}`)}
                  className="flex w-full items-baseline justify-between gap-2 text-left"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[12px] text-brick">{sub.code}</span>
                    <span className="text-[17px] text-ink md:text-[19px]">{sub.name}</span>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[10.5px] text-muted">
                    <span className="hidden md:inline">{sub.questionCount} Q · </span>
                    {pct(cov)}
                  </span>
                </button>
                <ProgressBar value={cov} colorClass="bg-moss" />
                <div className="flex flex-wrap gap-1.5">
                  {sub.groupCodes.map((g) => (
                    <button
                      key={g}
                      onClick={() => navigate(`/study/${g}`)}
                      className="border border-rule px-[7px] py-[3px] font-mono text-[10.5px] text-body transition-colors hover:border-brick hover:text-brick"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
