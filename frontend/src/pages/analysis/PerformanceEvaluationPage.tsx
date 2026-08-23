import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  ArrowUpRight,
  Info,
  Layers,
  FileCheck,
  Users,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { ANALYSIS_EMPLOYEES } from './analysisData';
import { EmployeeAnalysisSelector } from './EmployeeAnalysisSelector';

export const PerformanceEvaluationPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string>('rahul');

  const currentEmp = ANALYSIS_EMPLOYEES[selectedKey] || ANALYSIS_EMPLOYEES['rahul'];

  // Calculate weighted outcome score
  const totalScore = currentEmp.metrics.reduce(
    (acc, m) => acc + m.weight * m.score,
    0
  );
  const roundedScore = Number(totalScore.toFixed(1));

  const isLowPerformance = roundedScore < 60;
  const isHighPerformance = roundedScore >= 75;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Outcome-Based Performance Evaluation
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-11">
            Real-time outcome measurement, weighted score formula & skill growth matrix.
          </p>
        </div>

        {/* Employee Switcher with Search */}
        <EmployeeAnalysisSelector selectedKey={selectedKey} onSelect={setSelectedKey} />
      </div>

      {/* Top Profile & Score Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4 col-span-1 lg:col-span-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black font-mono shadow-md shadow-blue-500/20 flex-shrink-0">
            {currentEmp.avatar}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-900 truncate">{currentEmp.name}</h2>
              <Badge variant={currentEmp.statusVariant} size="sm">
                {currentEmp.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{currentEmp.role} • {currentEmp.department}</p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-0.5">
              <span>ID: {currentEmp.id}</span>
              <span>•</span>
              <span>Joined: {currentEmp.joined}</span>
            </div>
          </div>
        </div>

        {/* Overall Weighted Score */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
            <span>Overall Score</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 py-2">
            <span className={cn(
              'text-3xl lg:text-4xl font-black tracking-tight',
              isLowPerformance ? 'text-rose-600' : isHighPerformance ? 'text-emerald-600' : 'text-amber-600'
            )}>
              {roundedScore}
            </span>
            <span className="text-sm font-bold text-slate-400 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {isLowPerformance
              ? '⚠️ Below 60 benchmark — Action required'
              : isHighPerformance
              ? '🟢 Ready for independent contribution'
              : '🟡 Moderately progressing'}
          </p>
        </div>

        {/* Outcome Health Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
            <span>Readiness Level</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="py-2">
            <span className={cn(
              'text-lg font-black px-2.5 py-1 rounded-xl inline-block border',
              isLowPerformance
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isHighPerformance
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            )}>
              {isLowPerformance ? 'At Risk (<60)' : isHighPerformance ? 'Role Ready (75+)' : 'Developing (60-74)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Evaluated for {currentRole} view
          </p>
        </div>
      </div>

      {/* Main Weighted Score Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Weighted Performance Parameters</h3>
            <p className="text-xs text-slate-500">Exact breakdown of output-oriented criteria</p>
          </div>
          <div className="text-xs font-mono bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-xl border border-blue-100">
            Total Weight: 100%
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Parameter (Outcome-Based)</th>
                <th className="px-5 py-3 text-center">Weight</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Score</th>
                <th className="px-5 py-3 text-right">Weighted Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentEmp.metrics.map((m, idx) => {
                const weightedPoints = (m.weight * m.score).toFixed(1);
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                      [{m.code}]
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {m.name}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        {(m.weight * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                      {m.description}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg',
                        m.score >= 80 ? 'bg-emerald-50 text-emerald-700' : m.score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      )}>
                        {m.score}/100
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-slate-900">
                      +{weightedPoints} pts
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
                <td colSpan={2} className="px-5 py-4 text-slate-900 font-black text-sm">
                  Total Outcome Score (Weighted)
                </td>
                <td className="px-5 py-4 text-center font-mono text-slate-900 font-black">
                  100%
                </td>
                <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                  Sum of all weighted parameters
                </td>
                <td colSpan={2} className="px-5 py-4 text-right font-mono font-black text-base text-blue-600">
                  {roundedScore} / 100
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula & Privacy Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formula Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl text-white space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
            <Zap className="w-4 h-4" />
            <span>How Score is Calculated</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-mono text-xs md:text-sm font-bold text-cyan-200 leading-relaxed overflow-x-auto">
            Score = 0.25T + 0.20D + 0.20Q + 0.15P + 0.10B + 0.05L + 0.05M
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-1">
            <span>T = Task Completion</span>
            <span>D = Timeliness</span>
            <span>Q = Quality/Accuracy</span>
            <span>P = Onboarding Progress</span>
            <span>B = Blocker Resolution</span>
            <span>L = Learning & Res.</span>
            <span>M = Manager Feedback</span>
          </div>
        </div>

        {/* What We DO NOT Use */}
        <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-200/80 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>What We DO NOT Use for Performance</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Login / Screen Time', icon: '⏱️' },
              { label: 'Work Speed Rush', icon: '⚡' },
              { label: 'Mouse / Keylogger', icon: '🖱️' },
              { label: 'Hours Online', icon: '💻' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white rounded-2xl border border-rose-100 text-center space-y-1">
                <span className="text-base">{item.icon}</span>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">{item.label}</p>
                <span className="text-rose-500 font-black text-xs">✕ Excluded</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            OnboardOS evaluates real deliverables and verified readiness, completely eliminating vanity surveillance.
          </p>
        </div>
      </div>
    </div>
  );
};
