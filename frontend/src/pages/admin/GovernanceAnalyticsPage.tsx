import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { client } from '../../services';
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  DollarSign,
  Zap,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Day-1 Access Readiness"
          value={`${data.day1ReadinessRate}%`}
          subtitle="Employees equipped on hour 1"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconColor="emerald"
        />

        <StatCard
          title="Median Onboarding Duration"
          value={`${data.medianOnboardingDays} Days`}
          subtitle="Down from 14.5 days baseline"
          icon={<Clock className="w-5 h-5" />}
          iconColor="blue"
        />

        <StatCard
          title="Avg Request Approval SLA"
          value={`${data.accessRequestAverageHours}h`}
          subtitle="Multi-stage SLA compliance"
          icon={<Zap className="w-5 h-5" />}
          iconColor="amber"
        />

        <StatCard
          title="Monthly License Reclaims"
          value={`$${data.monthlyLicenseSavingsUsd}`}
          subtitle={`$${data.monthlyLicenseSavingsUsd * 12}/yr recovered`}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="emerald"
        />
      </div>

      {/* Security Governance Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
          <h4 className="font-bold text-slate-900 text-sm">Standing Privileges</h4>
          <p className="text-3xl font-bold text-purple-600 font-mono">{data.standingPrivilegeCount}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            96% of engineers operate exclusively through ephemeral Just-In-Time sessions.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
          <h4 className="font-bold text-slate-900 text-sm">SoD Conflicts Blocked</h4>
          <p className="text-3xl font-bold text-rose-600 font-mono">{data.sodConflictsPrevented}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Toxic combinations stopped at request time by proactive guardrail policies.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
          <h4 className="font-bold text-slate-900 text-sm">Access Review Completion</h4>
          <p className="text-3xl font-bold text-emerald-600 font-mono">{data.reviewCompletionRate}%</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quarterly certification compliance rate across managers and application owners.
          </p>
        </div>
      </div>
    </div>
  );
}

