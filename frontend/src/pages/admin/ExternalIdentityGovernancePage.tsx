import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Users2,
  Plus,
  Clock,
  Trash2,
  Building,
  UserCheck,
  Search,
  CheckCircle2,
  Shield,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register External Identity
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Active External Identities</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{identities.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">100% Sponsor linked</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Auto-Expiring &lt;30d</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">
            {identities.filter((i) => i.daysRemaining <= 30 && i.status === 'ACTIVE').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Sponsor renewal alerts</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Revoked / Completed</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">
            {identities.filter((i) => i.status === 'REVOKED' || i.status === 'EXPIRED').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">De-provisioned immediately</p>
        </Card>
      </div>

      <div className="space-y-3">
        {identities.map((ext) => {
          const isRevoked = ext.status === 'REVOKED';

          return (
            <Card
              key={ext.id}
              className={`p-5 border transition-all ${
                isRevoked ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400">{ext.id}</span>
                    <h4 className="font-semibold text-slate-100 text-sm">{ext.name}</h4>
                    <Badge variant="outline" size="sm">{ext.identityType}</Badge>
                    <Badge variant={isRevoked ? 'danger' : 'default'} size="sm">
                      {ext.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300">
                    {ext.email} • Organization: <strong>{ext.organization}</strong>
                  </p>

                  <p className="text-xs text-slate-400">
                    Internal Sponsor: <strong className="text-slate-200">{ext.sponsorName}</strong> ({ext.sponsorEmail})
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span>Expiration: {ext.expirationDate}</span>
                    {!isRevoked && (
                      <span className="text-amber-400 font-semibold">
                        ⏳ {ext.daysRemaining} days remaining
                      </span>
                    )}
                  </div>
                </div>

                {!isRevoked && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(ext.id)}
                    className="text-rose-400 hover:bg-rose-500/10 text-xs h-8 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Terminate Contract
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* REGISTER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Register External Identity</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Full Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-950 border-slate-800 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">External Email *</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-950 border-slate-800 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Vendor / Agency Company</label>
                <Input value={organization} onChange={(e) => setOrganization(e.target.value)} className="bg-slate-950 border-slate-800 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">Identity Type</label>
                  <select
                    value={identityType}
                    onChange={(e) => setIdentityType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="PARTNER">Partner</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Contract End Date</label>
                  <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="bg-slate-950 border-slate-800 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Business Justification</label>
                <textarea rows={2} value={businessPurpose} onChange={(e) => setBusinessPurpose(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button size="sm" onClick={handleCreate} className="bg-blue-600 hover:bg-blue-500 text-white">Save External Identity</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
