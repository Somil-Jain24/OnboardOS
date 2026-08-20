import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { client } from '../../services';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react';
import type { GovernanceAnalyticsData } from '../../types';

export function GovernanceAnalyticsPage() {
  const [data, setData] = useState<GovernanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await client.getGovernanceAnalytics();
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Identity Governance Executive Analytics"
        description="Unified KPI dashboard measuring Day-1 onboarding access readiness, approval turnarounds, standing privilege reduction, and license spend savings."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Executive Metrics</Badge>
            <Badge variant="purple">P2-30</Badge>
          </div>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Day-1 Access Readiness</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-emerald-400 font-mono">{data.day1ReadinessRate}%</h3>
          <p className="text-[11px] text-slate-500">Employees equipped on hour 1</p>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Median Onboarding Duration</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-3xl font-bold text-blue-400 font-mono">{data.medianOnboardingDays} Days</h3>
          <p className="text-[11px] text-slate-500">Down from 14.5 days baseline</p>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg Request Approval SLA</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-3xl font-bold text-amber-400 font-mono">{data.accessRequestAverageHours}h</h3>
          <p className="text-[11px] text-slate-500">Multi-stage SLA compliance</p>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Monthly License Reclaims</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-emerald-400 font-mono">${data.monthlyLicenseSavingsUsd}</h3>
          <p className="text-[11px] text-slate-500">${data.monthlyLicenseSavingsUsd * 12}/yr recovered</p>
        </Card>
      </div>

      {/* Security Governance Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-100 text-sm">Standing Privileges</h4>
          <p className="text-2xl font-bold text-purple-400 font-mono">{data.standingPrivilegeCount}</p>
          <p className="text-xs text-slate-400">
            96% of engineers operate exclusively through ephemeral Just-In-Time sessions.
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-100 text-sm">SoD Conflicts Blocked</h4>
          <p className="text-2xl font-bold text-rose-400 font-mono">{data.sodConflictsPrevented}</p>
          <p className="text-xs text-slate-400">
            Toxic combinations stopped at request time by proactive guardrail policies.
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
          <h4 className="font-semibold text-slate-100 text-sm">Access Review Completion</h4>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{data.reviewCompletionRate}%</p>
          <p className="text-xs text-slate-400">
            Quarterly certification compliance rate across managers and application owners.
          </p>
        </Card>
      </div>
    </div>
  );
}
