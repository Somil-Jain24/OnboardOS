import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Shield,
  ArrowRight,
  Loader2,
  Sparkles,
  RefreshCw,
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-xs">Loading simulation sandbox...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <span>What-If Access Simulation (FR-SIM-*)</span>
                <Badge variant="purple" dot>
                  Predictive Engine
                </Badge>
              </div>
              <span className="text-xs font-normal text-slate-400 block mt-0.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Simulation Parameter Adjusters */}
        <Card className="lg:col-span-5 space-y-4 p-5 bg-slate-900/90 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              Hypothetical Context Adjustments
            </h3>
            {isSimulating && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
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

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Real-time delta computed against Ruleset v1.0.0</span>
          </div>
        </Card>

        {/* Right Column: Dynamic Entitlement & Risk Diff */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Delta Summary Metric Badges */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-slate-900/80 border-emerald-500/30">
              <span className="text-xs text-slate-400 block font-mono">Predicted Risk Delta</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-emerald-400">-25 pts</span>
                <Badge variant="success" size="sm" icon={<TrendingDown className="w-3 h-3" />}>
                  Risk: Low (20)
                </Badge>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Seniority resolves cloud approval gating friction
              </span>
            </Card>

            <Card className="p-4 bg-slate-900/80 border-blue-500/30">
              <span className="text-xs text-slate-400 block font-mono">Predicted Readiness Delta</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-blue-400">+25%</span>
                <Badge variant="info" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                  Ready: 90%
                </Badge>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Pre-authorized staging & prod deploy pipelines
              </span>
            </Card>
          </div>

          {/* Access Added & Removed Diff Card */}
          <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Entitlement Diff Breakdown
            </h4>

            {/* Access Added */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>New Entitlements Auto-Added ({diff?.accessAdded.length || 2})</span>
              </div>
              <div className="space-y-1.5">
                {diff?.accessAdded.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex justify-between items-start"
                  >
                    <div>
                      <span className="font-semibold text-slate-100">{item.name}</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{item.reason}</p>
                    </div>
                    <Badge variant="success" size="sm">
                      {item.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Chain Deltas */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Approval Gate Changes</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                AWS Production Cloud Access: <strong>Approval Gate Lifted</strong>. Senior software engineers are pre-authorized for staging and production deploy pipelines without manual manager ticket gates.
              </div>
            </div>

            {/* Unchanged Entitlements */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block">
                Preserved Entitlements (Unchanged)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {diff?.accessUnchanged.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
