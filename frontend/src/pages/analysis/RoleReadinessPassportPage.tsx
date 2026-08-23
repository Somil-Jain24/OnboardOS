import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Gamepad2,
  Target,
  BookOpen,
  Download,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Star,
  Zap,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import { ANALYSIS_EMPLOYEES } from './analysisData';
import { EmployeeAnalysisSelector } from './EmployeeAnalysisSelector';

export const RoleReadinessPassportPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string>('rahul');
  const [downloading, setDownloading] = useState(false);

  const currentEmp = ANALYSIS_EMPLOYEES[selectedKey] || ANALYSIS_EMPLOYEES['rahul'];

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 800);
  };

  const avgSimulationScore = currentEmp.simulations.length > 0
    ? Math.round(currentEmp.simulations.reduce((a, b) => a + b.score, 0) / currentEmp.simulations.length)
    : 80;

  const scoreFraction = Math.min(1, Math.max(0, currentEmp.overallScore / 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Role Readiness Passport
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-11">
            Your verified capabilities, real simulation performance and growth roadmap.
          </p>
        </div>

        {/* Employee Switcher with Search */}
        <div className="flex flex-wrap items-center gap-3">
          <EmployeeAnalysisSelector selectedKey={selectedKey} onSelect={setSelectedKey} />

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Export Passport PDF'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Employee Passport Snapshot Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Profile Card */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black font-mono shadow-md shadow-blue-500/25 flex-shrink-0">
              {currentEmp.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs font-black">
              ✓
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="font-black text-lg text-slate-900 truncate">{currentEmp.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{currentEmp.role}</p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>{currentEmp.id}</span>
              <span>•</span>
              <span>Joined: {currentEmp.joined}</span>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
              {currentEmp.status}
            </span>
          </div>
        </div>

        {/* Circular Gauge Score */}
        <div className="md:col-span-3 flex items-center justify-center py-2">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Overall Role Readiness Score
            </span>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={currentEmp.overallScore >= 75 ? '#10b981' : currentEmp.overallScore >= 60 ? '#f59e0b' : '#e11d48'}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - scoreFraction)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">{currentEmp.overallScore}</span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">/100</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">(Outcome Based)</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="md:col-span-3 space-y-1.5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Status</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{currentEmp.readinessStatus}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {currentEmp.isLowPerformance
              ? 'Intervention active. Target adjustment in progress.'
              : 'You are ready to take on tasks independently with minimal supervision.'}
          </p>
        </div>

        {/* Readiness Level */}
        <div className="md:col-span-2 space-y-1 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Readiness Level</span>
          <div className="flex items-center gap-1 text-emerald-700 font-black text-sm">
            <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            <span>{currentEmp.readinessLevel.split(' ')[0]}</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 font-semibold">{currentEmp.readinessLevel}</p>
          <p className="text-[10px] text-slate-400">Aim for excellence!</p>
        </div>
      </div>

      {/* 3 Main Passport Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Verified Skills (Outcome Based) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Verified Skills (Outcome Based)</h3>
            </div>
            <p className="text-xs text-slate-500">Skills backed by real artifacts &amp; evaluations</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2">Skill / Competency</th>
                  <th className="px-2 py-2 text-center">Proficiency</th>
                  <th className="px-3 py-2 text-right">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentEmp.skills.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <span>{s.icon}</span>
                      <span className="truncate max-w-[120px]">{s.name}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-emerald-500 text-xs">★★★★</span>
                        <span className="font-mono text-[10px] font-bold text-slate-700">{s.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[10px] text-slate-500 truncate max-w-[100px]">
                      {s.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-100">
            <span>★★★★★ Expert</span>
            <span>★★★★ Proficient</span>
            <span>★★★ Developing</span>
            <span>★★ Needs Improvement</span>
          </div>
        </div>

        {/* 2. Simulation Results */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Simulation Results</h3>
            </div>
            <p className="text-xs text-slate-500">Practical sandbox and production scenarios</p>
          </div>

          {/* Top Simulation Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 bg-purple-50/40 rounded-2xl border border-purple-100">
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Completed</span>
              <p className="text-base font-black text-purple-900">{currentEmp.simulations.length}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Avg Score</span>
              <p className="text-base font-black text-purple-900">{avgSimulationScore}%</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Success Rate</span>
              <p className="text-base font-black text-emerald-600">{avgSimulationScore > 75 ? '85%' : '65%'}</p>
            </div>
          </div>

          {/* Individual Simulation Bars */}
          <div className="space-y-2.5 flex-1">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              Recent Simulation Performance
            </span>
            {currentEmp.simulations.map((sim, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium text-slate-700 text-[11px]">
                  <span className="truncate max-w-[200px]">{sim.name}</span>
                  <span className="font-mono font-bold text-emerald-600">{sim.score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${sim.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 text-[10px] text-blue-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>Simulation results are based on real-world scenarios and practical application.</span>
          </div>
        </div>

        {/* 3. Remaining Gaps */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Remaining Gaps</h3>
            </div>
            <p className="text-xs text-slate-500">Identified areas for next growth cycle</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-2">Skill / Area</th>
                  <th className="px-2 py-2 text-center">Current</th>
                  <th className="px-2 py-2 text-center">Target</th>
                  <th className="px-2 py-2 text-center">Gap</th>
                  <th className="px-2 py-2 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentEmp.gaps.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 text-[11px]">
                    <td className="px-3 py-2.5 font-bold text-slate-800 truncate max-w-[120px]">
                      {g.name}
                    </td>
                    <td className="px-2 py-2.5 text-center font-mono text-slate-600">
                      {g.current}/5
                    </td>
                    <td className="px-2 py-2.5 text-center font-mono text-slate-600">
                      {g.target}/5
                    </td>
                    <td className="px-2 py-2.5 text-center font-mono font-bold text-rose-600">
                      {g.gap}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold font-mono border', g.color)}>
                        {g.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-start gap-2 text-xs text-amber-950">
            <span className="text-amber-600 font-bold">💡</span>
            <p className="text-[11px] leading-snug">
              Focus on these gaps to become fully role ready and take on complex, high-impact projects.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Roadmap, Takeaways, What This Means */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Personalized Growth Roadmap */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h4 className="font-extrabold text-sm text-slate-900">Personalized Growth Roadmap</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            {currentEmp.roadmap.map((item) => (
              <div key={item.num} className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.num}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="font-extrabold text-xs text-slate-900 truncate">{item.title}</h5>
                    <span className="text-[10px] font-mono font-bold text-purple-600">{item.priority}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                  <p className="text-[10px] font-mono text-slate-400">By {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-slate-900">Key Takeaways</h4>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Strong in core development, problem solving and API integration</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Good quality of work with timely delivery</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Consistent onboarding progress and active learning</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Focus on system design &amp; optimization to reach next level</span>
            </div>
          </div>
        </div>

        {/* What This Means */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h4 className="font-extrabold text-sm text-slate-900">What This Means</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This passport reflects your outcome-based performance throughout onboarding — <strong>not your screen time</strong>.
            </p>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">📋</span>
                <span>Verified skills with evidence</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">⚙️</span>
                <span>Practical simulation performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">🎯</span>
                <span>Clear roadmap for continuous improvement</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <span className="text-xs font-black text-emerald-700 block">You are ready. Keep growing!</span>
          </div>
        </div>
      </div>

      {/* Bottom Guarantee Banner */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>OnboardOS evaluates employees based on outcomes, quality, timeliness, onboarding progress and blockers — not simply screen time or online hours.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 font-bold hidden sm:inline">Role View: {currentRole}</span>
      </div>
    </div>
  );
};
