import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightLeft,
  TrendingUp,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckSquare,
  Clock,
  Target,
  FileCode,
  Users,
  Compass,
  Layers,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { ANALYSIS_EMPLOYEES } from './analysisData';
import { EmployeeAnalysisSelector } from './EmployeeAnalysisSelector';

export const ReadinessComparisonPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string>('rahul');

  const currentEmp = ANALYSIS_EMPLOYEES[selectedKey] || ANALYSIS_EMPLOYEES['rahul'];

  const getMetricIcon = (idx: number) => {
    switch (idx) {
      case 0: return <CheckSquare className="w-3.5 h-3.5 text-purple-600" />;
      case 1: return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 2: return <Target className="w-3.5 h-3.5 text-amber-600" />;
      case 3: return <Layers className="w-3.5 h-3.5 text-indigo-600" />;
      case 4: return <Zap className="w-3.5 h-3.5 text-rose-600" />;
      case 5: return <FileCode className="w-3.5 h-3.5 text-cyan-600" />;
      default: return <Users className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Pre vs Post Onboarding Readiness Comparison
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-11">
            Measure employee growth from day 1 baseline to onboarding completion.
          </p>
        </div>

        {/* Employee Switcher with Search */}
        <EmployeeAnalysisSelector selectedKey={selectedKey} onSelect={setSelectedKey} />
      </div>

      {/* Top Banner: Employee Growth Comparison Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Profile */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black font-mono shadow-md shadow-blue-500/20 flex-shrink-0">
            {currentEmp.avatar}
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="font-extrabold text-lg text-slate-900 truncate">{currentEmp.name}</h2>
            <p className="text-xs text-slate-500">{currentEmp.role}</p>
            <p className="text-[11px] font-mono text-slate-400">Joined: {currentEmp.joined}</p>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="md:col-span-5 flex items-center gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex-1 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Pre Onboarding (Baseline)
            </span>
            <p className="text-xs font-extrabold text-slate-800">Assessment: Day 1</p>
            <span className="text-[11px] text-slate-500 font-mono">Score: {currentEmp.preScore}/100</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex-1 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono">
              Post Onboarding (Final)
            </span>
            <p className="text-xs font-extrabold text-slate-900">{currentEmp.status}</p>
            <span className="text-[11px] text-emerald-700 font-semibold font-mono">Score: {currentEmp.postScore}/100</span>
          </div>
        </div>

        {/* Total Delta Score Card */}
        <div className="md:col-span-3 bg-gradient-to-br from-emerald-50 to-teal-50/70 p-4 rounded-2xl border border-emerald-200/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
            Overall Readiness Improvement
          </span>
          <div className="flex items-baseline gap-1 py-1">
            <span className="text-3xl font-black text-emerald-600">{currentEmp.scoreDiff}</span>
            <span className="text-sm font-bold text-emerald-700">points</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">
            Great progress! {currentEmp.name.split(' ')[0]} is now well-prepared for the role.
          </p>
        </div>
      </div>

      {/* Main Comparative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Table: Outcome Based Readiness Score (Weighted) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Outcome Based Readiness Score (Weighted)</h3>
            <p className="text-xs text-slate-500">Side-by-side comparison across all 7 evaluation pillars</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2.5">Parameter (Outcome Based)</th>
                  <th className="px-2 py-2.5 text-center">Weight</th>
                  <th className="px-3 py-2.5 text-center">Pre Score</th>
                  <th className="px-3 py-2.5 text-center">Post Score</th>
                  <th className="px-3 py-2.5 text-right">Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentEmp.metrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-3 font-bold text-slate-900 flex items-center gap-2">
                      {getMetricIcon(idx)}
                      <span>{row.name}</span>
                    </td>
                    <td className="px-2 py-3 text-center font-mono font-bold text-slate-500">
                      {(row.weight * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: `${row.preScore || 40}%` }} />
                        </div>
                        <span className="font-mono text-slate-600 font-bold">{row.preScore || 40}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${row.postScore || row.score}%` }} />
                        </div>
                        <span className="font-mono text-emerald-700 font-bold">{row.postScore || row.score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-black text-emerald-600">
                      {row.diff || `+${((row.postScore || row.score) - (row.preScore || 40)).toFixed(1)}`}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200">
                  <td className="px-3 py-3.5 text-slate-900 font-black">
                    Total Weighted Score
                  </td>
                  <td className="px-2 py-3.5 text-center font-mono font-black text-slate-900">
                    100%
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono font-black text-purple-700 text-sm">
                    {currentEmp.preScore} / 100
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono font-black text-emerald-700 text-sm">
                    {currentEmp.postScore} / 100
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                    {currentEmp.scoreDiff}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Multi-Dimension Comparison Chart & Status */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dual Line SVG Curve Chart */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Readiness Score Comparison</h3>
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Pre (Baseline)
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Post (Final)
                </span>
              </div>
            </div>

            {/* Custom SVG Dual Line Plot */}
            <div className="h-44 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 350 140" preserveAspectRatio="none">
                {/* Horizontal scale lines */}
                <line x1="20" y1="20" x2="330" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="20" y1="50" x2="330" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="20" y1="80" x2="330" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="20" y1="110" x2="330" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Y-Axis scale text */}
                <text x="5" y="24" fontSize="8" fill="#94a3b8" className="font-mono">100</text>
                <text x="5" y="54" fontSize="8" fill="#94a3b8" className="font-mono">75</text>
                <text x="5" y="84" fontSize="8" fill="#94a3b8" className="font-mono">50</text>
                <text x="5" y="114" fontSize="8" fill="#94a3b8" className="font-mono">25</text>

                {/* Post Line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points={currentEmp.metrics
                    .map((m, i) => `${35 + i * 45},${120 - ((m.postScore || m.score) * 1.0)}`)
                    .join(' ')}
                  strokeLinecap="round"
                />

                {/* Pre Line */}
                <polyline
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  points={currentEmp.metrics
                    .map((m, i) => `${35 + i * 45},${120 - ((m.preScore || 40) * 1.0)}`)
                    .join(' ')}
                  strokeLinecap="round"
                />

                {/* Post Data Points & Labels */}
                {currentEmp.metrics.map((m, i) => {
                  const x = 35 + i * 45;
                  const y = 120 - ((m.postScore || m.score) * 1.0);
                  return (
                    <g key={`post-${i}`}>
                      <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y - 7} fontSize="8" fill="#047857" fontWeight="bold" textAnchor="middle">
                        {m.postScore || m.score}
                      </text>
                    </g>
                  );
                })}

                {/* Pre Data Points & Labels */}
                {currentEmp.metrics.map((m, i) => {
                  const x = 35 + i * 45;
                  const y = 120 - ((m.preScore || 40) * 1.0);
                  return (
                    <g key={`pre-${i}`}>
                      <circle cx={x} cy={y} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y + 13} fontSize="8" fill="#6d28d9" fontWeight="bold" textAnchor="middle">
                        {m.preScore || 40}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-7 text-[8px] font-mono text-slate-400 text-center pt-1 border-t border-slate-100">
              <span>Task Comp.</span>
              <span>Timeliness</span>
              <span>Quality</span>
              <span>Progress</span>
              <span>Blockers</span>
              <span>Learning</span>
              <span>Feedback</span>
            </div>

            {/* Key Takeaway box */}
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-2 text-xs text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-emerald-900 block">Key Takeaway</span>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  {currentEmp.name.split(' ')[0]} has demonstrated substantial capability growth with an overall readiness delta of <strong>{currentEmp.scoreDiff} points</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Status Evolution Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Employee Readiness Status Evolution
            </h4>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Pre Onboarding</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-rose-600">{currentEmp.preScore}</span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <Badge variant="danger" size="sm">Baseline</Badge>
              </div>

              <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 font-bold">
                →
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase">Post Onboarding</span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-xl font-black text-emerald-600">{currentEmp.postScore}</span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <Badge variant="success" size="sm">Ready</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* What Improved the Most? */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900">What Improved the Most?</h4>
          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Blocker Resolution</span>
                <span className="font-mono text-emerald-600 font-bold">+60.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Onboarding Progress</span>
                <span className="font-mono text-emerald-600 font-bold">+50.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '83%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Learning &amp; Resources</span>
                <span className="font-mono text-emerald-600 font-bold">+45.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Task Completion</span>
                <span className="font-mono text-emerald-600 font-bold">+40.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '66%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* What This Means */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900">What This Means</h4>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Stronger task ownership and timely delivery</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Better quality of work with fewer reworks</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Active learning and resource completion</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Faster resolution of dependencies &amp; blockers</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Higher confidence and positive manager feedback</span>
            </div>
          </div>
        </div>

        {/* What We DO NOT Use */}
        <div className="bg-rose-50/40 p-5 rounded-3xl border border-rose-200/70 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-extrabold text-xs text-rose-800 uppercase tracking-wider font-mono">
              What We DO NOT Use for Performance
            </h4>
            <p className="text-[11px] text-slate-500">
              No surveillance or activity metrics used for scoring
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-white rounded-xl border border-rose-100">
              <p className="text-[10px] font-bold text-slate-800">Login / Screen Time</p>
              <span className="text-rose-500 font-bold text-xs">✕</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-rose-100">
              <p className="text-[10px] font-bold text-slate-800">Work Speed Rush</p>
              <span className="text-rose-500 font-bold text-xs">✕</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-rose-100">
              <p className="text-[10px] font-bold text-slate-800">Mouse Tracking</p>
              <span className="text-rose-500 font-bold text-xs">✕</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-rose-100">
              <p className="text-[10px] font-bold text-slate-800">Hours Online</p>
              <span className="text-rose-500 font-bold text-xs">✕</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono text-center">
            OnboardOS measures real outcome readiness.
          </p>
        </div>
      </div>
    </div>
  );
};
