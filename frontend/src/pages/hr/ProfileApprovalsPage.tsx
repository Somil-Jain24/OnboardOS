import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  Eye,
  FileText,
  X,
} from 'lucide-react';
import type { Employee, ProfileReviewStatus } from '../../types';

export function ProfileApprovalsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED'>('PENDING');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadApprovals = async () => {
    try {
      const res = await client.getProfileApprovals();
      if (res && res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.warn('Failed to load profile approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleApprove = async (emp: Employee) => {
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await client.approveProfile(emp.id, notesInput || 'Profile approved by HR.');
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: `Approved profile for ${emp.name}. Self-service claims unlocked!` });
        await loadApprovals();
        setSelectedEmp(null);
        setNotesInput('');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to approve profile.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (emp: Employee) => {
    if (!notesInput.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Please enter notes explaining the requested changes.' });
      return;
    }
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await client.requestProfileChanges(emp.id, notesInput.trim());
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: `Changes requested from ${emp.name}.` });
        await loadApprovals();
        setSelectedEmp(null);
        setNotesInput('');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to request changes.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (emp: Employee) => {
    if (!notesInput.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Please enter a rejection reason.' });
      return;
    }
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await client.rejectProfile(emp.id, notesInput.trim());
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: `Profile for ${emp.name} has been rejected.` });
        await loadApprovals();
        setSelectedEmp(null);
        setNotesInput('');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to reject profile.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = employees.filter((e) => e.profileStatus === 'PENDING_HR_APPROVAL').length;
  const changesCount = employees.filter((e) => e.profileStatus === 'CHANGES_REQUESTED').length;
  const approvedCount = employees.filter((e) => e.profileStatus === 'APPROVED').length;

  const filteredEmployees = employees.filter((e) => {
    if (activeTab === 'PENDING') return e.profileStatus === 'PENDING_HR_APPROVAL';
    if (activeTab === 'CHANGES_REQUESTED') return e.profileStatus === 'CHANGES_REQUESTED';
    if (activeTab === 'APPROVED') return e.profileStatus === 'APPROVED';
    return true;
  });

  return (
    <div className="space-y-6 text-left pb-20">
      <PageHeader
        title="Employee Profile Approvals"
        description="Review candidate-submitted legal, personal, and emergency contact details before unlocking self-service access claims."
        badge={
          pendingCount > 0 ? (
            <Badge variant="warning" dot>
              {pendingCount} Pending HR Review
            </Badge>
          ) : (
            <Badge variant="success" dot>
              All Caught Up
            </Badge>
          )
        }
      />

      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-1 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase">Pending HR Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
          <p className="text-[11px] text-slate-400">Awaiting identity & contact sign-off</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-1 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase">Changes Requested</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{changesCount}</div>
          <p className="text-[11px] text-slate-400">Waiting for employee re-submission</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-1 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-mono uppercase">Approved & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{approvedCount}</div>
          <p className="text-[11px] text-slate-400">Self-service claims unlocked</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'PENDING' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('CHANGES_REQUESTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'CHANGES_REQUESTED' ? 'bg-rose-100 text-rose-900' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Changes Requested ({changesCount})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'ALL' ? 'bg-blue-100 text-blue-900' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Submissions ({employees.length})
        </button>
      </div>

      {/* Submissions Queue Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No profile submissions in this tab</h4>
            <p className="text-xs text-slate-500">All candidate onboarding profiles are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Candidate / Employee</th>
                  <th className="px-5 py-3.5">Department & Role</th>
                  <th className="px-5 py-3.5">Personal Contact</th>
                  <th className="px-5 py-3.5">Emergency Contact</th>
                  <th className="px-5 py-3.5">Review Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredEmployees.map((emp) => {
                  const status = emp.profileStatus || 'DRAFT';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{emp.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">{emp.roleTitle || 'Software Engineer'}</div>
                        <div className="text-[11px] text-slate-500">{emp.departmentName || 'Engineering'} • {emp.teamName || 'Payments'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div>{emp.personalEmail || '—'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.phone || '—'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div>{emp.emergencyContactName || '—'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.emergencyContactPhone || '—'}</div>
                      </td>
                      <td className="px-5 py-4">
                        {status === 'PENDING_HR_APPROVAL' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase font-mono">
                            Pending Review
                          </span>
                        )}
                        {status === 'CHANGES_REQUESTED' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase font-mono">
                            Changes Needed
                          </span>
                        )}
                        {status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase font-mono">
                            Approved
                          </span>
                        )}
                        {status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-white font-bold text-[10px] uppercase font-mono">
                            Rejected
                          </span>
                        )}
                        {status === 'DRAFT' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase font-mono">
                            Draft (Unsubmitted)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedEmp(emp);
                            setNotesInput(emp.hrReviewNotes || '');
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-blue-600" />}
                          className="rounded-xl font-bold cursor-pointer"
                        >
                          Review Profile
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal / Drawer */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Review Onboarding Submission</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedEmp.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Submitted Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-[11px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Candidate Submitted Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Full Legal Name</span>
                  <span className="font-bold text-slate-900">{selectedEmp.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Personal Email</span>
                  <span className="font-mono text-slate-800">{selectedEmp.personalEmail || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Phone Number</span>
                  <span className="font-mono text-slate-800">{selectedEmp.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Emergency Contact</span>
                  <span className="font-bold text-slate-800">
                    {selectedEmp.emergencyContactName || '—'} ({selectedEmp.emergencyContactPhone || '—'})
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Residential Address</span>
                  <span className="text-slate-800">{selectedEmp.address || '—'}</span>
                </div>
                {selectedEmp.skills && selectedEmp.skills.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Skills & Tech Stack</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedEmp.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmp.joiningNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Candidate Joining Notes</span>
                    <span className="text-slate-600 italic">"{selectedEmp.joiningNotes}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* HR Reviewer Action Area */}
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-bold uppercase font-mono text-slate-500 block">
                Review Notes / Feedback to Candidate
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Optional approval note or required amendment instructions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="destructive"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleReject(selectedEmp)}
                className="rounded-xl font-bold cursor-pointer"
              >
                Reject Profile
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleRequestChanges(selectedEmp)}
                  className="rounded-xl font-bold border-amber-300 text-amber-900 hover:bg-amber-50 cursor-pointer"
                >
                  Request Changes
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedEmp)}
                  leftIcon={actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  className="rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Approve Profile & Unlock Claims
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileApprovalsPage;
