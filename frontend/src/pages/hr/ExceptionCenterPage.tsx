import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useExceptions } from '../../hooks/useOnboardOS';
import {
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ExceptionCenterPage() {
  const { exceptions, loading, resolve } = useExceptions();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
    <div className="space-y-6 text-left">
      <PageHeader
        title="Exception Center"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedSeverity === sev
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {sev === 'ALL' ? 'All Incidents' : sev}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {activeExceptions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-card">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900">All Systems Operational</h4>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              No provisioning exceptions, adapter timeouts, or blocked workflows detected.
            </p>
          </div>
        ) : (
          activeExceptions.map((ex) => (
            <div
              key={ex.id}
              className="p-6 bg-white border border-rose-200 rounded-3xl shadow-card hover:border-rose-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mt-0.5 animate-pulse flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                      <StatusBadge status="blocked" label={ex.severity} size="sm" showIcon />
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Impacted Employee: <strong className="text-slate-800 font-semibold">{ex.employeeName}</strong> • Task:{' '}
                      <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">{ex.taskName}</span> • Detected:{' '}
                      <span className="font-mono text-slate-500">
                        {new Date(ex.createdAt).toLocaleTimeString()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
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
                    variant="secondary"
                    isLoading={resolvingId === ex.id}
                    onClick={() => handleResolve(ex.id)}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>

              {/* Error Detail & Impact */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-rose-700 font-bold">Description:</strong> {ex.description}
                </p>
                {ex.impactSummary && (
                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 font-medium">
                    <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Cascading Impact: {ex.impactSummary}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

