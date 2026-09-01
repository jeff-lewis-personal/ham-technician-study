import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import AccountCard from "../components/AccountCard";
import { useProgress } from "../lib/useProgress";
import { overallStats, subelementStats, pct } from "../lib/stats";
import { srsAvailable } from "../lib/srs";

export default function HomePage() {
  const state = useProgress();
  const overall = overallStats(state);
  const lastExam = state.exams[0];
  const srsCount = srsAvailable(state);
  const attempted = subelementStats(state).filter((s) => s.attempts > 0);
  const weakest = attempted.length
    ? attempted.reduce((a, b) => (b.accuracy < a.accuracy ? b : a))
    : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <h1 className="text-[30px] font-medium leading-[1.05] tracking-[-0.01em] text-ink md:text-[42px] md:tracking-[-0.015em]">
          Technician Study
        </h1>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted">
          FCC element 2 · pool 2026–2030
        </p>
      </header>

      <AccountCard />

      <section className="flex flex-col gap-[14px] border border-rule bg-card p-[18px] md:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
            Pool seen
          </span>
          <span className="font-mono text-[13px] font-semibold text-ink">
            {overall.seen} / {overall.total}
          </span>
        </div>
        <ProgressBar value={overall.coverage} heightClass="h-[6px]" colorClass="bg-brick" />
        <div className="flex gap-px bg-rule">
          <div className="flex flex-1 flex-col items-center gap-0.5 bg-paper p-3 md:p-4">
            <div className="text-[30px] font-medium leading-none text-brick md:text-[36px]">
              {pct(overall.coverage)}
            </div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
              covered
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 bg-paper p-3 md:p-4">
            <div className="text-[30px] font-medium leading-none text-moss md:text-[36px]">
              {overall.seen ? pct(overall.accuracy) : "—"}
            </div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
              accuracy
            </div>
          </div>
          {lastExam && (
            <div className="hidden flex-1 flex-col items-center gap-0.5 bg-paper p-4 md:flex">
              <div className="text-[36px] font-medium leading-none text-ink">
                {lastExam.score}
                <span className="text-[20px] text-muted">/{lastExam.total}</span>
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                last exam
              </div>
            </div>
          )}
        </div>
      </section>

      {srsCount > 0 && (
        <Link
          to="/study/srs"
          className="flex items-center justify-between border border-brick bg-brick-tint p-4 transition-colors"
        >
          <div className="flex flex-col gap-0.5">
            <div className="text-[19px] font-medium text-ink">🧠 Smart Review</div>
            <div className="font-mono text-[10px] text-muted">
              {srsCount} card{srsCount === 1 ? "" : "s"} due for review
            </div>
          </div>
          <span className="text-[20px] text-brick">→</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Link
          to="/study"
          className="flex flex-col gap-1 border border-rule bg-card p-4 transition-colors hover:border-brick md:p-5"
        >
          <div className="text-[22px] leading-none md:text-[24px]">📖</div>
          <div className="text-[18px] font-medium text-ink md:text-[20px]">Study</div>
          <div className="font-mono text-[10px] leading-[1.4] text-muted md:text-[10.5px]">
            Flashcards by section
          </div>
        </Link>
        <Link
          to="/practice"
          className="flex flex-col gap-1 border border-rule bg-card p-4 transition-colors hover:border-brick md:p-5"
        >
          <div className="text-[22px] leading-none md:text-[24px]">📝</div>
          <div className="text-[18px] font-medium text-ink md:text-[20px]">Practice exam</div>
          <div className="font-mono text-[10px] leading-[1.4] text-muted md:text-[10.5px]">
            35 questions · 26 to pass
          </div>
        </Link>
      </div>

      {lastExam && (
        <section className="flex flex-col gap-2 border border-rule bg-card p-[18px]">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
            Last practice exam
          </div>
          <div className="flex items-baseline gap-2.5">
            <span
              className={`text-[38px] font-medium leading-none ${lastExam.passed ? "text-moss" : "text-wrong"}`}
            >
              {lastExam.score}/{lastExam.total}
            </span>
            <span
              className={`px-[7px] py-[3px] font-mono text-[10px] font-semibold tracking-[0.12em] text-paper ${
                lastExam.passed ? "bg-moss" : "bg-wrong"
              }`}
            >
              {lastExam.passed ? "PASS" : "FAIL"}
            </span>
          </div>
          <Link
            to="/progress"
            className="self-start border-b border-[#d9bfb5] text-[15px] text-brick"
          >
            View all progress →
          </Link>
        </section>
      )}

      {weakest && (
        <Link to={`/study/${weakest.code}`} className="flex flex-col gap-2 border-t border-rule pt-3.5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
            Weakest section
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-mono text-[12px] text-brick">{weakest.code}</span>
            <span className="text-[18px] text-ink">{weakest.name}</span>
            <span className="ml-auto font-mono text-[11px] text-muted">{pct(weakest.accuracy)}</span>
          </span>
        </Link>
      )}
    </div>
  );
}
