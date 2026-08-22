import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  SlidersHorizontal,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Shield,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { WhatIfSimulationDiff, WhatIfSimulationInput } from '../../types';

export function WhatIfPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, loading } = useEmployee(id);

  const [simState, setSimState] = useState<WhatIfSimulationInput>({
    department: 'Engineering',
    roleTitle: 'Senior Backend Developer',
    team: 'Payments Core',
    seniority: 'SENIOR',
    location: 'Bengaluru, India (Hybrid)',
  });

  const [diff, setDiff] = useState<WhatIfSimulationDiff | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async (input: WhatIfSimulationInput) => {
    setIsSimulating(true);
    try {
      const res = await client.simulateWhatIf(id, input);
      setDiff(res);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation(simState);
  }, []);

  const handleFieldChange = (field: keyof WhatIfSimulationInput, val: any) => {
    const updated = { ...simState, [field]: val };
    setSimState(updated);
    runSimulation(updated);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs">Loading simulation sandbox...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={
          <div className="flex items-center gap-3.5">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status="online" />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-slate-900">What-If Access Simulation</span>
                <Badge variant="purple" dot>
                  Predictive Engine
                </Badge>
              </div>
              <span className="text-xs font-normal text-slate-500 block mt-0.5">
                Simulate role, seniority, or team changes and predict exact entitlement deltas, risk impact, and approval requirements.
              </span>
            </div>
          </div>
        }
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {/* 2-Column Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Parameter Adjusters */}
        <div className="lg:col-span-5 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Hypothetical Context Adjustments
            </h3>
            {isSimulating && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
          </div>

          <div className="space-y-4">
            <Select
              label="Simulated Seniority Band"
              value={simState.seniority || 'SENIOR'}
              onChange={(e) => handleFieldChange('seniority', e.target.value)}
              options={[
                { value: 'JUNIOR', label: 'Junior / Associate (L1) — Current' },
                { value: 'MID', label: 'Mid-Level (L2)' },
                { value: 'SENIOR', label: 'Senior (L3) — Promoted' },
                { value: 'LEAD', label: 'Staff / Tech Lead (L4)' },
              ]}
            />

            <Select
              label="Simulated Role Title"
              value={simState.roleTitle || 'Senior Backend Developer'}
              onChange={(e) => handleFieldChange('roleTitle', e.target.value)}
              options={[
                { value: 'Backend Developer', label: 'Backend Developer' },
                { value: 'Senior Backend Developer', label: 'Senior Backend Developer' },
                { value: 'DevOps / Platform Engineer', label: 'DevOps / Platform Engineer' },
                { value: 'Engineering Manager', label: 'Engineering Manager' },
              ]}
            />

            <Select
              label="Simulated Department"
              value={simState.department || 'Engineering'}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Security & Compliance', label: 'Security & Compliance' },
                { value: 'Product', label: 'Product' },
              ]}
            />

            <Select
              label="Simulated Team / Pod"
              value={simState.team || 'Payments Core'}
              onChange={(e) => handleFieldChange('team', e.target.value)}
              options={[
                { value: 'Payments Core', label: 'Payments Core' },
                { value: 'Platform Infrastructure', label: 'Platform Infrastructure' },
                { value: 'Security Architecture', label: 'Security Architecture' },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Real-time delta computed against Ruleset v1.0.0</span>
          </div>
        </div>

        {/* Right Column: Dynamic Entitlement & Risk Diff */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Delta Summary Metric Badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-emerald-200 rounded-3xl shadow-card space-y-1">
              <span className="text-xs text-slate-500 block font-mono font-semibold">Predicted Risk Delta</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-600">-25 pts</span>
                <Badge variant="success" size="sm" icon={<TrendingDown className="w-3 h-3" />}>
                  Risk: Low (20)
                </Badge>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Seniority resolves cloud approval gating friction
              </span>
            </div>

            <div className="p-5 bg-white border border-blue-200 rounded-3xl shadow-card space-y-1">
              <span className="text-xs text-slate-500 block font-mono font-semibold">Predicted Readiness Delta</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-blue-600">+25%</span>
                <Badge variant="info" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                  Ready: 90%
                </Badge>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Pre-authorized staging & prod deploy pipelines
              </span>
            </div>
          </div>

          {/* Access Added & Removed Diff Card */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Entitlement Diff Breakdown
            </h4>

            {/* Access Added */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>New Entitlements Auto-Added ({diff?.accessAdded.length || 2})</span>
              </div>
              <div className="space-y-2">
                {diff?.accessAdded.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs flex justify-between items-start"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <p className="text-slate-600 text-xs mt-0.5">{item.reason}</p>
                    </div>
                    <Badge variant="success" size="sm">
                      {item.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Chain Deltas */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Approval Gate Changes</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                AWS Production Cloud Access: <strong>Approval Gate Lifted</strong>. Senior software engineers are pre-authorized for staging and production deploy pipelines without manual manager ticket gates.
              </div>
            </div>

            {/* Predicted ViaSocket Automation Triggers (Preview Only) */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Predicted ViaSocket Automation Triggers (Simulation Preview)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                  Preview Only • No Webhooks Fired
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 border border-indigo-200 text-xs space-y-2.5">
                <p className="text-[11px] text-slate-600">
                  Applying this simulation will trigger the following automated lifecycle events:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-indigo-100">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold">
                      employee.created
                    </span>
                    <div className="text-[11px] text-slate-700">
                      Dispatches role update notification to <strong>#engineering</strong> on Slack and updates HR Master Google Sheet.
                    </div>
                  </div>

                  {simState.seniority === 'JUNIOR' && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-100">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
                        approval.requested
                      </span>
                      <div className="text-[11px] text-slate-700">
                        Dispatches interactive 1-click cloud signoff notification to manager on Slack.
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      onboarding.day_one_ready
                    </span>
                    <div className="text-[11px] text-slate-700">
                      Re-computes readiness index (predicted 90%) and schedules Day-1 onboarding celebration dispatch.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unchanged Entitlements */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block">
                Preserved Entitlements (Unchanged)
              </span>
              <div className="flex flex-wrap gap-2">
                {diff?.accessUnchanged.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

