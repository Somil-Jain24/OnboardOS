import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { client } from '../../services';
import {
  UserCheck,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import type { DelegatedAdminScope } from '../../types';

export function DelegatedAdministrationPage() {
  const [scopes, setScopes] = useState<DelegatedAdminScope[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScopes();
  }, []);

  async function loadScopes() {
    try {
      setLoading(true);
      const data = await client.getDelegatedAdminScopes();
      setScopes(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Delegated Administration & Resource Ownership"
        description="Empower departmental leads and application owners with scoped administrative capabilities while preserving global security guardrails."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Delegated RBAC Active</Badge>
            <Badge variant="purple">P2-29</Badge>
          </div>
        }
      />

      <div className="space-y-4">
        {scopes.map((scope) => (
          <Card key={scope.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">{scope.id}</span>
                  <h3 className="font-semibold text-slate-100 text-sm">{scope.adminName}</h3>
                  <Badge variant="purple" size="sm">{scope.scopeType}</Badge>
                </div>
                <p className="text-xs text-slate-400">{scope.adminEmail}</p>
              </div>

              <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                Scope Boundary: <strong className="text-blue-400">{scope.assignedScope}</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-1 font-mono">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Can Approve Requests:</span>
                <span className={scope.canApprove ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {scope.canApprove ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Can Run Reviews:</span>
                <span className={scope.canReview ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {scope.canReview ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Can Edit Policies:</span>
                <span className={scope.canManagePolicies ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {scope.canManagePolicies ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
