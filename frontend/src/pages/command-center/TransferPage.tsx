import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { TransferRequest } from '../../types';

export function TransferPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, loading } = useEmployee(id);
  const [targetDept, setTargetDept] = useState('Security & Compliance');
  const [targetTeam, setTargetTeam] = useState('Application Security');
  const [targetRole, setTargetRole] = useState('Security Engineer');
  const [transferRecord, setTransferRecord] = useState<TransferRequest | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleCreatePreview = async () => {
    const res = await client.createTransferRequest(id, {
      department: targetDept,
      team: targetTeam,
      roleTitle: targetRole,
    });
    setTransferRecord(res);
  };

  const handleApply = async () => {
    if (!transferRecord) return;
    setIsApplying(true);
    try {
      const res = await client.applyTransfer(transferRecord.id);
      setTransferRecord(res);
      setAppliedSuccess(true);
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Internal Transfer Engine"
        description="Automated cross-departmental transition engine computing entitlement diffs, revoking obsolete team write permissions, and provisioning new role accesses."
        badge={<Badge variant="purple" dot>Lifecycle Extension</Badge>}
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {appliedSuccess && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-xs text-emerald-900 flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <strong className="text-sm font-bold text-emerald-900">Internal Transfer Orchestration Applied!</strong>
            <p className="text-xs text-emerald-700 mt-0.5">
              Permissions for {employee?.name} have been updated. Payments write grants revoked; Security tool suite granted.
            </p>
          </div>
        </div>
      )}

      {/* Transfer Parameters Card */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          Transfer Transition Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Select
            label="Target Department"
            value={targetDept}
            onChange={(e) => setTargetDept(e.target.value)}
            options={[
              { value: 'Security & Compliance', label: 'Security & Compliance' },
              { value: 'Platform Engineering', label: 'Platform Engineering' },
              { value: 'Product Management', label: 'Product Management' },
            ]}
          />

          <Select
            label="Target Team"
            value={targetTeam}
            onChange={(e) => setTargetTeam(e.target.value)}
            options={[
              { value: 'Application Security', label: 'Application Security' },
              { value: 'Cloud Infrastructure', label: 'Cloud Infrastructure' },
              { value: 'Product Core', label: 'Product Core' },
            ]}
          />

          <Select
            label="Target Role Title"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            options={[
              { value: 'Security Engineer', label: 'Security Engineer' },
              { value: 'DevOps Engineer', label: 'DevOps Engineer' },
              { value: 'Product Manager', label: 'Product Manager' },
            ]}
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button
            size="sm"
            variant="primary"
            onClick={handleCreatePreview}
            className="rounded-xl"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Compute Entitlement Diff
          </Button>
        </div>
      </div>

      {/* Transfer Diff Preview Card */}
      {transferRecord && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Transfer Entitlement Diff Preview
            </h4>
            <StatusBadge
              status={transferRecord.status === 'APPLIED' ? 'completed' : 'pending'}
              label={transferRecord.status}
              size="sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Added */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Access to be Granted
              </span>
              <div className="space-y-2">
                {transferRecord.diffAccessAdded.map((a, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <span className="font-bold text-slate-900">{a.name}</span>
                    <p className="text-slate-600 text-xs mt-0.5">{a.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Removed */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4 text-rose-600" />
                Access to be Revoked (Least Privilege)
              </span>
              <div className="space-y-2">
                {transferRecord.diffAccessRemoved.map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs">
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <p className="text-slate-600 text-xs mt-0.5">{r.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          {transferRecord.status !== 'APPLIED' && (
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                size="md"
                variant="primary"
                isLoading={isApplying}
                onClick={handleApply}
                className="rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Apply & Execute Transfer Orchestration
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

