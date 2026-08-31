import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { progressStore } from "../lib/progress";
import { useProgress } from "../lib/useProgress";
import { overallStats, subelementStats, pct } from "../lib/stats";
import { subelementByCode } from "../lib/data";

function accColor(accuracy: number, attempts: number): string {
  if (attempts === 0) return "bg-rule-soft";
  if (accuracy >= 0.85) return "bg-moss";
  if (accuracy >= 0.74) return "bg-amber";
  return "bg-wrong";
}

function resetAll() {
  if (confirm("Reset all study progress? This can't be undone.")) progressStore.reset();
}

export default function ProgressPage() {
  const state = useProgress();
  const navigate = useNavigate();
  const overall = overallStats(state);
  const subs = subelementStats(state);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-medium leading-[1.05] text-ink md:text-[34px] md:leading-[1.1]">
          Progress
        </h1>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted">
          {overall.seen}/{overall.total} seen · {overall.flagged} flagged
          {state.exams.length > 0 && (
            <span className="hidden md:inline"> · {state.exams.length} exams taken</span>
          )}
        </p>
      </header>

      {/* ---------- Mobile: subelement cards ---------- */}
      <div className="flex flex-col gap-3 md:hidden">
        {subs.map((s) => (
          <button
            key={s.code}
            onClick={() => navigate(`/study/${s.code}`)}
            className="flex flex-col gap-2.5 border border-rule bg-card p-[14px] text-left transition-colors hover:border-brick"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[12px] text-brick">{s.code}</span>
                <span className="text-[16px] text-ink">{s.name}</span>
              </span>
              <span className="font-mono text-[10px] text-muted">
                {s.attempts > 0 ? `${pct(s.accuracy)} acc` : "untested"}
              </span>
            </div>
            <Meter label="seen" value={s.coverage} color="bg-brick" show />
            <Meter label="accuracy" value={s.accuracy} color={accColor(s.accuracy, s.attempts)} show={s.attempts > 0} />
          </button>
        ))}
      </div>

      {/* ---------- Desktop: table + aside ---------- */}
      <div className="hidden gap-10 md:grid md:grid-cols-[1.35fr_1fr] md:items-start">
        <div className="border-t border-rule">
          <div className="flex items-center gap-3.5 border-b border-rule py-2.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
            <span className="w-[26px]">§</span>
            <span className="flex-1">Subelement</span>
            <span className="w-[60px] text-right">Exam Q</span>
            <span className="w-[170px] text-right">Seen</span>
            <span className="w-[170px] text-right">Accuracy</span>
          </div>
          {subs.map((s) => (
            <div
              key={s.code}
              onClick={() => navigate(`/study/${s.code}`)}
              className="flex cursor-pointer items-center gap-3.5 border-b border-rule-soft py-3 transition-colors hover:bg-card"
            >
              <span className="w-[26px] font-mono text-[12px] text-brick">{s.code}</span>
              <span className="flex-1 text-[17px] text-ink">{s.name}</span>
              <span className="w-[60px] text-right font-mono text-[11px] text-muted">
                {subelementByCode(s.code)?.examQuestions}
              </span>
              <TableMeter value={s.coverage} color="bg-brick" show />
              <TableMeter value={s.accuracy} color={accColor(s.accuracy, s.attempts)} show={s.attempts > 0} />
            </div>
          ))}
        </div>

        <aside className="flex flex-col gap-[18px]">
          {state.exams.length > 0 && (
            <div className="flex flex-col gap-3.5 border border-rule bg-card p-[22px]">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Exam history
              </div>
              {state.exams.slice(0, 8).map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-rule-soft pb-2.5 last:border-0 last:pb-0"
                >
                  <span className="font-mono text-[11px] text-muted">
                    {new Date(e.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="text-[19px] text-ink">
                      {e.score}/{e.total}
                    </span>
                    <span
                      className={`px-1.5 py-[3px] font-mono text-[9.5px] font-semibold tracking-[0.12em] text-paper ${
                        e.passed ? "bg-moss" : "bg-wrong"
                      }`}
                    >
                      {e.passed ? "PASS" : "FAIL"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={resetAll}
            className="self-start font-mono text-[10.5px] tracking-[0.08em] text-[#a09887] underline"
          >
            Reset all progress
          </button>
        </aside>
      </div>

      {/* mobile exam history + reset */}
      <div className="flex flex-col gap-3 md:hidden">
        {state.exams.length > 0 && (
          <section className="flex flex-col gap-3 border border-rule bg-card p-[18px]">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
              Exam history
            </div>
            {state.exams.slice(0, 8).map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-rule-soft pb-2.5 last:border-0 last:pb-0"
              >
                <span className="font-mono text-[11px] text-muted">
                  {new Date(e.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="text-[18px] text-ink">
                    {e.score}/{e.total}
                  </span>
                  <span
                    className={`px-1.5 py-[3px] font-mono text-[9.5px] font-semibold tracking-[0.12em] text-paper ${
                      e.passed ? "bg-moss" : "bg-wrong"
                    }`}
                  >
                    {e.passed ? "PASS" : "FAIL"}
                  </span>
                </span>
              </div>
            ))}
          </section>
        )}
        <button
          onClick={resetAll}
          className="self-start font-mono text-[10.5px] tracking-[0.08em] text-[#a09887] underline"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  color,
  show,
}: {
  label: string;
  value: number;
  color: string;
  show: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
      <ProgressBar value={show ? value : 0} colorClass={color} className="flex-1" />
      <span className="w-[34px] text-right font-mono text-[10px] text-muted">
        {show ? pct(value) : "—"}
      </span>
    </div>
  );
}

function TableMeter({ value, color, show }: { value: number; color: string; show: boolean }) {
  return (
    <div className="flex w-[170px] items-center gap-2">
      <ProgressBar value={show ? value : 0} colorClass={color} className="flex-1" />
      <span className="w-[34px] text-right font-mono text-[10.5px] text-muted">
        {show ? pct(value) : "—"}
      </span>
    </div>
  );
}
