import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Users2,
  Plus,
  Clock,
  Trash2,
} from 'lucide-react';
import type { ExternalIdentity, IdentityType } from '../../types';

export function ExternalIdentityGovernancePage() {
  const [identities, setIdentities] = useState<ExternalIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New contractor form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [identityType, setIdentityType] = useState<IdentityType>('CONTRACTOR');
  const [sponsorName, setSponsorName] = useState('Marcus Vance');
  const [sponsorEmail, setSponsorEmail] = useState('marcus.vance@onboardos.internal');
  const [expirationDate, setExpirationDate] = useState('2026-11-20');
  const [businessPurpose, setBusinessPurpose] = useState('');

  useEffect(() => {
    loadIdentities();
  }, []);

  async function loadIdentities() {
    try {
      setLoading(true);
      const data = await client.getExternalIdentities();
      setIdentities(data);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) return;
    await client.createExternalIdentity({
      name,
      email,
      organization,
      identityType,
      sponsorName,
      sponsorEmail,
      startDate: new Date().toISOString().split('T')[0],
      expirationDate,
      assignedPackages: ['Contractor Restricted 90-Day Baseline'],
      businessPurpose,
    });
    setShowModal(false);
    await loadIdentities();
  };

  const handleRevoke = async (id: string) => {
    await client.revokeExternalIdentity(id, 'Contract completed');
    await loadIdentities();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Guest, Contractor & External Identity Governance"
        description="Govern external vendors, contractors, and partners with mandatory internal sponsor relationships, restricted packages, and auto-expiring contracts."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Sponsor Model Active</Badge>
            <Badge variant="purple">P1-23</Badge>
          </div>
        }
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowModal(true)}
            className="rounded-xl text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register External Identity
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active External Identities"
          value={identities.length}
          subtitle="100% Sponsor linked"
          icon={<Users2 className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Auto-Expiring <30d"
          value={identities.filter((i) => i.daysRemaining <= 30 && i.status === 'ACTIVE').length}
          subtitle="Sponsor renewal alerts"
          icon={<Clock className="w-5 h-5" />}
          iconColor="amber"
        />
        <StatCard
          title="Revoked / Completed"
          value={identities.filter((i) => i.status === 'REVOKED' || i.status === 'EXPIRED').length}
          subtitle="De-provisioned immediately"
          icon={<Trash2 className="w-5 h-5" />}
          iconColor="rose"
        />
      </div>

      <div className="space-y-3">
        {identities.map((ext) => {
          const isRevoked = ext.status === 'REVOKED';

          return (
            <div
              key={ext.id}
              className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-3 ${
                isRevoked ? 'border-slate-200 opacity-60' : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">{ext.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{ext.name}</h4>
                    <Badge variant="secondary" size="sm">{ext.identityType}</Badge>
                    <StatusBadge
                      status={isRevoked ? 'failed' : 'completed'}
                      label={ext.status}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-slate-600">
                    {ext.email} • Organization: <strong className="text-slate-900">{ext.organization}</strong>
                  </p>

                  <p className="text-xs text-slate-500">
                    Internal Sponsor: <strong className="text-slate-800">{ext.sponsorName}</strong> ({ext.sponsorEmail})
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                    <span>Expiration: {ext.expirationDate}</span>
                    {!isRevoked && (
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        ⏳ {ext.daysRemaining} days remaining
                      </span>
                    )}
                  </div>
                </div>

                {!isRevoked && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRevoke(ext.id)}
                    className="rounded-xl text-xs h-8 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Terminate Contract
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 bg-white border border-slate-200/90 rounded-3xl shadow-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register External Identity</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Full Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs rounded-2xl bg-white border-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">External Email *</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="text-xs rounded-2xl bg-white border-slate-200" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Vendor / Agency Company</label>
                <Input value={organization} onChange={(e) => setOrganization(e.target.value)} className="text-xs rounded-2xl bg-white border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Identity Type</label>
                  <select
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="PARTNER">Partner</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Contract End Date</label>
                  <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="text-xs rounded-2xl bg-white border-slate-200" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Business Justification</label>
                <textarea rows={2} value={businessPurpose} onChange={(e) => setBusinessPurpose(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} className="rounded-xl text-xs">Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleCreate} className="rounded-xl text-xs">Save External Identity</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

