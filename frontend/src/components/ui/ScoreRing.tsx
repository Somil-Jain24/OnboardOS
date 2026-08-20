import { cn } from '../../utils/cn';

export interface ScoreRingProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'readiness' | 'risk';
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  className?: string;
}

export function ScoreRing({
  score,
  size = 'md',
  type = 'readiness',
  label,
  sublabel,
  showPercent = true,
  className,
}: ScoreRingProps) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Sizes in px
  const dimensions = {
    sm: { radius: 24, stroke: 4, width: 64, text: 'text-base font-bold' },
    md: { radius: 36, stroke: 6, width: 96, text: 'text-2xl font-bold' },
    lg: { radius: 50, stroke: 8, width: 128, text: 'text-3xl font-extrabold' },
    xl: { radius: 64, stroke: 10, width: 160, text: 'text-4xl font-extrabold' },
  };

  const dim = dimensions[size];
  const circumference = 2 * Math.PI * dim.radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Colors based on readiness vs risk
  let strokeColor = 'text-blue-500';
  let glowColor = 'glow-blue';

  if (type === 'readiness') {
    if (normalizedScore >= 90) {
      strokeColor = 'text-emerald-500';
      glowColor = 'glow-emerald';
    } else if (normalizedScore >= 50) {
      strokeColor = 'text-blue-500';
      glowColor = 'glow-blue';
    } else if (normalizedScore >= 25) {
      strokeColor = 'text-amber-500';
      glowColor = 'glow-amber';
    } else {
      strokeColor = 'text-slate-500';
      glowColor = '';
    }
  } else {
    // Risk score: high risk = bad (rose), low risk = good (emerald)
    if (normalizedScore >= 70) {
      strokeColor = 'text-rose-500';
      glowColor = 'glow-rose';
    } else if (normalizedScore >= 35) {
      strokeColor = 'text-amber-500';
      glowColor = 'glow-amber';
    } else {
      strokeColor = 'text-emerald-500';
      glowColor = 'glow-emerald';
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className={cn('relative inline-flex items-center justify-center', glowColor)}>
        <svg
          width={dim.width}
          height={dim.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={dim.width / 2}
            cy={dim.width / 2}
            r={dim.radius}
            stroke="currentColor"
            strokeWidth={dim.stroke}
            fill="transparent"
            className="text-slate-800"
          />
          {/* Foreground circle */}
          <circle
            cx={dim.width / 2}
            cy={dim.width / 2}
            r={dim.radius}
            stroke="currentColor"
            strokeWidth={dim.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(strokeColor, 'transition-all duration-700 ease-out')}
          />
        </svg>

        {/* Center score label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={cn('tracking-tight text-slate-100 font-mono', dim.text)}>
            {normalizedScore}
            {showPercent && <span className="text-xs font-normal text-slate-400 ml-0.5">%</span>}
          </span>
        </div>
      </div>

      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-200 tracking-wide uppercase">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[11px] text-slate-400">
          {sublabel}
        </span>
      )}
    </div>
  );
}
