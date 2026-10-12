export function RiskScore({ score, level }: { score: number; level: "high" | "medium" | "low" }) {
  const isCritical = score > 75;
  const isWarning = score > 25 && score <= 75;
  const isSuccess = score <= 25;

  const colorClass = isCritical ? "text-status-critical" : isWarning ? "text-status-warning" : "text-status-success";
  
  // Circumference = 2 * pi * r = 2 * 3.14159 * 42 = 263.89
  const circumference = 263.89;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-space-lg">
      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle className="text-surface-elevated fill-none" cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8"></circle>
          <circle 
            className={`${colorClass} fill-none transition-all duration-1000`} 
            cx="50" cy="50" r="42" 
            stroke="currentColor" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            strokeWidth="8"
          ></circle>
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-display-lg text-[26px] leading-tight font-bold text-on-surface">{score}</span>
          <span className="font-label-xs text-label-xs text-outline font-semibold">/ 100</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-label-md text-label-md uppercase tracking-wider text-outline">Risk Vector Index</span>
        <span className={`font-headline-md text-headline-md font-semibold ${isCritical ? "text-error" : (isWarning ? "text-status-warning" : "text-status-success")}`}>
          {isCritical ? "Severe Divergence" : (isWarning ? "Elevated Variance" : "Baseline Clearance")}
        </span>
        <span className="font-body-sm text-body-sm text-outline mt-0.5">Threshold: ≤ 25.0 for green lane</span>
      </div>
    </div>
  );
}
