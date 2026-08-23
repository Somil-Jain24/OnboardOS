import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  RotateCcw,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code2,
  Layout,
  Bug,
  BookMarked,
  Users,
  ShieldCheck,
  Zap,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { ANALYSIS_EMPLOYEES } from './analysisData';
import { EmployeeAnalysisSelector } from './EmployeeAnalysisSelector';

export const AIRecoveryPlanPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string>('amit');
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({
    'js-fund': true,
  });
  const [isDispatched, setIsDispatched] = useState(false);

  const currentEmp = ANALYSIS_EMPLOYEES[selectedKey] || ANALYSIS_EMPLOYEES['amit'];

  const totalModules = currentEmp.practiceModules.length;
  const completedCount = currentEmp.practiceModules.filter((pm) => completedModules[pm.id]).length;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 100;

  // Dynamic Live Score based on checked practice modules
  const baselineScore = currentEmp.overallScore;
  const targetImprovement = Math.max(0, 83.5 - baselineScore);
  const pointsPerModule = totalModules > 0 ? targetImprovement / totalModules : 0;
  const liveScore = Number((baselineScore + (completedCount * pointsPerModule)).toFixed(1));

  const isLowPerformance = liveScore < 60;
  const isDeveloping = liveScore >= 60 && liveScore < 75;
  const isRoleReady = liveScore >= 75;

  const toggleModule = (id: string) => {
    setCompletedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllModules = () => {
    const all: Record<string, boolean> = {};
    currentEmp.practiceModules.forEach((pm) => {
      all[pm.id] = true;
    });
    setCompletedModules(all);
  };

  const clearAllModules = () => {
    setCompletedModules({});
  };

  const handleDispatchPlan = () => {
    setIsDispatched(true);
    setTimeout(() => setIsDispatched(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              AI Recovery Plan (Low Performance Detected)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-11">
            Automatic target revision + personalized practice plan to improve performance.
          </p>
        </div>

        {/* Employee Switcher with Search */}
        <EmployeeAnalysisSelector selectedKey={selectedKey} onSelect={setSelectedKey} />
      </div>

      {/* Top Banner: Employee Profile & 3-Step Process */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Performance Status Alert Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black font-mono shadow-md flex-shrink-0 transition-colors',
            isRoleReady
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20'
              : isDeveloping
              ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/20'
              : 'bg-gradient-to-tr from-amber-500 to-rose-600 shadow-rose-500/20'
          )}>
            {currentEmp.avatar}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors',
                isRoleReady
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : isDeveloping
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-600 bg-rose-50 border-rose-200'
              )}>
                {isRoleReady ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Target Achieved (Role Ready)
                  </>
                ) : isDeveloping ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-amber-600" /> Recovering (Developing)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> Low Performance Detected
                  </>
                )}
              </span>
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">{currentEmp.name}</h2>
              <p className="text-xs text-slate-500">{currentEmp.role} • Joined: {currentEmp.joined}</p>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-xs font-bold text-slate-500">Live Calculated Score:</span>
              <span className={cn(
                'text-xl font-black transition-colors',
                isRoleReady ? 'text-emerald-600' : isDeveloping ? 'text-amber-600' : 'text-rose-600'
              )}>
                {liveScore}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 font-mono transition-colors',
                isRoleReady
                  ? 'text-emerald-700 bg-emerald-100'
                  : isDeveloping
                  ? 'text-amber-700 bg-amber-100'
                  : 'text-rose-700 bg-rose-100'
              )}>
                {isRoleReady ? 'Role Ready (75+)' : isDeveloping ? 'Developing (60–74)' : 'At Risk (<60)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {completedCount > 0
                ? `${completedCount} of ${totalModules} practice modules completed (+${(completedCount * pointsPerModule).toFixed(1)} recovery boost).`
                : 'Score is below 60. AI Recovery Plan has been automatically activated.'}
            </p>
          </div>
        </div>

        {/* Right: AI Recovery Plan Generated in 3 Steps */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider font-mono text-slate-500 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Recovery Plan Generated in 3 Steps</span>
            </div>
            <span className="text-blue-600 font-semibold lowercase">
              {completedCount}/{totalModules} active tasks completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-1">
            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1 relative">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-extrabold text-purple-900">1. Target Revision</h4>
              </div>
              <p className="text-[11px] text-purple-800 leading-snug">
                Adjust realistic short-term targets based on current performance.
              </p>
            </div>

            <div className={cn(
              'p-3 rounded-2xl border space-y-1 relative transition-colors',
              completedCount > 0 ? 'bg-blue-50/90 border-blue-300 shadow-xs' : 'bg-blue-50/60 border-blue-100'
            )}>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-extrabold text-blue-900">2. Practice Plan</h4>
                </div>
                <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                  {progressPercent}%
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-snug">
                {completedCount} of {totalModules} modules selected &amp; verified.
              </p>
            </div>

            <div className={cn(
              'p-3 rounded-2xl border space-y-1 relative transition-colors',
              isRoleReady ? 'bg-emerald-100/80 border-emerald-300 shadow-xs' : 'bg-emerald-50/60 border-emerald-100'
            )}>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-extrabold text-emerald-900">3. Tracking</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700">
                  {liveScore} pts
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                {isRoleReady ? 'Target reached: 82+ readiness achieved!' : 'Continuous score trajectory update in real-time.'}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-2 flex items-center justify-between border-t border-slate-100">
            <span>Intervention Trigger: Score Threshold &lt; 60</span>
            <button
              onClick={handleDispatchPlan}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {isDispatched ? '✓ Plan Synced to Hub' : '⚡ Sync Plan to Hub'}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Action Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Target Revision Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Target className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">1. Target Revision</h3>
            </div>
            <p className="text-xs text-slate-500">
              Targets are revised to be realistic and achievable.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2">Metric</th>
                  <th className="px-2 py-2 text-center">Prev</th>
                  <th className="px-2 py-2 text-center">Revised</th>
                  <th className="px-3 py-2 text-right">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentEmp.targetRevisions.length > 0 ? (
                  currentEmp.targetRevisions.map((tr, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-bold text-slate-800 text-[11px] truncate max-w-[130px]">
                        {tr.metric}
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono text-slate-400 line-through text-[11px]">
                        {tr.previous}
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-bold text-purple-600 text-[11px]">
                        {tr.revised}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500 text-[10px]">
                        {tr.timeline}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-mono text-xs">
                      All standard onboarding targets are currently met.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
            <span className="text-blue-600 font-bold">ℹ️</span>
            <p className="text-[11px] leading-snug">
              Targets are temporarily adjusted to help the employee build momentum and confidence.
            </p>
          </div>
        </div>

        {/* 2. Personalized Practice Plan (Interactive with Live Recalculation) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">2. Personalized Practice Plan</h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                {completedCount}/{totalModules} Completed
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Intervention Completion</span>
                <span className="font-mono font-bold text-slate-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Bulk Selection Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Click items to mark verified:</span>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={clearAllModules}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Module List with Dynamic Highlight */}
          <div className="space-y-2 flex-1">
            {currentEmp.practiceModules.length > 0 ? (
              currentEmp.practiceModules.map((pm) => {
                const isDone = Boolean(completedModules[pm.id]);
                return (
                  <div
                    key={pm.id}
                    onClick={() => toggleModule(pm.id)}
                    className={cn(
                      'p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group select-none',
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-blue-300'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-xl border shadow-xs flex-shrink-0 transition-colors',
                      isDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-blue-600'
                    )}>
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={cn(
                          'font-extrabold text-xs truncate transition-colors',
                          isDone ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                        )}>
                          {pm.title}
                        </h4>
                        <span className={cn(
                          'text-[10px] font-mono',
                          isDone ? 'text-emerald-700 font-bold' : 'text-slate-400'
                        )}>
                          {pm.duration}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">{pm.desc}</p>
                    </div>
                    <div className="pt-0.5 flex-shrink-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-lg flex items-center justify-center border transition-all',
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 bg-white group-hover:border-blue-400'
                        )}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No active recovery modules required for this employee.
              </div>
            )}
          </div>

          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-start gap-2 text-xs text-purple-900">
            <span className="text-purple-600 font-bold">✨</span>
            <p className="text-[11px] leading-snug">
              Completing modules dynamically increments the recovery score and updates the trajectory.
            </p>
          </div>
        </div>

        {/* 3. Expected Improvement Trajectory (Dynamic with Live SVG Line) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">3. Expected Improvement</h3>
              </div>
              <span className={cn(
                'text-xs font-mono font-bold px-2 py-0.5 rounded-md border',
                isRoleReady
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              )}>
                {isRoleReady ? 'Goal Reached' : 'In Progress'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Consistent effort will lead to performance improvement.
            </p>
          </div>

          {/* Dynamic SVG Trajectory Chart */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Projected Score Improvement</span>
              <span className="font-mono text-emerald-600 font-black text-sm">
                {liveScore >= 82 ? `${liveScore} pts (Ready)` : '82+ pts target'}
              </span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-32 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Flat trend without plan (dashed gray line) */}
                <path
                  d="M 20 90 L 280 85"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Projected Improvement curve (emerald gradient line) */}
                <path
                  d={`M 20 ${120 - (liveScore * 1.05)} Q 150 50 280 20`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="20" cy={120 - (liveScore * 1.05)} r="5" fill={isRoleReady ? '#10b981' : isDeveloping ? '#f59e0b' : '#e11d48'} stroke="#ffffff" strokeWidth="2" />
                <circle cx="160" cy="55" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <circle cx="280" cy="20" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

                {/* Point Labels */}
                <text x="20" y={Math.max(15, 120 - (liveScore * 1.05) - 8)} fontSize="9" fill={isRoleReady ? '#047857' : isDeveloping ? '#b45309' : '#e11d48'} fontWeight="bold" textAnchor="middle">
                  {liveScore}
                </text>
                <text x="160" y="45" fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="middle">67</text>
                <text x="280" y="12" fontSize="9" fill="#10b981" fontWeight="bold" textAnchor="middle">82+</text>
              </svg>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
              <span>Today ({liveScore})</span>
              <span>Week 2</span>
              <span>Week 4</span>
              <span>Week 6</span>
              <span>Week 8</span>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] font-mono pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> With AI Recovery Plan
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-slate-400 border-dashed inline-block" /> Current Trend (Without Plan)
              </span>
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-xs text-slate-800">Expected Outcome</h4>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn('w-3.5 h-3.5 flex-shrink-0', liveScore >= 75 ? 'text-emerald-600' : 'text-slate-400')} />
                <span>Reach <strong>75+ score</strong> in 4–6 weeks {liveScore >= 75 && '🎉 (Achieved!)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Complete onboarding successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Build strong skills &amp; confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Be ready for higher responsibility</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formula & Privacy Footers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formula Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider font-mono">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>How Performance Score is Calculated (Outcome Based)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-900 overflow-x-auto">
            Score = 0.25T + 0.20D + 0.20Q + 0.15P + 0.10B + 0.05L + 0.05M
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-500">
            <span>T = Task Completion</span>
            <span>D = Timeliness</span>
            <span>Q = Quality / Accuracy</span>
            <span>P = Onboarding Progress</span>
            <span>B = Blocker Resolution</span>
            <span>L = Learning &amp; Res</span>
            <span>M = Manager Feedback</span>
          </div>
        </div>

        {/* Anti Surveillance Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>What We DO NOT Use for Performance Evaluation</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Login / Screen Time' },
              { label: 'Work Speed Rush' },
              { label: 'Mouse / Keylogger' },
              { label: 'Hours Online' },
            ].map((item, i) => (
              <div key={i} className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">{item.label}</p>
                <span className="text-rose-500 font-bold text-[10px]">✕</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            These activity metrics are tracked separately for insights only, not for performance scoring.
          </p>
        </div>
      </div>

      {/* Bottom Summary Callout */}
      <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/60 flex items-center gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="font-medium">
          OnboardOS helps employees recover, grow and succeed through outcome-based evaluation, smart target revision and personalized practice.
        </p>
      </div>
    </div>
  );
};
