import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { client } from '../../services';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Search,
  Sliders,
  Layers,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import type { SoDRule, SoDConflict } from '../../types';

export function SoDConflictCenterPage() {
  const [rules, setRules] = useState<SoDRule[]>([]);
  const [conflicts, setConflicts] = useState<SoDConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conflicts');
  const [overrideModalConflict, setOverrideModalConflict] = useState<SoDConflict | null>(null);
  const [compensatingNote, setCompensatingNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [rulesData, conflictsData] = await Promise.all([
        client.getSoDRules(),
        client.getSoDConflicts(),
      ]);
      setRules(rulesData);
      setConflicts(conflictsData);
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = async (conflictId: string, action: 'OVERRIDE' | 'REVOKE') => {
    await client.resolveSoDConflict(conflictId, action, compensatingNote || 'Approved via security exception control.');
    setOverrideModalConflict(null);
    setCompensatingNote('');
    await loadData();
  };

  const tabItems = [
    {
      id: 'conflicts',
      label: `Active SoD Conflicts (${conflicts.length})`,
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
    {
      id: 'rules',
      label: `Toxic Combination Rules (${rules.length})`,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Separation of Duties (SoD) Conflict Center"
        description="Prevent toxic privilege combinations, enforce hard deny policies across distributed systems, and audit security exception overrides."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>SoD Active</Badge>
            <Badge variant="purple">P0-19</Badge>
          </div>
        }
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Defined Toxic Rules</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{rules.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Cross-system conflict barriers</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Prevented / Blocked Requests</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">
            {conflicts.filter((c) => c.status === 'BLOCKED_REQUEST').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Automatic guardrail enforcement</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Compensating Control Overrides</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-1">
            {conflicts.filter((c) => c.status === 'OVERRIDDEN_APPROVED').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Audited InfoSec exceptions</p>
        </Card>
      </div>

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="segmented" />

      {/* TAB 1: CONFLICTS */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {conflicts.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800">
              No active SoD violations detected.
            </Card>
          ) : (
            conflicts.map((cnf) => (
              <Card key={cnf.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {cnf.id}
                      </span>
                      <h4 className="font-semibold text-slate-100 text-sm">{cnf.ruleName}</h4>
                      <Badge variant="danger" size="sm">
                        {cnf.riskLevel}
                      </Badge>
                      <Badge variant="outline" size="sm" className="text-slate-300">
                        {cnf.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Violating Identity: <strong className="text-slate-200">{cnf.employeeName}</strong> ({cnf.department})
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Detected: {new Date(cnf.detectedAt).toLocaleString()}
                  </span>
                </div>

                {/* Conflicting Pair Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                      Entitlement A (Currently Held)
                    </span>
                    <p className="font-medium text-slate-200 mt-1">{cnf.existingEntitlement}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                    <span className="text-[10px] uppercase font-mono font-semibold text-rose-400">
                      Entitlement B (Conflicting Request)
                    </span>
                    <p className="font-medium text-rose-200 mt-1">{cnf.conflictingRequestedEntitlement}</p>
                  </div>
                </div>

                {cnf.compensatingControlNote && (
                  <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                    <strong>Compensating Control:</strong> {cnf.compensatingControlNote}
                  </div>
                )}

                {/* Actions */}
                {cnf.status === 'BLOCKED_REQUEST' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(cnf.id, 'REVOKE')}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-8"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Enforce Hard Deny
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setOverrideModalConflict(cnf)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve with Compensating Control
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}

          {/* OVERRIDE MODAL */}
          {overrideModalConflict && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-lg w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-sm">
                    Record Compensating Control Override
                  </h3>
                  <button
                    onClick={() => setOverrideModalConflict(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Override requires a documented compensating control (e.g. dual-approval on PR merges, 4-hour max session TTL, or dedicated audit logging).
                </p>

                <textarea
                  rows={3}
                  placeholder="Document compensating control justification for compliance audit..."
                  value={compensatingNote}
                  onChange={(e) => setCompensatingNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOverrideModalConflict(null)}
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!compensatingNote.trim()}
                    onClick={() => handleResolve(overrideModalConflict.id, 'OVERRIDE')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                  >
                    Authorize Security Exception
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RULES MATRIX */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {rule.id}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">{rule.name}</h4>
                    <Badge variant="danger" size="sm">{rule.riskLevel}</Badge>
                    <Badge variant="outline" size="sm" className="text-slate-300">
                      {rule.enforcementAction}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Entitlement A</span>
                  <p className="text-slate-200 mt-0.5">
                    {rule.conflictingEntitlements.entitlementA} ({rule.conflictingEntitlements.appA})
                  </p>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Entitlement B</span>
                  <p className="text-slate-200 mt-0.5">
                    {rule.conflictingEntitlements.entitlementB} ({rule.conflictingEntitlements.appB})
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
