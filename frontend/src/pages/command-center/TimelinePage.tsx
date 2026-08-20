import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { client } from '../../services';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  Clock,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  FileText,
  UserCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { AuditLog } from '../../types';

export function TimelinePage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee } = useEmployee(id);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await client.getAuditLogs(id);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [id]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase())) ||
      (log.result && log.result.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('FAILED')) return { label: action, variant: 'danger' as const };
    if (action.includes('COMPLETED') || action.includes('APPROVED'))
      return { label: action, variant: 'success' as const };
    if (action.includes('GENERATED') || action.includes('REQUESTED'))
      return { label: action, variant: 'info' as const };
    return { label: action, variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lifecycle Audit Timeline (FR-AUDIT-*)"
        description="Tamper-evident append-only event stream recording all rule evaluations, AI plan generations, adapter transitions, and human approvals."
        badge={<Badge variant="default" dot>Append-Only Compliance Ledger</Badge>}
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by actor, action, reason..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="ALL">All Actions</option>
          <option value="TASK_FAILED">Task Failures</option>
          <option value="TASK_COMPLETED">Task Completions</option>
          <option value="PLAN_GENERATED">Plan Generation</option>
          <option value="APPROVAL_REQUESTED">Approval Requests</option>
        </select>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">Loading compliance audit trail...</span>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);

            return (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                    badge.variant === 'danger'
                      ? 'bg-rose-500 animate-pulse'
                      : badge.variant === 'success'
                      ? 'bg-emerald-500'
                      : 'bg-blue-500'
                  }`}
                />

                <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={badge.variant} size="sm">
                        {log.action}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-200 font-mono">
                        Actor: {log.actorName} ({log.actorRole})
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    {log.reason && (
                      <p>
                        <strong className="text-slate-400">Trigger / Rationale:</strong> {log.reason}
                      </p>
                    )}
                    {log.result && (
                      <p className="text-slate-400 text-[11px]">
                        <strong className="text-slate-300">State Transition Result:</strong> {log.result}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Target Entity: {log.entityType} ({log.entityId})</span>
                    <span>Audit ID: {log.id}</span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
