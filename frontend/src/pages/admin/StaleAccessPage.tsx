import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  ClockAlert,
  Trash2,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import type { StaleAccessItem } from '../../types';

export function StaleAccessPage() {
  const [items, setItems] = useState<StaleAccessItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await client.getStaleAccessItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  const handleReclaim = async (id: string, action: 'REVOKE_IMMEDIATE' | 'KEPT_WITH_JUSTIFICATION') => {
    await client.reclaimStaleAccess(id, action);
    await loadItems();
  };

  const totalCostWaste = items
    .filter((i) => i.status === 'FLAGGED')
    .reduce((acc, i) => acc + (i.monthlyCostUsd || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Usage-Aware Stale Access Detection"
        description="Detect dormant permissions and inactive application licenses (90+ days unused) to reduce attack surface and reclaim software seat costs."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Usage Monitor Active</Badge>
            <Badge variant="purple">P1-25</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Flagged Dormant Grants"
          value={items.filter((i) => i.status === 'FLAGGED').length}
          subtitle=">90 days zero login activity"
          icon={<ClockAlert className="w-5 h-5" />}
          iconColor="amber"
        />
        <StatCard
          title="Monthly Inactive Waste"
          value={`$${totalCostWaste}/mo`}
          subtitle="Reclaimable SaaS license cost"
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="rose"
        />
        <StatCard
          title="Reclaimed This Month"
          value={items.filter((i) => i.status === 'REVOKED').length}
          subtitle="Least privilege enforced"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="emerald"
        />
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isRevoked = item.status === 'REVOKED';

          return (
            <div
              key={item.id}
              className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-3 ${
                isRevoked ? 'border-slate-200 opacity-70' : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      {item.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.entitlementName}</h4>
                    <Badge variant="secondary" size="sm">{item.app}</Badge>
                    <StatusBadge
                      status={isRevoked ? 'completed' : 'warning'}
                      label={item.status}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-slate-600">
                    Employee: <strong className="text-slate-900">{item.employeeName}</strong> ({item.roleTitle} - {item.department})
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                    <span className="text-rose-600 font-bold">⚠️ {item.daysInactive} days inactive</span>
                    <span>Last login: {new Date(item.lastActivityAt).toLocaleDateString()}</span>
                    {item.monthlyCostUsd && (
                      <span className="text-amber-800 font-semibold">Cost: ${item.monthlyCostUsd}/mo</span>
                    )}
                  </div>
                </div>

                {!isRevoked && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReclaim(item.id, 'REVOKE_IMMEDIATE')}
                      className="rounded-xl text-xs h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Reclaim & Revoke
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReclaim(item.id, 'KEPT_WITH_JUSTIFICATION')}
                      className="rounded-xl text-xs h-8"
                    >
                      Keep (Business Need)
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

