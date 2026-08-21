import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Download,
  Search,
  Key,
} from 'lucide-react';
import type { ComplianceEvidenceItem } from '../../types';

export function ComplianceEvidencePage() {
  const [evidence, setEvidence] = useState<ComplianceEvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadEvidence();
  }, []);

  async function loadEvidence() {
    try {
      setLoading(true);
      const data = await client.getComplianceEvidence();
      setEvidence(data);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await client.exportComplianceAuditReport();
      alert(`Audit evidence bundle exported! ${res.rowCount} cryptographically signed rows included.`);
    } finally {
      setExporting(false);
    }
  };

  const filteredEvidence = evidence.filter((e) => {
    return (
      e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.entitlement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Compliance Evidence & Audit Export Center"
        description="Immutable audit trail of all access lifecycle events with cryptographic checksums and SOC 2 / ISO 27001 ready evidence export."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Audit Sealed</Badge>
            <Badge variant="purple">P1-24</Badge>
          </div>
        }
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-xl text-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export SOC 2 Evidence CSV
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by event ID, employee, or entitlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs rounded-2xl bg-white border-slate-200"
          />
        </div>

        <div className="space-y-3">
          {filteredEvidence.map((ev) => (
            <div key={ev.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                    {ev.id}
                  </span>
                  <Badge variant="secondary" size="sm" className="font-mono font-bold">
                    {ev.action}
                  </Badge>
                  <h4 className="font-bold text-slate-900 text-sm">{ev.entitlement}</h4>
                  <span className="text-xs text-slate-500 font-mono">({ev.system})</span>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {new Date(ev.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Target Identity</span>
                  <p className="font-bold text-slate-900 mt-0.5">{ev.employeeName} ({ev.employeeId})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Authorizing Policy / Rule</span>
                  <p className="font-bold text-slate-900 mt-0.5">{ev.authorizedByPolicy}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Approved By</span>
                  <p className="font-bold text-emerald-600 mt-0.5">{ev.approvedBy}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-400 font-semibold">Integrity Checksum:</span> {ev.evidenceChecksum}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

