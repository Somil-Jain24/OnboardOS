import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  FileCheck2,
  Download,
  Search,
  ShieldCheck,
  Filter,
  CheckCircle2,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            onClick={handleExport}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export SOC 2 Evidence CSV
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by event ID, employee, or entitlement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-xs"
          />
        </div>

        <div className="space-y-3">
          {filteredEvidence.map((ev) => (
            <Card key={ev.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {ev.id}
                  </span>
                  <Badge variant="outline" size="sm" className="font-mono font-bold">
                    {ev.action}
                  </Badge>
                  <h4 className="font-semibold text-slate-100 text-sm">{ev.entitlement}</h4>
                  <span className="text-xs text-slate-400 font-mono">({ev.system})</span>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(ev.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Target Identity</span>
                  <p className="font-medium text-slate-200 mt-0.5">{ev.employeeName} ({ev.employeeId})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Authorizing Policy / Rule</span>
                  <p className="font-medium text-slate-200 mt-0.5">{ev.authorizedByPolicy}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Approved By</span>
                  <p className="font-medium text-emerald-400 mt-0.5">{ev.approvedBy}</p>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 truncate flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-500">Integrity Checksum:</span> {ev.evidenceChecksum}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
