import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Internal Transfer Engine (FR-LIFE-01)"
        description="Automated cross-departmental transition engine computing entitlement diffs, revoking obsolete team write permissions, and provisioning new role accesses."
        badge={<Badge variant="purple" dot>P2 Lifecycle Extension</Badge>}
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {appliedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <strong>Internal Transfer Orchestration Applied!</strong>
            <p className="text-[11px] mt-0.5">
              Permissions for {employee?.name} have been updated. Payments write grants revoked; Security tool suite granted.
            </p>
          </div>
        </div>
      )}

      {/* Transfer Parameters Card */}
      <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-blue-400" />
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

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button
            size="sm"
            variant="primary"
            onClick={handleCreatePreview}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Compute Entitlement Diff
          </Button>
        </div>
      </Card>

      {/* Transfer Diff Preview Card */}
      {transferRecord && (
        <Card className="p-5 bg-slate-900/90 border-purple-500/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Transfer Entitlement Diff Preview
            </h4>
            <Badge variant={transferRecord.status === 'APPLIED' ? 'success' : 'warning'} size="sm">
              {transferRecord.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Added */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                Access to be Granted
              </span>
              {transferRecord.diffAccessAdded.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                  <span className="font-semibold text-slate-100">{a.name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.reason}</p>
                </div>
              ))}
            </div>

            {/* Removed */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4" />
                Access to be Revoked (Least Privilege)
              </span>
              {transferRecord.diffAccessRemoved.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs">
                  <span className="font-semibold text-slate-100">{r.name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          {transferRecord.status !== 'APPLIED' && (
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button
                size="md"
                variant="primary"
                isLoading={isApplying}
                onClick={handleApply}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Apply & Execute Transfer Orchestration
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
