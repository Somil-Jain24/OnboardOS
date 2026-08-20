import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import { Shield, Lock, Layers, CheckCircle2, Clock, Loader2 } from 'lucide-react';
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
    <div className="space-y-6">
      <PageHeader
        title="Rules Engine & Access Governance (v1.0.0)"
        description="Authoritative, versioned requirement policy rules that govern least-privilege entitlements, approval gates, and AI recommendation boundaries."
        badge={<Badge variant="default" dot>Policy Ruleset v1.0.0 Active</Badge>}
      />

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="p-4 bg-slate-900/80 border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{rule.id}</span>
                      <h4 className="font-semibold text-slate-100">{rule.requirementName}</h4>
                      <Badge
                        variant={
                          rule.decision === 'REQUIRED'
                            ? 'info'
                            : rule.decision === 'APPROVAL_REQUIRED'
                            ? 'warning'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {rule.decision}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Category: {rule.category} • Risk: {rule.riskLevel} • Scope:{' '}
                      <code className="text-slate-300 font-mono">
                        {JSON.stringify(rule.scope)}
                      </code>
                    </span>
                  </div>
                </div>

                <Badge variant="purple" size="sm">
                  v{rule.version}.0
                </Badge>
              </div>

              <p className="text-xs text-slate-300 pl-11">{rule.reasonTemplate}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
