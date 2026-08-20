import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Offboarding Security Risk Detection (FR-LIFE-03)"
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
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : risks.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 space-y-3 bg-slate-900/80 border-slate-800">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">Zero Residual Access Drift Detected</h4>
            <p className="text-xs max-w-sm mx-auto">
              All departed employee OAuth tokens, IAM keys, and team permissions have been fully deprovisioned.
            </p>
          </Card>
        ) : (
          risks.map((r) => (
            <Card
              key={r.id}
              className="p-5 bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100">{r.employeeName}</h4>
                      <Badge variant="danger" size="sm">
                        {r.severity} Risk
                      </Badge>
                      <span className="text-slate-400 font-mono">System: {r.system}</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1">{r.description}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
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
                >
                  Force Revoke Access
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
