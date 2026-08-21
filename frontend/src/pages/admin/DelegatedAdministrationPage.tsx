import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { client } from '../../services';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
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
          <div key={scope.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{scope.id}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{scope.adminName}</h3>
                  <Badge variant="purple" size="sm">{scope.scopeType}</Badge>
                </div>
                <p className="text-xs text-slate-500">{scope.adminEmail}</p>
              </div>

              <div className="text-xs font-mono text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                Scope Boundary: <strong className="text-blue-700">{scope.assignedScope}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 font-mono">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-sans font-medium">Can Approve Requests:</span>
                <span className={scope.canApprove ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200' : 'text-slate-400'}>
                  {scope.canApprove ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-sans font-medium">Can Run Reviews:</span>
                <span className={scope.canReview ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200' : 'text-slate-400'}>
                  {scope.canReview ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-sans font-medium">Can Edit Policies:</span>
                <span className={scope.canManagePolicies ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200' : 'text-slate-400'}>
                  {scope.canManagePolicies ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

