import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { progressStore } from "../lib/progress";
import { useProgress } from "../lib/useProgress";
import { overallStats, subelementStats, pct } from "../lib/stats";

function accuracyColor(accuracy: number, attempts: number): string {
  if (attempts === 0) return "bg-slate-600";
  if (accuracy >= 0.85) return "bg-emerald-500";
  if (accuracy >= 0.7) return "bg-amber-500";
  return "bg-rose-500";
}

export default function ProgressPage() {
  const state = useProgress();
  const navigate = useNavigate();
  const overall = overallStats(state);
  const subs = subelementStats(state);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-sm text-slate-400">
          {overall.seen}/{overall.total} seen · {overall.flagged} flagged
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-300">By subelement</h2>
        {subs.map((s) => (
          <button
            key={s.code}
            onClick={() => navigate(`/study/${s.code}`)}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-colors hover:border-sky-700"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                <span className="font-mono text-sky-400">{s.code}</span> {s.name}
              </span>
              <span className="text-xs text-slate-400">
                {s.attempts > 0 ? `${pct(s.accuracy)} acc` : "untested"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-slate-500">seen</span>
                <ProgressBar value={s.coverage} colorClass="bg-sky-500" />
                <span className="w-10 text-right text-xs text-slate-400">{pct(s.coverage)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-xs text-slate-500">accuracy</span>
                <ProgressBar value={s.accuracy} colorClass={accuracyColor(s.accuracy, s.attempts)} />
                <span className="w-10 text-right text-xs text-slate-400">
                  {s.attempts > 0 ? pct(s.accuracy) : "—"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </section>

      {state.exams.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-300">Exam history</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
            {state.exams.slice(0, 10).map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 last:border-0"
              >
                <span className="text-xs text-slate-400">
                  {new Date(e.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">
                    {e.score}/{e.total}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                      e.passed ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {e.passed ? "PASS" : "FAIL"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={() => {
          if (confirm("Reset all study progress? This can't be undone.")) progressStore.reset();
        }}
        className="mt-2 self-start text-xs text-slate-500 hover:text-rose-400"
      >
        Reset all progress
      </button>
    </div>
  );
}
