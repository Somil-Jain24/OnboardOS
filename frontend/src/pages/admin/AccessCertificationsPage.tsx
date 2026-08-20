import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            onClick={handleBulkCertifyAll}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Bulk Certify Unreviewed
          </Button>
        }
      />

      {/* Campaign Progress Card */}
      {selectedCampaign && (
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{selectedCampaign.id}</span>
                <h3 className="font-bold text-slate-100 text-base">{selectedCampaign.name}</h3>
                <Badge variant="default" size="sm">{selectedCampaign.status}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedCampaign.scope}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Deadline:</span>
              <p className="font-mono text-xs font-semibold text-amber-400">
                {new Date(selectedCampaign.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Review Progress: {completionPct}% ({selectedCampaign.reviewedItems} / {selectedCampaign.totalItems} items completed)</span>
              <span className="text-rose-400">{selectedCampaign.revokedItems} Revocations Queued</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Review Inbox List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search items by employee name, app or entitlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-xs"
          />
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isCertified = item.decision === 'CERTIFY';
            const isRevoked = item.decision?.startsWith('REVOKE');

            return (
              <Card
                key={item.id}
                className={`p-5 border transition-all ${
                  isCertified
                    ? 'bg-emerald-950/10 border-emerald-500/30'
                    : isRevoked
                    ? 'bg-rose-950/15 border-rose-500/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-100 text-sm">{item.employeeName}</h4>
                      <Badge variant="outline" size="sm" className="text-slate-400">
                        {item.employeeRole} • {item.department}
                      </Badge>
                      <Badge
                        variant={
                          item.riskLevel === 'CRITICAL'
                            ? 'danger'
                            : item.riskLevel === 'HIGH'
                            ? 'warning'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {item.riskLevel} Risk
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-300">
                      Entitlement: <strong className="text-blue-400">{item.entitlementName}</strong> ({item.app}) • Source: {item.sourcePolicyOrRequest}
                    </div>

                    {/* Contextual signals & Peer Comparison */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
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
                      <Badge
                        variant={isCertified ? 'default' : 'danger'}
                        size="sm"
                        className="py-1 px-3 text-xs"
                      >
                        {item.decision}
                      </Badge>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleDecision(item.id, 'CERTIFY')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Certify Access
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecision(item.id, 'REVOKE')}
                          className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs h-8"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Revoke Access
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
