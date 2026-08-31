import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudyDeck from "../components/StudyDeck";
import ProgressBar from "../components/ProgressBar";
import { QUESTIONS, SYLLABUS, questionsForGroup, questionsForSubelement } from "../lib/data";
import { shuffle } from "../lib/random";
import { flaggedQuestions, missedQuestions, reviewDeck, unseenQuestions } from "../lib/review";
import { useProgress } from "../lib/useProgress";
import { pct } from "../lib/stats";
import type { ProgressState, Question } from "../lib/types";

const DECK_TITLES: Record<string, string> = {
  all: "🔀 All questions",
  missed: "❌ Missed questions",
  flagged: "★ Flagged questions",
  unseen: "🆕 Unseen questions",
};

function coverage(questions: Question[], state: ProgressState): number {
  if (!questions.length) return 0;
  const seen = questions.filter((q) => (state.questions[q.id]?.seen ?? 0) > 0).length;
  return seen / questions.length;
}

function buildDeck(group: string, state: ProgressState): Question[] {
  if (group === "all") return QUESTIONS;
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

  const reviewBuckets = [
    { key: "missed", label: "Missed", icon: "❌", count: missedQuestions(state).length },
    { key: "flagged", label: "Flagged", icon: "★", count: flaggedQuestions(state).length },
    { key: "unseen", label: "Unseen", icon: "🆕", count: unseenQuestions(state).length },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Study</h1>
        <p className="text-sm text-slate-400">
          Shuffle the whole pool, drill your weak spots, or pick a section. Every deck is
          randomized.
        </p>
      </header>

      <button
        onClick={() => navigate("/study/all")}
        className="flex items-center justify-between rounded-2xl border border-sky-700 bg-sky-500/10 p-5 text-left transition-colors hover:border-sky-500 hover:bg-sky-500/20"
      >
        <div>
          <div className="text-lg font-semibold">🔀 Shuffle all questions</div>
          <div className="text-xs text-slate-400">
            Random cards from the entire {QUESTIONS.length}-question pool
          </div>
        </div>
        <span className="text-2xl text-sky-400">→</span>
      </button>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-300">Review &amp; drill</h2>
        <div className="grid grid-cols-3 gap-2">
          {reviewBuckets.map((b) => (
            <button
              key={b.key}
              onClick={() => navigate(`/study/${b.key}`)}
              disabled={b.count === 0}
              className="flex flex-col items-center gap-0.5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-sky-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-800"
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-lg font-bold">{b.count}</span>
              <span className="text-xs text-slate-400">{b.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-300">By section</h2>
        {SYLLABUS.map((sub) => {
          const subQ = questionsForSubelement(sub.code);
          return (
            <div key={sub.code} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <button
                onClick={() => navigate(`/study/${sub.code}`)}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <div className="font-semibold">
                    <span className="font-mono text-sky-400">{sub.code}</span> {sub.name}
                  </div>
                  <div className="text-xs text-slate-400">{sub.questionCount} questions</div>
                </div>
                <span className="text-xs text-slate-400">{pct(coverage(subQ, state))}</span>
              </button>
              <div className="mt-2">
                <ProgressBar value={coverage(subQ, state)} colorClass="bg-emerald-500" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sub.groupCodes.map((g) => (
                  <button
                    key={g}
                    onClick={() => navigate(`/study/${g}`)}
                    className="rounded-lg border border-slate-700 px-2.5 py-1 font-mono text-xs text-slate-300 hover:border-sky-600 hover:text-sky-300"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
