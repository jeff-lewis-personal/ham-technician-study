import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { useProgress } from "../lib/useProgress";
import { overallStats, pct } from "../lib/stats";

export default function HomePage() {
  const state = useProgress();
  const overall = overallStats(state);
  const lastExam = state.exams[0];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Technician Study</h1>
        <p className="text-sm text-slate-400">
          FCC Amateur Radio Technician exam · pool valid 2026–2030
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-sm text-slate-400">Pool seen</span>
          <span className="text-sm font-semibold text-slate-200">
            {overall.seen}/{overall.total}
          </span>
        </div>
        <ProgressBar value={overall.coverage} />
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-2xl font-bold text-sky-400">{pct(overall.coverage)}</div>
            <div className="text-xs text-slate-400">covered</div>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3">
            <div className="text-2xl font-bold text-emerald-400">
              {overall.seen ? pct(overall.accuracy) : "—"}
            </div>
            <div className="text-xs text-slate-400">accuracy</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/study"
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-sky-600"
        >
          <div className="mb-1 text-2xl">📖</div>
          <div className="font-semibold">Study</div>
          <div className="text-xs text-slate-400">Flashcards by section</div>
        </Link>
        <Link
          to="/practice"
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-sky-600"
        >
          <div className="mb-1 text-2xl">📝</div>
          <div className="font-semibold">Practice exam</div>
          <div className="text-xs text-slate-400">35 questions · 26 to pass</div>
        </Link>
      </div>

      {lastExam && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-1 text-sm text-slate-400">Last practice exam</div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${lastExam.passed ? "text-emerald-400" : "text-rose-400"}`}
            >
              {lastExam.score}/{lastExam.total}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                lastExam.passed
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {lastExam.passed ? "PASS" : "FAIL"}
            </span>
          </div>
          <Link to="/progress" className="mt-2 inline-block text-xs text-sky-400">
            View all progress →
          </Link>
        </section>
      )}
    </div>
  );
}
