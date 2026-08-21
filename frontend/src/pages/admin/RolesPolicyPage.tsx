import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { client } from '../../services';
import { Shield, Loader2 } from 'lucide-react';
import type { RequirementRule } from '../../types';

export function RolesPolicyPage() {
  const [rules, setRules] = useState<RequirementRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getRules();
        setRules(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Rules Engine & Access Governance"
        description="Authoritative, versioned requirement policy rules that govern least-privilege entitlements, approval gates, and AI recommendation boundaries."
        badge={<Badge variant="default" dot>Policy Ruleset v1.0.0 Active</Badge>}
      />

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-slate-400 font-bold">{rule.id}</span>
                      <h4 className="font-bold text-sm text-slate-900">{rule.requirementName}</h4>
                      <StatusBadge
                        status={
                          rule.decision === 'REQUIRED'
                            ? 'completed'
                            : rule.decision === 'APPROVAL_REQUIRED'
                            ? 'warning'
                            : 'ready'
                        }
                        label={rule.decision}
                        size="sm"
                      />
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Category: {rule.category} • Risk: {rule.riskLevel} • Scope:{' '}
                      <code className="text-blue-700 bg-blue-50/70 px-1.5 py-0.5 rounded-md font-mono text-[11px]">
                        {JSON.stringify(rule.scope)}
                      </code>
                    </span>
                  </div>
                </div>

                <Badge variant="purple" size="sm">
                  v{rule.version}.0
                </Badge>
              </div>

              <p className="text-xs text-slate-600 pl-12 leading-relaxed">{rule.reasonTemplate}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

