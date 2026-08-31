interface Props {
  value: number; // 0..1
  className?: string;
  colorClass?: string;
}

export default function ProgressBar({ value, className = "", colorClass = "bg-sky-500" }: Props) {
  const width = `${Math.min(100, Math.max(0, value * 100))}%`;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}>
      <div className={`h-full rounded-full ${colorClass} transition-all`} style={{ width }} />
    </div>
  );
}
