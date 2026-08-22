import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  UserMinus,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Lock,
  Trash2,
  Search,
  KeyRound,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Employee } from '../../types';

export function HROffboardingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'BULK_CSV'>('MANUAL');

  // Manual Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [exitDate, setExitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('RESIGNATION');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [revocationResult, setRevocationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Bulk CSV State
  const [bulkRows, setBulkRows] = useState<Array<{ email: string; reason: string; exitDate: string }>>([]);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await client.getEmployees();
      setEmployees(data);
      const active = data.filter((e) => e.status !== 'OFFBOARDED');
      if (active.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(active[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeEmployees = employees.filter((e) => e.status !== 'OFFBOARDED');
  const offboardedEmployees = employees.filter((e) => e.status === 'OFFBOARDED');

  const handleManualOffboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    setIsProcessing(true);
    setError(null);
    setRevocationResult(null);

    try {
      const res = await client.offboardEmployee(selectedEmployeeId, {
        exitDate,
        reason,
        notes,
      });
      setRevocationResult(res);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to execute offboarding revocation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseOffboardingCsv(text);
    };
    reader.readAsText(file);
  };

  const parseOffboardingCsv = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setError('CSV file appears empty or has no data rows.');
        return;
      }

      const parsed: Array<{ email: string; reason: string; exitDate: string }> = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 1 || !cols[0]) continue;
        parsed.push({
          email: cols[0],
          reason: cols[1] || 'CONTRACT_COMPLETED',
          exitDate: cols[2] || new Date().toISOString().split('T')[0],
        });
      }

      if (parsed.length === 0) {
        setError('No valid rows found in offboarding CSV.');
      } else {
        setError(null);
        setBulkRows(parsed);
      }
    } catch (err: any) {
      setError(`CSV Parsing error: ${err.message}`);
    }
  };

  const downloadSampleOffboardingCsv = () => {
    const sampleHeader = 'email,reason,exitDate\n';
    const sampleRows = [
      'rahul.sharma@onboardos.internal,RESIGNATION,2026-08-31',
      'devin.larson@onboardos.internal,CONTRACT_COMPLETED,2026-09-15',
    ].join('\n');

    const blob = new Blob([sampleHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'onboardos_offboarding_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkOffboardSubmit = async () => {
    if (bulkRows.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setBulkResult(null);

    try {
      const res = await client.bulkOffboardEmployees(bulkRows);
      setBulkResult(res);
      setBulkRows([]);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to process bulk offboarding');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left pb-12">
      <PageHeader
        title="Employee Offboarding & Access Revocation Center"
        description="Safely offboard departing personnel with zero-trust automated credential revocation across Google, Slack, GitHub, Jira, and AWS Cloud."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Workforce</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{activeEmployees.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Compliant & Provisioned</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offboarded Personnel</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{offboardedEmployees.length}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-0.5">100% Access Revoked</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <UserMinus className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Ledger</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">SOC-2 Type II</p>
            <p className="text-[11px] text-indigo-500 font-medium mt-0.5">Automated Certificates</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => {
            setActiveTab('MANUAL');
            setRevocationResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MANUAL'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserMinus className="w-3.5 h-3.5" />
          Single Employee Offboarding
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('BULK_CSV');
            setRevocationResult(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BULK_CSV'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Bulk CSV Offboarding
          {bulkRows.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              {bulkRows.length} loaded
            </span>
          )}
        </button>
      </div>

      {/* MANUAL MODE */}
      {activeTab === 'MANUAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Select Employee & Offboard */}
          <div className="lg:col-span-7 space-y-6">
            <form
              onSubmit={handleManualOffboard}
              className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5"
            >
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                    <UserMinus className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Initiate Access Revocation Workflow
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Selecting an employee will execute atomic credential deactivations across Google, Slack, GitHub, Jira, and AWS.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Active Employee to Offboard
                  </label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl font-medium text-slate-900 focus:ring-2 focus:ring-rose-500"
                    required
                  >
                    {activeEmployees.length === 0 ? (
                      <option value="">No active employees</option>
                    ) : (
                      activeEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} — {emp.roleTitle} ({emp.departmentName}) • {emp.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {selectedEmployee && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{selectedEmployee.name}</p>
                      <p className="text-slate-500">{selectedEmployee.departmentName} • {selectedEmployee.teamName}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 font-bold text-[10px]">
                      Currently Active
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Exit Date"
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    required
                  />
                  <Select
                    label="Departure Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    options={[
                      { value: 'RESIGNATION', label: 'Voluntary Resignation' },
                      { value: 'CONTRACT_COMPLETED', label: 'Contract / Project Completed' },
                      { value: 'INTERNAL_TERMINATION', label: 'Involuntary Termination' },
                      { value: 'MUTUAL_SEPARATION', label: 'Mutual Separation' },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Offboarding & Compliance Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Asset laptop returned, NDA signed, exit interview concluded."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  Irreversible automated zero-trust execution
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isProcessing || !selectedEmployeeId}
                  leftIcon={<Lock className="w-4 h-4 text-white" />}
                  className="bg-rose-600 hover:bg-rose-700 rounded-2xl px-5"
                >
                  {isProcessing ? 'Revoking All Privileges...' : 'Execute Complete Access Revocation'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Panel: Live Revocation Status Card */}
          <div className="lg:col-span-5 space-y-4">
            {revocationResult ? (
              <div className="p-6 bg-gradient-to-br from-rose-50/80 via-white to-slate-50 border border-rose-200 rounded-3xl shadow-card space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Access Revocation Confirmed</h4>
                    <p className="text-[11px] font-mono text-rose-700">{revocationResult.certificateId}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  All enterprise accounts and OAuth tokens for <strong>{revocationResult.employee.name}</strong> were immediately terminated.
                </p>

                <div className="space-y-2 pt-1">
                  {revocationResult.revocations.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-rose-600" />
                          {item.system}
                        </p>
                        <p className="text-[11px] text-slate-500">{item.action}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                        REVOKED
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono flex items-center justify-between">
                  <span>SOC-2 Audit Log:</span>
                  <span className="text-emerald-400">{revocationResult.auditId}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Revocation Pipeline Preview</h4>
                </div>
                <p className="text-xs text-slate-500">
                  When you initiate offboarding, the following 5 adapters execute in parallel:
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">1. Google Workspace</span>
                    <span className="text-slate-500 text-[11px]">Suspend Mail & SSO</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">2. Slack Enterprise Grid</span>
                    <span className="text-slate-500 text-[11px]">Deactivate & Channel Ejection</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">3. GitHub Enterprise</span>
                    <span className="text-slate-500 text-[11px]">Org & Repo Access Removal</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">4. Jira Software</span>
                    <span className="text-slate-500 text-[11px]">Board Revoke & Ticket Reassign</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">5. AWS Cloud IAM</span>
                    <span className="text-slate-500 text-[11px]">Delete IAM Keys & Role Session</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK CSV OFFBOARDING MODE */}
      {activeTab === 'BULK_CSV' && (
        <div className="space-y-6 p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bulk CSV Employee Offboarding
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a departing employee roster. All access will be revoked across all systems simultaneously in a single atomic batch.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={downloadSampleOffboardingCsv}
              leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Download Offboarding CSV Template
            </Button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rose-200 hover:border-rose-500 rounded-3xl p-8 text-center bg-rose-50/20 hover:bg-rose-50/50 cursor-pointer transition-all space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCsvFileUpload}
              accept=".csv,text/csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 shadow-sm border border-rose-100 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Click to browse or drag and drop your Offboarding CSV
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Format: <code className="font-mono bg-rose-100/70 text-rose-800 px-1.5 py-0.5 rounded">email, reason, exitDate</code>
              </p>
            </div>
          </div>

          {bulkResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {bulkResult.message}
            </div>
          )}

          {bulkRows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserMinus className="w-4 h-4 text-rose-600" />
                  Departing Personnel ({bulkRows.length} ready for revocation)
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setBulkRows([])}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Clear All
                </Button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Corporate Email</th>
                      <th className="p-3">Departure Reason</th>
                      <th className="p-3">Exit Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{row.email}</td>
                        <td className="p-3 text-slate-700">{row.reason}</td>
                        <td className="p-3 font-mono text-slate-600">{row.exitDate}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setBulkRows(bulkRows.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleBulkOffboardSubmit}
                  disabled={isProcessing}
                  leftIcon={<Lock className="w-4 h-4 text-white" />}
                  className="rounded-2xl px-6 bg-rose-600 hover:bg-rose-700"
                >
                  {isProcessing ? 'Revoking All Privileges in Batch...' : `Execute Bulk Access Revocation (${bulkRows.length})`}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offboarded Employees Registry Table */}
      <div className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Offboarded Personnel Registry</h3>
              <p className="text-xs text-slate-500">Historical records of completed access revocations</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
            Total Offboarded: {offboardedEmployees.length}
          </span>
        </div>

        {offboardedEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No employees have been offboarded yet. Use the form above to execute access revocations.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Department & Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Revoked Systems</th>
                  <th className="p-3.5">Offboarding Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offboardedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{emp.name}</p>
                      <p className="font-mono text-[11px] text-slate-500">{emp.email}</p>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <p className="font-medium">{emp.roleTitle}</p>
                      <p className="text-[11px] text-slate-500">{emp.departmentName}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        OFFBOARDED
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">Google</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">Slack</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">GitHub</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">Jira</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">AWS</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(emp.updatedAt || emp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HROffboardingPage;
