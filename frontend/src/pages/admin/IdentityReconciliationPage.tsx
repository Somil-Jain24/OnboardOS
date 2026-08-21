import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  RefreshCw,
  GitCompare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { IdentitySource, ReconciliationMismatch } from '../../types';

export function IdentityReconciliationPage() {
  const [sources, setSources] = useState<IdentitySource[]>([]);
  const [mismatches, setMismatches] = useState<ReconciliationMismatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sourcesData, mismatchesData] = await Promise.all([
        client.getIdentitySources(),
        client.getReconciliationMismatches(),
      ]);
      setSources(sourcesData);
      setMismatches(mismatchesData);
    } finally {
      setLoading(false);
    }
  }

  const handleRunReconciliation = async () => {
    try {
      setReconciling(true);
      const res = await client.runIdentityReconciliation();
      setMismatches(res.mismatches);
    } finally {
      setReconciling(false);
    }
  };

  const handleResolveMismatch = async (id: string, action: 'AUTO_REMEDIATE' | 'IGNORE') => {
    await client.resolveReconciliationMismatch(id, action);
    await loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Identity Source & Reconciliation Center"
        description="Continuously reconcile authoritative HRMS records (Workday) with downstream Identity Providers (Okta, Microsoft Entra) to detect attribute drift."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Reconciliation Online</Badge>
            <Badge variant="purple">P1-21</Badge>
          </div>
        }
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={handleRunReconciliation}
            disabled={reconciling}
            className="rounded-xl text-xs"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${reconciling ? 'animate-spin' : ''}`} />
            Run Reconciliation Scan
          </Button>
        }
      />

      {/* Connected Authoritative Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sources.map((src) => (
          <div key={src.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-blue-600 font-bold">{src.type}</span>
              <StatusBadge
                status={src.status === 'HEALTHY' ? 'completed' : 'warning'}
                label={src.status}
                size="sm"
              />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{src.name}</h4>
            <div className="text-xs text-slate-500 flex justify-between font-mono pt-3 border-t border-slate-100">
              <span>{src.accountCount} Accounts Synced</span>
              <span className="font-semibold text-slate-700">{src.isAuthoritative ? 'Authoritative Master' : 'Downstream Target'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation Drift Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-blue-600" />
            Detected Attribute Discrepancies ({mismatches.filter((m) => m.status === 'UNRESOLVED').length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time HR Drift</span>
        </div>

        <div className="space-y-3">
          {mismatches.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-slate-200/90 rounded-3xl shadow-card">
              Zero attribute mismatches detected across systems.
            </div>
          ) : (
            mismatches.map((mis) => {
              const isResolved = mis.status === 'AUTO_REMEDIATED';

              return (
                <div
                  key={mis.id}
                  className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-3 ${
                    isResolved ? 'border-slate-200 opacity-70' : 'border-amber-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{mis.employeeName}</span>
                        <Badge variant="secondary" size="sm" className="font-mono">
                          Attribute: {mis.attribute}
                        </Badge>
                        <StatusBadge status={isResolved ? 'completed' : 'warning'} label={mis.status} size="sm" />
                      </div>

                      {/* Diff Comparison Bar */}
                      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="text-emerald-700 font-mono">
                          <strong>Authoritative (Workday):</strong> "{mis.authoritativeValue}"
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="text-amber-800 font-mono">
                          <strong>{mis.targetSystem}:</strong> "{mis.targetSystemValue}"
                        </div>
                      </div>

                      <p className="text-xs text-slate-500">
                        Recommendation: {mis.recommendedAction}
                      </p>
                    </div>

                    {!isResolved && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleResolveMismatch(mis.id, 'AUTO_REMEDIATE')}
                          className="rounded-xl text-xs h-8"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Push Authoritative Sync
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleResolveMismatch(mis.id, 'IGNORE')}
                          className="rounded-xl text-xs h-8"
                        >
                          Ignore
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

