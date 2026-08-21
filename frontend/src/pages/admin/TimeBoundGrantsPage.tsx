import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Governed Grants"
          value={grants.length}
          subtitle="Across all cloud & SaaS tools"
          icon={<Clock className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Expiring within 72h"
          value={grants.filter((g) => g.status === 'EXPIRING_SOON' || g.remainingHours <= 72).length}
          subtitle="Renewal notifications dispatched"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="amber"
        />
        <StatCard
          title="Active Long-Lived"
          value={grants.filter((g) => g.status === 'ACTIVE').length}
          subtitle="Standard review cycle"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Revoked / Terminated"
          value={grants.filter((g) => g.status === 'REVOKED' || g.status === 'EXPIRED').length}
          subtitle="Zero residual access"
          icon={<Trash2 className="w-5 h-5" />}
          iconColor="rose"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by employee, package, or entitlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs rounded-2xl bg-white border-slate-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
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
            <div
              key={grant.id}
              className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-3 ${
                isExpiringSoon && !isRevoked
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : isRevoked
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                      {grant.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{grant.entitlementName}</h4>
                    <Badge variant="secondary" size="sm">
                      {grant.app}
                    </Badge>
                    <StatusBadge
                      status={
                        isRevoked
                          ? 'failed'
                          : isExpiringSoon
                          ? 'warning'
                          : 'completed'
                      }
                      label={grant.status}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-slate-600">
                    Assigned to <strong className="text-slate-900">{grant.employeeName}</strong> ({grant.employeeEmail}) • Granted via {grant.grantedBy}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                    <span>Granted: {new Date(grant.grantedAt).toLocaleDateString()}</span>
                    <span>Expires: {new Date(grant.expiresAt).toLocaleString()}</span>
                    <span className={`font-bold ${isExpiringSoon && !isRevoked ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200' : 'text-slate-700'}`}>
                      ⏳ {grant.remainingHours}h remaining
                    </span>
                  </div>
                </div>

                {!isRevoked && (
                  <div className="flex items-center gap-2">
                    {grant.renewalEligible && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRenewGrant(grant.id)}
                        className="rounded-xl text-xs h-8"
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-1 text-blue-600" /> +30d Renew
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRevokeGrant(grant.id)}
                      className="rounded-xl text-xs h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

