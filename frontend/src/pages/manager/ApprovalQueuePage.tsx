import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
  User,
  Layers,
  ArrowRight,
  Loader2,
  Inbox,
  Sparkles,
} from 'lucide-react';
import type { Approval, ApprovalStatus } from '../../types';

export function ApprovalQueuePage() {
  const { approvals, loading, respond, refetch } = useApprovals();
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
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
    <div className="space-y-6">
      <PageHeader
        title="Approval Queue (FR-APR-*)"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              selectedRole === role
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {role === 'ALL' ? 'All Roles' : `${role} Queue`}
          </button>
        ))}
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Pending Approvals Awaiting Decision ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-200">No pending approvals</h4>
            <p className="text-xs">All automated gating policies and manager requests are up to date.</p>
          </Card>
        ) : (
          pendingApprovals.map((appr) => (
            <Card
              key={appr.id}
              className="p-5 bg-slate-900/90 border-amber-500/30 hover:border-amber-500/50 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={appr.employeeName} size="md" status="busy" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100">{appr.taskName}</h4>
                      <Badge variant="warning" size="sm" dot>
                        SLA: 3h 45m Remaining
                      </Badge>
                      <Badge variant="danger" size="sm">
                        High Risk
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Requested for <strong className="text-slate-200">{appr.employeeName}</strong> • Assigned Approver Role:{' '}
                      <span className="font-mono text-amber-300">{appr.approverRole}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveModal({ approval: appr, type: 'MORE_INFO' })}
                    leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
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
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve Access
                  </Button>
                </div>
              </div>

              {/* Justification Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Policy Requirement Context:</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    Requested: {new Date(appr.requestedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300">{appr.reason}</p>
                <div className="pt-1 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Deterministic policy rule: Junior software engineers require Manager signoff before production IAM privileges activate.
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Resolved Approvals History */}
      {resolvedApprovals.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Recent Decisions Ledger ({resolvedApprovals.length})
          </h3>
          <div className="space-y-2">
            {resolvedApprovals.map((appr) => (
              <Card key={appr.id} className="p-3.5 bg-slate-950/60 border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {appr.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">{appr.taskName}</span>
                    <span className="text-slate-400 block text-[11px]">
                      For {appr.employeeName} • Responded by {appr.approverUserName || 'Marcus Vance'}
                    </span>
                  </div>
                </div>
                <Badge variant={appr.status === 'APPROVED' ? 'success' : 'danger'} size="sm">
                  {appr.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-5 space-y-4 bg-slate-900 border-slate-800">
            <h4 className="text-sm font-bold text-slate-100">
              {activeModal.type === 'APPROVE'
                ? 'Confirm Access Approval'
                : activeModal.type === 'REJECT'
                ? 'Confirm Access Rejection'
                : 'Request More Information'}
            </h4>
            <p className="text-xs text-slate-400">
              {activeModal.type === 'APPROVE'
                ? `You are granting production privilege access for ${activeModal.approval.employeeName}. This action will unlock downstream DAG tasks immediately.`
                : 'Please provide a documented rationale for this decision.'}
            </p>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Optional notes or condition requirements..."
              className="w-full h-20 p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
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
          </Card>
        </div>
      )}
    </div>
  );
}
