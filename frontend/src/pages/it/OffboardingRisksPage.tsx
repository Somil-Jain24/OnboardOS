import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { OffboardingRiskFlag } from '../../types';

export function OffboardingRisksPage() {
  const [risks, setRisks] = useState<OffboardingRiskFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getOffboardingRisks();
        setRisks(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await client.resolveOffboardingRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Offboarding Security Risk Detection"
        description="Automated drift detection identifying residual permissions, active OAuth grants, and orphaned credentials on exited employee accounts."
        badge={
          <Badge variant={risks.length > 0 ? 'danger' : 'success'} dot>
            {risks.length} Residual Access Risks
          </Badge>
        }
      />

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : risks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-card">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900">Zero Residual Access Drift Detected</h4>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              All departed employee OAuth tokens, IAM keys, and team permissions have been fully deprovisioned.
            </p>
          </div>
        ) : (
          risks.map((r) => (
            <div
              key={r.id}
              className="p-6 bg-white border border-rose-200 rounded-3xl shadow-card hover:border-rose-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs md:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex-shrink-0 animate-pulse">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900">{r.employeeName}</h4>
                      <StatusBadge status="blocked" label={`${r.severity} Risk`} size="sm" showIcon />
                      <span className="text-slate-500 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">System: {r.system}</span>
                    </div>
                    <p className="text-slate-700 text-xs mt-1.5 leading-relaxed">{r.description}</p>
                    <span className="text-xs text-slate-400 font-mono mt-1 block">
                      Detected: {new Date(r.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  isLoading={resolvingId === r.id}
                  onClick={() => handleResolve(r.id)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="rounded-xl flex-shrink-0 self-end sm:self-center"
                >
                  Force Revoke Access
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

