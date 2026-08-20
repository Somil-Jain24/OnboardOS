import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Clock,
  RotateCw,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Server,
  ShieldAlert,
} from 'lucide-react';
import type { AccessGrant } from '../../types';

export function TimeBoundGrantsPage() {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadGrants();
  }, []);

  async function loadGrants() {
    try {
      setLoading(true);
      const data = await client.getAccessGrants();
      setGrants(data);
    } finally {
      setLoading(false);
    }
  }

  const handleRenewGrant = async (id: string) => {
    await client.renewAccessGrant(id, 30);
    await loadGrants();
  };

  const handleRevokeGrant = async (id: string) => {
    await client.revokeAccessGrant(id, 'Admin manual revocation');
    await loadGrants();
  };

  const filteredGrants = grants.filter((g) => {
    const matchesSearch =
      g.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.entitlementName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Access Expiration & Time-Bound Grants"
        description="Monitor ephemeral access lifetimes, countdown timers, and automated revocation workflows enforcing the principle of least privilege."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Auto-Revoke Active</Badge>
            <Badge variant="purple">P0-17</Badge>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Total Governed Grants</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{grants.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Across all cloud & SaaS tools</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Expiring within 72h</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">
            {grants.filter((g) => g.status === 'EXPIRING_SOON' || g.remainingHours <= 72).length}
          </h3>
          <p className="text-[11px] text-amber-500/80 mt-1">Renewal notifications dispatched</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Active Long-Lived</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            {grants.filter((g) => g.status === 'ACTIVE').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Standard review cycle</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Revoked / Terminated</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">
            {grants.filter((g) => g.status === 'REVOKED' || g.status === 'EXPIRED').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Zero residual access</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by employee, package, or entitlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="ALL">All Grant Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon (&lt;72h)</option>
            <option value="RENEWED">Renewed</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Grant Cards List */}
      <div className="space-y-3">
        {filteredGrants.map((grant) => {
          const isExpiringSoon = grant.status === 'EXPIRING_SOON' || grant.remainingHours <= 72;
          const isRevoked = grant.status === 'REVOKED';

          return (
            <Card
              key={grant.id}
              className={`p-5 border transition-all ${
                isExpiringSoon && !isRevoked
                  ? 'bg-amber-950/10 border-amber-500/30'
                  : isRevoked
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {grant.id}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">{grant.entitlementName}</h4>
                    <Badge variant="outline" size="sm" className="text-slate-300">
                      {grant.app}
                    </Badge>
                    <Badge
                      variant={
                        isRevoked
                          ? 'danger'
                          : isExpiringSoon
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                    >
                      {grant.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400">
                    Assigned to <strong className="text-slate-200">{grant.employeeName}</strong> ({grant.employeeEmail}) • Granted via {grant.grantedBy}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Granted: {new Date(grant.grantedAt).toLocaleDateString()}</span>
                    <span>Expires: {new Date(grant.expiresAt).toLocaleString()}</span>
                    <span className={`font-semibold ${isExpiringSoon && !isRevoked ? 'text-amber-400' : 'text-slate-300'}`}>
                      ⏳ {grant.remainingHours}h remaining
                    </span>
                  </div>
                </div>

                {!isRevoked && (
                  <div className="flex items-center gap-2">
                    {grant.renewalEligible && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewGrant(grant.id)}
                        className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs h-8"
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-1" /> +30d Renew
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevokeGrant(grant.id)}
                      className="text-rose-400 hover:bg-rose-500/10 text-xs h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke Now
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
