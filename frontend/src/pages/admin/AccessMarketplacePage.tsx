import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { client } from '../../services';
import {
  ShoppingBag,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  UserCheck,
  XCircle,
  Sparkles,
} from 'lucide-react';
import type { AccessPackage, AccessRequest, Employee } from '../../types';

export function AccessMarketplacePage() {
  const [packages, setPackages] = useState<AccessPackage[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  // Request modal state
  const [selectedPkgForRequest, setSelectedPkgForRequest] = useState<AccessPackage | null>(null);
  const [selectedRequesterId, setSelectedRequesterId] = useState('emp-rahul');
  const [justification, setJustification] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pkgs, reqs, emps] = await Promise.all([
        client.getAccessPackages(),
        client.getAccessRequests(),
        client.getEmployees(),
      ]);
      setPackages(pkgs);
      setRequests(reqs);
      setEmployees(emps);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitRequest = async () => {
    if (!selectedPkgForRequest || !justification.trim()) return;
    try {
      setSubmitting(true);
      await client.submitAccessRequest({
        packageId: selectedPkgForRequest.id,
        requesterId: selectedRequesterId,
        justification,
        durationDays,
      });
      await loadData();
      setSelectedPkgForRequest(null);
      setJustification('');
      setActiveTab('tracker');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveStage = async (reqId: string, role: string) => {
    await client.approveAccessRequest(reqId, role, 'Approved by reviewer in demo portal.');
    await loadData();
  };

  const handleRejectStage = async (reqId: string, role: string) => {
    await client.rejectAccessRequest(reqId, role, 'Denied due to policy constraint.');
    await loadData();
  };

  const tabItems = [
    {
      id: 'browse',
      label: `Discover Packages (${packages.length})`,
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
    },
    {
      id: 'tracker',
      label: `My Requests & Approvals (${requests.length})`,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Self-Service Access Marketplace"
        description="Discover, request, and track business applications and infrastructure access packages with automated multi-stage governance."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Self-Service Active</Badge>
            <Badge variant="purple">P0-16</Badge>
          </div>
        }
      />

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="segmented" />

      {/* TAB 1: BROWSE MARKETPLACE */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className="p-5 bg-slate-900/80 border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {pkg.code}
                    </span>
                    <Badge
                      variant={
                        pkg.riskLevel === 'CRITICAL'
                          ? 'danger'
                          : pkg.riskLevel === 'HIGH'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {pkg.riskLevel}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <p className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                      Includes ({pkg.entitlements.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.entitlements.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 font-mono"
                        >
                          {e.app}: {e.permission}
                        </span>
                      ))}
                      {pkg.entitlements.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                          +{pkg.entitlements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Max TTL: <strong className="text-slate-300">{pkg.maxDurationDays}d</strong>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedPkgForRequest(pkg);
                      setDurationDays(Math.min(pkg.maxDurationDays, 30));
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8"
                  >
                    Request Access <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* REQUEST DRAWER MODAL */}
          {selectedPkgForRequest && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-lg w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      {selectedPkgForRequest.code}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base">
                      Request: {selectedPkgForRequest.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedPkgForRequest(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Requesting Employee Persona</label>
                    <select
                      value={selectedRequesterId}
                      onChange={(e) => setSelectedRequesterId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.roleTitle} - {emp.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">
                      Business Justification & Ticket Reference *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify why you need this access (e.g. Sprint PAY-204 payment gateway migration)..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">
                      Requested Duration (Max: {selectedPkgForRequest.maxDurationDays} Days)
                    </label>
                    <Input
                      type="number"
                      max={selectedPkgForRequest.maxDurationDays}
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
                      className="bg-slate-950 border-slate-800"
                    />
                  </div>

                  {selectedPkgForRequest.riskLevel === 'CRITICAL' && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        This package grants elevated permissions and requires mandatory two-stage approval (Manager + Security Lead).
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPkgForRequest(null)}
                    className="border-slate-700 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!justification.trim() || submitting}
                    onClick={handleSubmitRequest}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submitting ? 'Submitting...' : 'Submit Access Request'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST & APPROVAL TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 bg-slate-900/40 border-slate-800">
              No active access requests in the system.
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {req.id}
                      </span>
                      <h4 className="font-semibold text-slate-100 text-sm">{req.packageName}</h4>
                      <Badge
                        variant={
                          req.status === 'APPROVED'
                            ? 'default'
                            : req.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Requested by <strong className="text-slate-200">{req.requesterName}</strong> ({req.requesterRole} - {req.requesterDepartment}) • {req.durationDays} Days TTL
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                    Business Justification:
                  </span>
                  <p className="text-slate-300 italic">"{req.justification}"</p>
                </div>

                {/* Multi-Stage Approver Stepper */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                    Approval Governance Stages ({req.currentStage} / {req.totalStages}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {req.approvers.map((step) => {
                      const isApproved = step.status === 'APPROVED';
                      const isRejected = step.status === 'REJECTED';
                      const isCurrentPending = req.status === 'PENDING' && step.stage === req.currentStage;

                      return (
                        <div
                          key={step.stage}
                          className={`p-3 rounded-lg border flex flex-col justify-between ${
                            isApproved
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : isRejected
                              ? 'bg-rose-950/20 border-rose-500/30'
                              : isCurrentPending
                              ? 'bg-blue-950/30 border-blue-500/40'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-200 text-xs">
                              Stage {step.stage}: {step.approverRole}
                            </span>
                            <Badge
                              variant={isApproved ? 'default' : isRejected ? 'danger' : 'outline'}
                              size="sm"
                              className="text-[10px]"
                            >
                              {step.status}
                            </Badge>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-1">
                            Approver: {step.approverName}
                          </p>

                          {isCurrentPending && (
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
                              <Button
                                size="sm"
                                onClick={() => handleApproveStage(req.id, step.approverRole)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 flex-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectStage(req.id, step.approverRole)}
                                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-7 flex-1"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
