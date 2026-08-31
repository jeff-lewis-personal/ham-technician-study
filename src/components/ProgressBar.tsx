interface Props {
  value: number; // 0..1
  className?: string;
  colorClass?: string;
  heightClass?: string;
}

export default function ProgressBar({
  value,
  className = "",
  colorClass = "bg-brick",
  heightClass = "h-[5px]",
}: Props) {
  const width = `${Math.min(100, Math.max(0, value * 100))}%`;
  return (
    <div className={`${heightClass} w-full overflow-hidden bg-rule-soft ${className}`}>
      <div className={`h-full ${colorClass} transition-[width]`} style={{ width }} />
    </div>
  );
}
