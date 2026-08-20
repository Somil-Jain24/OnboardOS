import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, Loader2, Sparkles, Shield, Cpu, Network, FileCheck } from 'lucide-react';

export interface ReasoningStep {
  id: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
}

export interface ReasoningSequenceProps {
  onComplete?: () => void;
  speedMs?: number; // duration per step in ms (e.g. 500ms for demo, 150ms for instant)
  className?: string;
}

export function ReasoningSequence({
  onComplete,
  speedMs = 600,
  className,
}: ReasoningSequenceProps) {
  const steps: ReasoningStep[] = [
    {
      id: 'context',
      title: 'Normalizing Employee Context',
      detail: 'Captured role, department, seniority, employment type & manager relationship into immutable context snapshot.',
      icon: <Cpu className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'policy',
      title: 'Evaluating Deterministic Policy Rules',
      detail: 'Loaded versioned requirement rules (v1.0.0) for Engineering / Payments scope.',
      icon: <Shield className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'ai-reasoning',
      title: 'Running AI Role Intelligence Model',
      detail: 'Synthesizing contextual access candidates with confidence scoring and plain-language rationales.',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'rules-reconciliation',
      title: 'Reconciling AI Suggestions with Rules Engine',
      detail: 'Deterministic policy verified; AWS Cloud Access downgraded to APPROVAL_REQUIRED per least-privilege policy.',
      icon: <FileCheck className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'dag',
      title: 'Constructing Dependency Execution DAG',
      detail: 'Validated acyclic graph: Google Workspace → GitHub/Slack/Jira → AWS (gated on Manager approval).',
      icon: <Network className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (activeStepIndex < steps.length) {
      const timer = setTimeout(() => {
        setActiveStepIndex((prev) => prev + 1);
      }, speedMs);
      return () => clearTimeout(timer);
    } else if (!completed) {
      setCompleted(true);
      if (onComplete) {
        const finishTimer = setTimeout(() => {
          onComplete();
        }, 400);
        return () => clearTimeout(finishTimer);
      }
    }
  }, [activeStepIndex, steps.length, speedMs, completed, onComplete]);

  return (
    <div className={cn('p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl', className)}>
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              OnboardOS Intelligence Engine
              {!completed && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  Synthesizing Plan...
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              Reasoning sequence proving deterministic policy + AI recommendation synthesis
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Step {Math.min(activeStepIndex + 1, steps.length)} of {steps.length}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex && !completed;
          const isPending = idx > activeStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl transition-all duration-300',
                isDone && 'bg-slate-950/40 border border-emerald-500/20',
                isCurrent && 'bg-blue-950/30 border border-blue-500/40 shadow-sm shadow-blue-500/10',
                isPending && 'opacity-40 border border-transparent'
              )}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isDone ? 'text-emerald-300' : isCurrent ? 'text-blue-300' : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-blue-400 animate-pulse font-mono">
                      Running...
                    </span>
                  )}
                </div>
                {(isDone || isCurrent) && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed animate-in fade-in duration-300">
                    {step.detail}
                  </p>
                )}
              </div>

              <div className="opacity-70">{step.icon}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
