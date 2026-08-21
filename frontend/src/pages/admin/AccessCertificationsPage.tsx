import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Progress } from '../../components/ui/Progress';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import type { AccessReviewCampaign, AccessReviewItem } from '../../types';

export function AccessCertificationsPage() {
  const [campaigns, setCampaigns] = useState<AccessReviewCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AccessReviewCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);
      const data = await client.getCertificationCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaign) {
        setSelectedCampaign(data[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleDecision = async (
    itemId: string,
    decision: 'CERTIFY' | 'REVOKE' | 'REVOKE_WITH_EXCEPTION'
  ) => {
    if (!selectedCampaign) return;
    await client.decideReviewItem(selectedCampaign.id, itemId, decision);
    await loadCampaigns();
  };

  const handleBulkCertifyAll = async () => {
    if (!selectedCampaign) return;
    for (const item of selectedCampaign.items) {
      if (!item.decision) {
        await client.decideReviewItem(selectedCampaign.id, item.id, 'CERTIFY', 'Bulk approved during quarterly review');
      }
    }
    await loadCampaigns();
  };

  const filteredItems = (selectedCampaign?.items || []).filter((item) => {
    return (
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entitlementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.app.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const completionPct = selectedCampaign
    ? Math.round((selectedCampaign.reviewedItems / selectedCampaign.totalItems) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Periodic Access Certification Campaigns"
        description="Quarterly and ad-hoc user access reviews (UAR) with peer comparison signals, usage telemetry, and one-click revocation."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Campaign Active</Badge>
            <Badge variant="purple">P0-18</Badge>
          </div>
        }
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={handleBulkCertifyAll}
            className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Bulk Certify Unreviewed
          </Button>
        }
      />

      {/* Campaign Progress Card */}
      {selectedCampaign && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600">{selectedCampaign.id}</span>
                <h3 className="font-bold text-slate-900 text-base">{selectedCampaign.name}</h3>
                <StatusBadge status="completed" label={selectedCampaign.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedCampaign.scope}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Deadline:</span>
              <p className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 inline-block mt-0.5">
                {new Date(selectedCampaign.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-mono">
              <span>Review Progress: <strong>{completionPct}%</strong> ({selectedCampaign.reviewedItems} / {selectedCampaign.totalItems} items completed)</span>
              <span className="text-rose-600 font-bold">{selectedCampaign.revokedItems} Revocations Queued</span>
            </div>
            <Progress value={completionPct} color="blue" size="md" />
          </div>
        </div>
      )}

      {/* Review Inbox List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search items by employee name, app or entitlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs rounded-2xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isCertified = item.decision === 'CERTIFY';
            const isRevoked = item.decision?.startsWith('REVOKE');

            return (
              <div
                key={item.id}
                className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-3 ${
                  isCertified
                    ? 'border-emerald-200 ring-1 ring-emerald-100'
                    : isRevoked
                    ? 'border-rose-200 ring-1 ring-rose-100'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{item.employeeName}</h4>
                      <Badge variant="secondary" size="sm">
                        {item.employeeRole} • {item.department}
                      </Badge>
                      <StatusBadge
                        status={
                          item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
                            ? 'failed'
                            : 'neutral'
                        }
                        label={`${item.riskLevel} Risk`}
                        size="sm"
                      />
                    </div>

                    <div className="text-xs text-slate-600">
                      Entitlement: <strong className="text-blue-600 font-semibold">{item.entitlementName}</strong> ({item.app}) • Source: {item.sourcePolicyOrRequest}
                    </div>

                    {/* Contextual signals & Peer Comparison */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-sans font-medium">
                        💡 {item.peerComparison}
                      </span>
                      {item.lastUsedAt && (
                        <span className="text-slate-400">
                          Last Active: {new Date(item.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Decision Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.decision ? (
                      <StatusBadge
                        status={isCertified ? 'completed' : 'failed'}
                        label={item.decision}
                        size="md"
                      />
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleDecision(item.id, 'CERTIFY')}
                          className="rounded-xl text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Certify Access
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDecision(item.id, 'REVOKE')}
                          className="rounded-xl text-xs h-8"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Revoke Access
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

