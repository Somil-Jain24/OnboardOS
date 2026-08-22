import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  Search,
  Loader2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
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
      (log.actorName && log.actorName.toLowerCase().includes(search.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase())) ||
      (log.result && log.result.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const getActionStatus = (action: string) => {
    if (action.includes('FAILED') || action.includes('ERROR')) return 'failed' as const;
    if (action.includes('COMPLETED') || action.includes('APPROVED') || action.includes('DISPATCHED'))
      return 'completed' as const;
    if (action.includes('GENERATED') || action.includes('REQUESTED'))
      return 'pending' as const;
    return 'ready' as const;
  };

  const getAutomationLabel = (reason: string = '', action: string = '') => {
    const text = (reason + ' ' + action).toLowerCase();
    if (text.includes('day-1') || text.includes('day_one')) return 'Day-1 Ready automation dispatched';
    if (text.includes('recovery') || text.includes('retry')) return 'Recovery automation dispatched';
    if (text.includes('incident') || text.includes('failed') || text.includes('escalation')) return 'IT incident escalation dispatched';
    if (text.includes('approval') || text.includes('signoff') || text.includes('manager')) return 'Approval reminder dispatched';
    return 'Slack + tracker dispatched';
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Lifecycle Audit Timeline"
        description="Tamper-evident append-only event stream recording all rule evaluations, AI plan generations, adapter transitions, human approvals, and ViaSocket automations."
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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by actor, action, reason..."
            className="w-full h-10 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="h-10 px-3.5 text-xs bg-white border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto shadow-xs cursor-pointer"
        >
          <option value="ALL">All Actions</option>
          <option value="VIASOCKET_AUTOMATION_DISPATCHED">ViaSocket Automations</option>
          <option value="TASK_FAILED">Task Failures</option>
          <option value="TASK_COMPLETED">Task Completions</option>
          <option value="PLAN_GENERATED">Plan Generation</option>
          <option value="APPROVAL_REQUESTED">Approval Requests</option>
        </select>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading compliance audit trail...</span>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {filteredLogs.map((log) => {
            const isAutomation = log.action.startsWith('VIASOCKET_');
            const status = getActionStatus(log.action);

            return (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                    status === 'failed'
                      ? 'bg-rose-500 animate-pulse'
                      : status === 'completed'
                      ? isAutomation ? 'bg-indigo-600' : 'bg-emerald-500'
                      : 'bg-blue-600'
                  }`}
                />

                <div
                  className={`p-5 border rounded-3xl shadow-card space-y-3 transition-all ${
                    isAutomation
                      ? 'bg-indigo-50/40 border-indigo-200/80 hover:bg-indigo-50/70'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAutomation ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                          <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{getAutomationLabel(log.reason, log.action)}</span>
                        </div>
                      ) : (
                        <StatusBadge status={status} label={log.action} size="sm" />
                      )}
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        Actor: {log.actorName || 'System'} ({log.actorRole || 'ADMIN'})
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1.5">
                    {log.reason && (
                      <p>
                        <strong className="text-slate-900 font-semibold">
                          {isAutomation ? 'Automation Evidence:' : 'Trigger / Rationale:'}
                        </strong>{' '}
                        {log.reason}
                      </p>
                    )}
                    {log.result && (
                      <p className="text-slate-600 text-xs">
                        <strong className="text-slate-800 font-semibold">Delivery Status:</strong>{' '}
                        <span className={log.result === 'SUCCESS' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {log.result}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Target: {log.entityType} ({log.entityId})</span>
                    <span>Audit ID: {log.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TimelinePage;
