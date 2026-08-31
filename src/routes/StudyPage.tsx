import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudyDeck from "../components/StudyDeck";
import ProgressBar from "../components/ProgressBar";
import { QUESTIONS, SYLLABUS, questionsForGroup, questionsForSubelement } from "../lib/data";
import { shuffle } from "../lib/random";
import { useProgress } from "../lib/useProgress";
import { pct } from "../lib/stats";
import type { Question } from "../lib/types";

function coverage(questions: Question[], state: ReturnType<typeof useProgress>): number {
  if (!questions.length) return 0;
  const seen = questions.filter((q) => (state.questions[q.id]?.seen ?? 0) > 0).length;
  return seen / questions.length;
}

export default function StudyPage() {
  const { group } = useParams();
  const navigate = useNavigate();
  const state = useProgress();

  // shuffle the selected deck; reshuffles whenever the selection changes
  const deck = useMemo<Question[]>(() => {
    if (!group) return [];
    const base =
      group === "all"
        ? QUESTIONS
        : group.length === 2
          ? questionsForSubelement(group)
          : questionsForGroup(group);
    return shuffle(base);
  }, [group]);

  if (group && deck.length) {
    const title = group === "all" ? "🔀 All questions" : group;
    return <StudyDeck questions={deck} title={title} onExit={() => navigate("/study")} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Study</h1>
        <p className="text-sm text-slate-400">
          Shuffle the whole pool, or drill a specific subelement or group. Every deck is
          randomized.
        </p>
      </header>

      <button
        onClick={() => navigate("/study/all")}
        className="flex items-center justify-between rounded-2xl border border-sky-700 bg-sky-500/10 p-5 text-left transition-colors hover:border-sky-500 hover:bg-sky-500/20"
      >
        <div>
          <div className="text-lg font-semibold">🔀 Shuffle all questions</div>
          <div className="text-xs text-slate-400">Random cards from the entire {QUESTIONS.length}-question pool</div>
        </div>
        <span className="text-2xl text-sky-400">→</span>
      </button>

      <div className="flex flex-col gap-4">
        {SYLLABUS.map((sub) => {
          const subQ = questionsForSubelement(sub.code);
          return (
            <section key={sub.code} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
