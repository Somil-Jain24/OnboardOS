import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  RefreshCw,
  GitCompare,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Server,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            onClick={handleRunReconciliation}
            disabled={reconciling}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${reconciling ? 'animate-spin' : ''}`} />
            Run Reconciliation Scan
          </Button>
        }
      />

      {/* Connected Authoritative Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((src) => (
          <Card key={src.id} className="p-4 bg-slate-900/80 border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-blue-400 font-bold">{src.type}</span>
              <Badge
                variant={src.status === 'HEALTHY' ? 'default' : 'warning'}
                size="sm"
              >
                {src.status}
              </Badge>
            </div>
            <h4 className="font-semibold text-slate-100 text-sm">{src.name}</h4>
            <div className="text-xs text-slate-400 flex justify-between font-mono pt-2 border-t border-slate-800">
              <span>{src.accountCount} Accounts Synced</span>
              <span>{src.isAuthoritative ? 'Authoritative Master' : 'Downstream Target'}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Reconciliation Drift Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider font-mono flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-blue-400" />
            Detected Attribute Discrepancies ({mismatches.filter((m) => m.status === 'UNRESOLVED').length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time HR Drift</span>
        </div>

        <div className="space-y-3">
          {mismatches.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800">
              Zero attribute mismatches detected across systems.
            </Card>
          ) : (
            mismatches.map((mis) => {
              const isResolved = mis.status === 'AUTO_REMEDIATED';

              return (
                <Card
                  key={mis.id}
                  className={`p-5 border transition-all ${
                    isResolved ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900/80 border-amber-500/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{mis.employeeName}</span>
                        <Badge variant="outline" size="sm" className="text-slate-300 font-mono">
                          Attribute: {mis.attribute}
                        </Badge>
                        <Badge variant={isResolved ? 'default' : 'warning'} size="sm">
                          {mis.status}
                        </Badge>
                      </div>

                      {/* Diff Comparison Bar */}
                      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-emerald-400 font-mono">
                          <strong>Authoritative (Workday):</strong> "{mis.authoritativeValue}"
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                        <div className="text-amber-400 font-mono">
                          <strong>{mis.targetSystem}:</strong> "{mis.targetSystemValue}"
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        Recommendation: {mis.recommendedAction}
                      </p>
                    </div>

                    {!isResolved && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleResolveMismatch(mis.id, 'AUTO_REMEDIATE')}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Push Authoritative Sync
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveMismatch(mis.id, 'IGNORE')}
                          className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs h-8"
                        >
                          Ignore
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
