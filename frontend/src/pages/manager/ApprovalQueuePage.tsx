import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useApprovals } from '../../hooks/useOnboardOS';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Shield,
  AlertTriangle,
  Loader2,
  Inbox,
} from 'lucide-react';
import type { Approval, ApprovalStatus } from '../../types';

export function ApprovalQueuePage() {
  const { approvals, loading, respond } = useApprovals();
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'MANAGER' | 'SECURITY' | 'ADMIN'>('ALL');
  const [actionNote, setActionNote] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{
    approval: Approval;
    type: 'APPROVE' | 'REJECT' | 'MORE_INFO';
  } | null>(null);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs">Loading approval requests...</span>
      </div>
    );
  }

  const filteredApprovals =
    selectedRole === 'ALL'
      ? approvals
      : approvals.filter((a) => a.approverRole === selectedRole);

  const pendingApprovals = filteredApprovals.filter((a) => a.status === 'PENDING');
  const resolvedApprovals = filteredApprovals.filter((a) => a.status !== 'PENDING');

  const handleConfirmAction = async () => {
    if (!activeModal) return;
    setActioningId(activeModal.approval.id);
    try {
      const statusMap: Record<'APPROVE' | 'REJECT' | 'MORE_INFO', 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUESTED'> = {
        APPROVE: 'APPROVED',
        REJECT: 'REJECTED',
        MORE_INFO: 'MORE_INFO_REQUESTED',
      };
      await respond(activeModal.approval.id, statusMap[activeModal.type], actionNote);
      setActiveModal(null);
      setActionNote('');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Approval Queue"
        description="Review and authorize least-privilege security gates, production access requests, and role deviations with SLA tracking."
        badge={
          <Badge variant={pendingApprovals.length > 0 ? 'warning' : 'success'} dot>
            {pendingApprovals.length} Pending Actions
          </Badge>
        }
      />

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'MANAGER', 'SECURITY', 'ADMIN'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${selectedRole === role
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            {role === 'ALL' ? 'All Roles' : `${role} Queue`}
          </button>
        ))}
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Pending Approvals Awaiting Decision ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3 bg-white border border-slate-200 rounded-3xl shadow-card">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No pending approvals</h4>
            <p className="text-xs max-w-sm mx-auto text-slate-500">All automated gating policies and manager requests are up to date.</p>
          </div>
        ) : (
          pendingApprovals.map((appr) => (
            <div
              key={appr.id}
              className="p-6 bg-white border border-amber-200 rounded-3xl shadow-card hover:border-amber-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name={appr.employeeName} size="md" status="busy" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{appr.taskName}</h4>
                      <Badge variant="warning" size="sm" dot>
                        SLA: 3h 45m Remaining
                      </Badge>
                      <Badge variant="danger" size="sm">
                        High Risk
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested for <strong className="text-slate-800 font-semibold">{appr.employeeName}</strong> • Assigned Approver Role:{' '}
                      <span className="font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">{appr.approverRole}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveModal({ approval: appr, type: 'MORE_INFO' })}
                    leftIcon={<HelpCircle className="w-3.5 h-3.5 text-slate-600" />}
                  >
                    Request Info
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setActiveModal({ approval: appr, type: 'REJECT' })}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveModal({ approval: appr, type: 'APPROVE' })}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  >
                    Approve Access
                  </Button>
                </div>
              </div>

              {/* Justification Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Policy Requirement Context:</span>
                  <span className="font-mono text-slate-400 text-xs">
                    Requested: {new Date(appr.requestedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{appr.reason}</p>
                <div className="pt-1 text-xs text-amber-900 flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>
                    Deterministic policy rule: Junior software engineers require Manager signoff before production IAM privileges activate.
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Approvals History */}
      {resolvedApprovals.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Recent Decisions Ledger ({resolvedApprovals.length})
          </h3>
          <div className="space-y-2.5">
            {resolvedApprovals.map((appr) => (
              <div key={appr.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-card flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center gap-3">
                  {appr.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <div>
                    <span className="font-bold text-slate-900">{appr.taskName}</span>
                    <span className="text-slate-500 block text-xs mt-0.5">
                      For {appr.employeeName} • Responded by {appr.approverUserName || 'Marcus Vance'}
                    </span>
                  </div>
                </div>
                <StatusBadge
                  status={appr.status === 'APPROVED' ? 'completed' : 'blocked'}
                  label={appr.status}
                  size="sm"
                  className="flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h4 className="text-base font-bold text-slate-900">
              {activeModal.type === 'APPROVE'
                ? 'Confirm Access Approval'
                : activeModal.type === 'REJECT'
                  ? 'Confirm Access Rejection'
                  : 'Request More Information'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeModal.type === 'APPROVE'
                ? `You are granting production privilege access for ${activeModal.approval.employeeName}. This action will unlock downstream DAG tasks immediately.`
                : 'Please provide a documented rationale for this decision.'}
            </p>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Optional notes or condition requirements..."
              className="w-full h-24 p-3 text-xs md:text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button size="sm" variant="secondary" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={activeModal.type === 'REJECT' ? 'destructive' : 'primary'}
                isLoading={actioningId === activeModal.approval.id}
                onClick={handleConfirmAction}
              >
                Confirm {activeModal.type}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

