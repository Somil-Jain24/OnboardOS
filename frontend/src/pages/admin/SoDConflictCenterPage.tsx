import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { client } from '../../services';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Layers,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Defined Toxic Rules"
          value={rules.length}
          subtitle="Cross-system conflict barriers"
          icon={<Layers className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Prevented / Blocked Requests"
          value={conflicts.filter((c) => c.status === 'BLOCKED_REQUEST').length}
          subtitle="Automatic guardrail enforcement"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconColor="rose"
        />
        <StatCard
          title="Compensating Control Overrides"
          value={conflicts.filter((c) => c.status === 'OVERRIDDEN_APPROVED').length}
          subtitle="Audited InfoSec exceptions"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="emerald"
        />
      </div>

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="segmented" />

      {/* TAB 1: CONFLICTS */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {conflicts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-slate-200/90 rounded-3xl shadow-card">
              No active SoD violations detected.
            </div>
          ) : (
            conflicts.map((cnf) => (
              <div key={cnf.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                        {cnf.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{cnf.ruleName}</h4>
                      <StatusBadge status="failed" label={`${cnf.riskLevel} Risk`} size="sm" />
                      <Badge variant="secondary" size="sm">
                        {cnf.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Violating Identity: <strong className="text-slate-800">{cnf.employeeName}</strong> ({cnf.department})
                    </p>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Detected: {new Date(cnf.detectedAt).toLocaleString()}
                  </span>
                </div>

                {/* Conflicting Pair Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                      Entitlement A (Currently Held)
                    </span>
                    <p className="font-bold text-slate-900 mt-1">{cnf.existingEntitlement}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] uppercase font-mono font-semibold text-rose-700">
                      Entitlement B (Conflicting Request)
                    </span>
                    <p className="font-bold text-rose-900 mt-1">{cnf.conflictingRequestedEntitlement}</p>
                  </div>
                </div>

                {cnf.compensatingControlNote && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                    <strong>Compensating Control:</strong> {cnf.compensatingControlNote}
                  </div>
                )}

                {/* Actions */}
                {cnf.status === 'BLOCKED_REQUEST' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleResolve(cnf.id, 'REVOKE')}
                      className="rounded-xl text-xs h-8"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Enforce Hard Deny
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setOverrideModalConflict(cnf)}
                      className="rounded-xl text-xs h-8"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve with Compensating Control
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* OVERRIDE MODAL */}
          {overrideModalConflict && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="max-w-lg w-full p-6 bg-white border border-slate-200/90 rounded-3xl shadow-dropdown space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Record Compensating Control Override
                  </h3>
                  <button
                    onClick={() => setOverrideModalConflict(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Override requires a documented compensating control (e.g. dual-approval on PR merges, 4-hour max session TTL, or dedicated audit logging).
                </p>

                <textarea
                  rows={3}
                  placeholder="Document compensating control justification for compliance audit..."
                  value={compensatingNote}
                  onChange={(e) => setCompensatingNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600"
                />

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setOverrideModalConflict(null)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!compensatingNote.trim()}
                    onClick={() => handleResolve(overrideModalConflict.id, 'OVERRIDE')}
                    className="rounded-xl text-xs"
                  >
                    Authorize Security Exception
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RULES MATRIX */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                      {rule.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                    <StatusBadge status="failed" label={rule.riskLevel} size="sm" />
                    <Badge variant="secondary" size="sm">
                      {rule.enforcementAction}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{rule.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Entitlement A</span>
                  <p className="text-slate-900 font-bold mt-0.5">
                    {rule.conflictingEntitlements.entitlementA} ({rule.conflictingEntitlements.appA})
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Entitlement B</span>
                  <p className="text-slate-900 font-bold mt-0.5">
                    {rule.conflictingEntitlements.entitlementB} ({rule.conflictingEntitlements.appB})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

