import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useExceptions } from '../../hooks/useOnboardOS';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Inbox,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ExceptionCenterPage() {
  const { exceptions, loading, resolve, refetch } = useExceptions();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-xs">Loading Exception Center...</span>
      </div>
    );
  }

  const filteredExceptions =
    selectedSeverity === 'ALL'
      ? exceptions
      : exceptions.filter((e) => e.severity === selectedSeverity);

  const activeExceptions = filteredExceptions.filter((e) => e.severity !== 'RESOLVED');

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolve(id, 'Resolved manually via Exception Center');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exception Center (FR-FAIL-04)"
        description="Centralized triage for automated adapter failures, rate limits, network timeouts, and downstream dependency blockers."
        badge={
          <Badge variant={activeExceptions.length > 0 ? 'danger' : 'success'} dot>
            {activeExceptions.length} Active Incidents
          </Badge>
        }
      />

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'CRITICAL', 'HIGH', 'RESOLVED'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              selectedSeverity === sev
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sev === 'ALL' ? 'All Incidents' : sev}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {activeExceptions.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">All Systems Operational</h4>
            <p className="text-xs max-w-sm mx-auto">
              No provisioning exceptions, adapter timeouts, or blocked workflows detected.
            </p>
          </Card>
        ) : (
          activeExceptions.map((ex) => (
            <Card
              key={ex.id}
              className="p-5 bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5 animate-pulse">
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100">{ex.title}</h4>
                      <Badge variant="danger" size="sm" dot>
                        {ex.severity}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Impacted Employee: <strong className="text-slate-200">{ex.employeeName}</strong> • Task:{' '}
                      <span className="font-mono text-slate-300">{ex.taskName}</span> • Detected:{' '}
                      <span className="font-mono text-slate-400">
                        {new Date(ex.createdAt).toLocaleTimeString()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link to={`/employees/${ex.employeeId}/provisioning`}>
                    <Button
                      size="sm"
                      variant="destructive"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Retry Adapter
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={resolvingId === ex.id}
                    onClick={() => handleResolve(ex.id)}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>

              {/* Error Detail & Impact */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300">
                  <strong className="text-rose-400">Description:</strong> {ex.description}
                </p>
                {ex.impactSummary && (
                  <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-200 text-[11px] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Cascading Impact: {ex.impactSummary}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
