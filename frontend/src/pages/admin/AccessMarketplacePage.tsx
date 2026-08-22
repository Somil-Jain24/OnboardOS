import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { client } from '../../services';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import type { AccessPackage, AccessRequest, Employee } from '../../types';

export function AccessMarketplacePage() {
  const { currentRole, currentUser } = useAuth();
  const isEmployeeWorkspace = currentRole === 'EMPLOYEE';
  const [packages, setPackages] = useState<AccessPackage[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  // Request modal state
  const [selectedPkgForRequest, setSelectedPkgForRequest] = useState<AccessPackage | null>(null);
  const [selectedRequesterId, setSelectedRequesterId] = useState(currentUser?.employeeId || '');
  const [justification, setJustification] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.employeeId) setSelectedRequesterId(currentUser.employeeId);
    loadData();
  }, [currentUser?.employeeId, currentRole]);

  async function loadData() {
    try {
      setLoading(true);
      const [pkgs, reqs, emps] = await Promise.all([
        client.getAccessPackages(),
        client.getAccessRequests(isEmployeeWorkspace ? currentUser?.employeeId : undefined),
        isEmployeeWorkspace ? Promise.resolve([]) : client.getEmployees(),
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

  const visibleRequests = isEmployeeWorkspace
    ? requests.filter((request) => request.requesterId === currentUser?.employeeId)
    : requests;

  const tabItems = [
    {
      id: 'browse',
      label: `Discover Packages (${packages.length})`,
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
    },
    {
      id: 'tracker',
      label: `${isEmployeeWorkspace ? 'My Requests' : 'Requests & Approvals'} (${visibleRequests.length})`,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title={isEmployeeWorkspace ? 'My Access Marketplace' : 'Self-Service Access Marketplace'}
        description={isEmployeeWorkspace
          ? 'Request access packages for your own account and track only your requests.'
          : 'Discover, request, and track business applications and infrastructure access packages with automated multi-stage governance.'}
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
              <div
                key={pkg.id}
                className="p-6 bg-white border border-slate-200/90 rounded-3xl flex flex-col justify-between hover:border-blue-300 hover:shadow-card transition-all group shadow-card"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                      {pkg.code}
                    </span>
                    <StatusBadge
                      status={
                        pkg.riskLevel === 'CRITICAL' || pkg.riskLevel === 'HIGH'
                          ? 'failed'
                          : 'completed'
                      }
                      label={`${pkg.riskLevel} Risk`}
                      size="sm"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
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
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono"
                        >
                          {e.app}: {e.permission}
                        </span>
                      ))}
                      {pkg.entitlements.length > 3 && (
                        <span className="px-2 py-1 text-xs text-slate-400 font-medium">
                          +{pkg.entitlements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    Max TTL: <strong className="text-slate-900">{pkg.maxDurationDays}d</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedPkgForRequest(pkg);
                      setDurationDays(Math.min(pkg.maxDurationDays, 30));
                    }}
                    className="rounded-xl text-xs h-8"
                  >
                    Request Access <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* REQUEST DRAWER MODAL */}
          {selectedPkgForRequest && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="max-w-lg w-full p-6 bg-white border border-slate-200/90 rounded-3xl shadow-dropdown space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {selectedPkgForRequest.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      Request: {selectedPkgForRequest.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedPkgForRequest(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {isEmployeeWorkspace ? (
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                      Requesting as <strong className="text-slate-900">{currentUser?.name || 'your employee account'}</strong>. Requests cannot be submitted for another employee.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-slate-600 font-medium">Requesting Employee</label>
                      <select value={selectedRequesterId} onChange={(e) => setSelectedRequesterId(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-600">
                        {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} ({emp.roleTitle} - {emp.departmentName})</option>)}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-slate-600 font-medium">
                      Business Justification & Ticket Reference *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify why you need this access (e.g. Sprint PAY-204 payment gateway migration)..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-600 font-medium">
                      Requested Duration (Max: {selectedPkgForRequest.maxDurationDays} Days)
                    </label>
                    <Input
                      type="number"
                      max={selectedPkgForRequest.maxDurationDays}
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
                      className="text-xs rounded-2xl bg-white border-slate-200"
                    />
                  </div>

                  {selectedPkgForRequest.riskLevel === 'CRITICAL' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <p className="text-xs leading-relaxed">
                        This package grants elevated permissions and requires mandatory two-stage approval (Manager + Security Lead).
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedPkgForRequest(null)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!justification.trim() || submitting}
                    onClick={handleSubmitRequest}
                    className="rounded-xl text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submitting ? 'Submitting...' : 'Submit Access Request'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST & APPROVAL TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {visibleRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-slate-200/90 rounded-3xl shadow-card">
              No active access requests in the system.
            </div>
          ) : (
            visibleRequests.map((req) => (
              <div key={req.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                        {req.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{req.packageName}</h4>
                      <StatusBadge
                        status={
                          req.status === 'APPROVED'
                            ? 'completed'
                            : req.status === 'REJECTED'
                            ? 'failed'
                            : 'warning'
                        }
                        label={req.status}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Requested by <strong className="text-slate-800">{req.requesterName}</strong> ({req.requesterRole} - {req.requesterDepartment}) • {req.durationDays} Days TTL
                    </p>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(req.requestedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500">
                    Business Justification:
                  </span>
                  <p className="text-slate-700 italic">"{req.justification}"</p>
                </div>

                {/* Multi-Stage Approver Stepper */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 font-sans">
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
                          className={`p-4 rounded-2xl border flex flex-col justify-between ${
                            isApproved
                              ? 'bg-emerald-50 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 border-rose-200'
                              : isCurrentPending
                              ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">
                              Stage {step.stage}: {step.approverRole}
                            </span>
                            <StatusBadge
                              status={isApproved ? 'completed' : isRejected ? 'failed' : 'neutral'}
                              label={step.status}
                              size="sm"
                            />
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            Approver: <span className="font-semibold text-slate-700">{step.approverName}</span>
                          </p>

                          {!isEmployeeWorkspace && isCurrentPending && (
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-blue-100">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApproveStage(req.id, step.approverRole)}
                                className="rounded-xl text-xs h-7 flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectStage(req.id, step.approverRole)}
                                className="rounded-xl text-xs h-7 flex-1"
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

