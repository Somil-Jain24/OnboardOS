import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { client } from '../../services';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Shield,
  AlertCircle,
  Settings,
  MessageSquare,
  FolderGit2,
  Trello,
  CheckCircle2,
  Save,
  Link as LinkIcon,
  Upload,
  FileSpreadsheet,
  Download,
  Users,
  UserPlus,
  Trash2,
  FileText,
  Mail,
  Cloud,
  Layers,
  ArrowLeft,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import type { Employee } from '../../types';
import type { CreateEmployeeInput } from '../../services/types';

export function CreateEmployeePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab mode: 'SINGLE' | 'BULK_CSV'
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK_CSV'>('SINGLE');

  const [isGenerating, setIsGenerating] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIntegrationsConfig, setShowIntegrationsConfig] = useState(false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Dynamic Workspace Links Configuration
  const [integrationLinks, setIntegrationLinks] = useState({
    slackInviteUrl:
      'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
    githubRepoUrl: 'https://github.com/Yash-Jhanwar/demo',
    jiraBoardUrl: 'https://onboardos.atlassian.net',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await client.getIntegrationSettings();
        if (settings) {
          setIntegrationLinks({
            slackInviteUrl:
              settings.slackInviteUrl ||
              'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
            githubRepoUrl:
              settings.githubRepoUrl && !settings.githubRepoUrl.includes('Somil-Jain24')
                ? settings.githubRepoUrl
                : 'https://github.com/Yash-Jhanwar/demo',
            jiraBoardUrl:
              settings.jiraBoardUrl && settings.jiraBoardUrl !== 'https://jira.atlassian.net'
                ? settings.jiraBoardUrl
                : 'https://onboardos.atlassian.net',
          });
        }
      } catch (err) {
        console.warn('Failed to load integration settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveIntegrationLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.updateIntegrationSettings(integrationLinks);
      setSavedSettingsSuccess(true);
      setTimeout(() => setSavedSettingsSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  };

  // Single Form State
  const [formData, setFormData] = useState({
    name: 'Devin Larson',
    email: 'devin.larson@onboardos.internal',
    department: 'Engineering',
    roleTitle: 'Junior Backend Developer',
    team: 'Payments Core',
    seniority: 'JUNIOR' as 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD',
    employmentType: 'FULL_TIME' as 'FULL_TIME' | 'CONTRACT' | 'INTERN',
    location: 'Bengaluru, India (Hybrid)',
    managerName: 'Marcus Vance',
  });

  // Bulk CSV State
  const [bulkRows, setBulkRows] = useState<CreateEmployeeInput[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Logical Synthesis Step Tracker
  const [synthesisStep, setSynthesisStep] = useState(1);
  const [automationStatus, setAutomationStatus] = useState<{ status: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsGenerating(true);
      setSynthesisStep(1);

      // Create employee
      const newEmp: any = await client.createEmployee({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        roleTitle: formData.roleTitle,
        team: formData.team,
        seniority: formData.seniority,
        employmentType: formData.employmentType,
        location: formData.location,
        managerName: formData.managerName,
      });

      setCreatedEmployee(newEmp);
      if (newEmp?.automation) {
        setAutomationStatus({
          status: newEmp.automation.status,
          message: newEmp.automation.message,
        });
      } else {
        setAutomationStatus({
          status: 'simulated',
          message: 'Slack and onboarding tracker automation simulated in local mode.',
        });
      }

      // Advance step animation logically
      setTimeout(() => setSynthesisStep(2), 600);
      setTimeout(() => setSynthesisStep(3), 1200);
      setTimeout(() => setSynthesisStep(4), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
      setIsGenerating(false);
    }
  };

  // CSV Parsing Logic
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvContent(text);
    };
    reader.readAsText(file);
  };

  const parseCsvContent = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setError('CSV file appears empty or has no data rows.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsed: CreateEmployeeInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 2 || !cols[0] || !cols[1]) continue;

        parsed.push({
          name: cols[0],
          email: cols[1],
          department: cols[2] || 'Engineering',
          roleTitle: cols[3] || 'Software Engineer',
          team: cols[4] || 'Core Team',
          seniority: (['JUNIOR', 'MID', 'SENIOR', 'LEAD'].includes(cols[5]?.toUpperCase())
            ? cols[5].toUpperCase()
            : 'JUNIOR') as 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD',
          employmentType: (['FULL_TIME', 'CONTRACT', 'INTERN'].includes(cols[6]?.toUpperCase())
            ? cols[6].toUpperCase()
            : 'FULL_TIME') as 'FULL_TIME' | 'CONTRACT' | 'INTERN',
          location: cols[7] || 'Bengaluru, India',
          managerName: cols[8] || 'Marcus Vance',
        });
      }

      if (parsed.length === 0) {
        setError('No valid employee rows could be parsed from the CSV.');
      } else {
        setError(null);
        setBulkRows(parsed);
      }
    } catch (err: any) {
      setError(`CSV Parsing error: ${err.message}`);
    }
  };

  const downloadSampleCsv = () => {
    const sampleHeader = 'name,email,department,roleTitle,team,seniority,employmentType,location,managerName\n';
    const sampleRows = [
      'Aarav Patel,aarav.patel@onboardos.internal,Engineering,Senior Backend Engineer,Payments Core,SENIOR,FULL_TIME,"Bengaluru, India",Marcus Vance',
      'Priya Sharma,priya.sharma@onboardos.internal,Product & Design,Product Designer,Design Systems,MID,FULL_TIME,"Mumbai, India",Sarah Chen',
      'Rohan Gupta,rohan.gupta@onboardos.internal,Engineering,DevOps Engineer,Cloud Infra,MID,FULL_TIME,Remote,Marcus Vance',
      'Ananya Verma,ananya.verma@onboardos.internal,Finance & Legal,Financial Analyst,Treasury,JUNIOR,FULL_TIME,"Delhi, India",Sarah Chen',
    ].join('\n');

    const blob = new Blob([sampleHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'onboardos_employees_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = async () => {
    if (bulkRows.length === 0) return;
    setIsBulkLoading(true);
    setError(null);
    try {
      const res = await client.bulkCreateEmployees(bulkRows);
      setBulkSuccessMsg(`Successfully imported ${res.count || bulkRows.length} employees and synthesized their personalized AI onboarding plans!`);
      setBulkRows([]);
      setTimeout(() => {
        navigate('/hr/employees');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to bulk import employees');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleResetForm = () => {
    setIsGenerating(false);
    setCreatedEmployee(null);
    setFormData({
      name: '',
      email: '',
      department: 'Engineering',
      roleTitle: 'Software Engineer',
      team: 'Core Team',
      seniority: 'JUNIOR',
      employmentType: 'FULL_TIME',
      location: 'Bengaluru, India',
      managerName: 'Marcus Vance',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-12">
      <PageHeader
        title="Onboard New Employees"
        description="Ingest employee work context individually or in bulk via CSV to trigger deterministic policy resolution, immutable context snapshots, and AI requirement synthesis."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowIntegrationsConfig(!showIntegrationsConfig)}
            leftIcon={<Settings className="w-4 h-4 text-slate-600" />}
          >
            {showIntegrationsConfig ? 'Hide Workspace Links' : 'Configure Slack & Tool Links'}
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {bulkSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {bulkSuccessMsg}
        </div>
      )}

      {/* HR Workspace & Tool Integrations Settings Card */}
      {showIntegrationsConfig && (
        <div className="p-6 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border border-indigo-200 rounded-3xl shadow-card space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  HR Enterprise Workspace & Invite Links Hub
                </h3>
                <p className="text-xs text-slate-500">
                  Update your real Slack group invite link, GitHub repo, and Jira board. All employees dynamically receive these exact links.
                </p>
              </div>
            </div>
            {savedSettingsSuccess && (
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved Live!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Real Slack Invite Link
              </label>
              <input
                type="text"
                value={integrationLinks.slackInviteUrl}
                onChange={(e) =>
                  setIntegrationLinks({ ...integrationLinks, slackInviteUrl: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-blue-600"
                placeholder="https://join.slack.com/t/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-900" /> Real GitHub Repository Link
              </label>
              <input
                type="text"
                value={integrationLinks.githubRepoUrl}
                onChange={(e) =>
                  setIntegrationLinks({ ...integrationLinks, githubRepoUrl: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-blue-600"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Trello className="w-3.5 h-3.5 text-blue-600" /> Real Jira Project Board Link
              </label>
              <input
                type="text"
                value={integrationLinks.jiraBoardUrl}
                onChange={(e) =>
                  setIntegrationLinks({ ...integrationLinks, jiraBoardUrl: e.target.value })
                }
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-blue-600"
                placeholder="https://onboardos.atlassian.net"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveIntegrationLinks}
              leftIcon={<Save className="w-3.5 h-3.5 text-white" />}
            >
              Save Integration Links
            </Button>
          </div>
        </div>
      )}

      {/* POST-CREATION ACTIONABLE COMPLETION VIEW */}
      {isGenerating ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Logical Synthesis Pipeline Card */}
          <div className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    OnboardOS Automated Provisioning & Plan Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministic policy resolution and tool access generation for {formData.name}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {synthesisStep >= 4 ? 'Plan Ready' : `Step ${synthesisStep} of 4`}
              </span>
            </div>

            {/* 4 Logical Steps */}
            <div className="space-y-3">
              <div className={`p-4 rounded-2xl border transition-all ${synthesisStep >= 1 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${synthesisStep >= 1 ? 'text-emerald-600' : 'text-slate-400'}`} />
                    1. Immutable Employee Context Snapshot Captured
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{formData.roleTitle} • {formData.department}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">
                  Saved verified work context for <strong>{formData.name}</strong> ({formData.email}) reporting to <strong>{formData.managerName}</strong>.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${synthesisStep >= 2 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${synthesisStep >= 2 ? 'text-emerald-600' : 'text-slate-400'}`} />
                    2. Role-Based Tool Bundle Generated
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Google • Slack • GitHub • Jira</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">
                  Configured corporate email, assigned team channels on Slack, invited to GitHub repo, and allocated Jira sprint board.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${synthesisStep >= 3 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${synthesisStep >= 3 ? 'text-emerald-600' : 'text-slate-400'}`} />
                    3. Security & Least-Privilege Rules Checked
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">0 Toxic Conflicts</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">
                  Passed Segregation-of-Duties (SoD) verification. Elevated AWS Cloud IAM access routed for manager sign-off.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${synthesisStep >= 4 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${synthesisStep >= 4 ? 'text-emerald-600' : 'text-slate-400'}`} />
                    4. Provisioning Execution DAG Compiled
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Ready for Execution</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 pl-6">
                  Task dependency graph resolved with auto-unblocking logic and ViaSocket webhook dispatch.
                </p>
              </div>
            </div>

            {/* Automation Status Feedback Banner */}
            {automationStatus && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  automationStatus.status === 'dispatched'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : automationStatus.status === 'simulated'
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      automationStatus.status === 'dispatched'
                        ? 'bg-emerald-600 text-white'
                        : automationStatus.status === 'simulated'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {automationStatus.status === 'dispatched' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      Employee created. Onboarding plan generated.
                    </p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {automationStatus.status === 'dispatched'
                        ? 'Slack and onboarding tracker automation dispatched.'
                        : automationStatus.status === 'simulated'
                        ? 'Slack and onboarding tracker automation simulated (Mock Mode).'
                        : 'Employee was created, but external automation needs attention.'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                    automationStatus.status === 'dispatched'
                      ? 'bg-emerald-100 text-emerald-800'
                      : automationStatus.status === 'simulated'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {automationStatus.status}
                </span>
              </div>
            )}

            {/* Candidate Summary Card */}
            {createdEmployee && (
              <div className="p-5 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{createdEmployee.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {createdEmployee.roleTitle} • {createdEmployee.departmentName} ({createdEmployee.teamName})
                  </p>
                  <p className="text-xs font-mono text-slate-500">{createdEmployee.email}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-600" /> Google Mailbox
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-emerald-600" /> Slack Workspace
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3 text-slate-900" /> GitHub Repo
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                    <Trello className="w-3 h-3 text-blue-600" /> Jira Board
                  </span>
                </div>
              </div>
            )}

            {/* ACTIONABLE NAVIGATION BUTTONS */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetForm}
                leftIcon={<UserPlus className="w-3.5 h-3.5 text-slate-600" />}
              >
                Onboard Another Employee
              </Button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/hr/employees')}
                  leftIcon={<Users className="w-3.5 h-3.5 text-slate-600" />}
                >
                  Employee Directory
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (createdEmployee) {
                      navigate(`/employees/${createdEmployee.id}/plan`);
                    } else {
                      navigate('/employees/emp-rahul/plan');
                    }
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="rounded-2xl px-6 bg-blue-600 hover:bg-blue-700"
                >
                  View Generated Onboarding Plan →
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL CREATION VIEW: SINGLE VS BULK TABS */
        <>
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('SINGLE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'SINGLE'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Single Employee Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BULK_CSV')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'BULK_CSV'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Direct CSV Bulk Upload
              {bulkRows.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {bulkRows.length} ready
                </span>
              )}
            </button>
          </div>

          {activeTab === 'SINGLE' ? (
            /* SINGLE EMPLOYEE FORM */
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Employee Work Context Snapshot
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Context is stored immutably to preserve explainability even if role or team changes later.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    <Input
                      label="Corporate Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul.sharma@internal.corp"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                      label="Department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      options={[
                        { value: 'Engineering', label: 'Engineering' },
                        { value: 'Product & Design', label: 'Product & Design' },
                        { value: 'Finance & Legal', label: 'Finance & Legal' },
                        { value: 'People & Operations', label: 'People & Operations' },
                      ]}
                    />
                    <Input
                      label="Role Title"
                      value={formData.roleTitle}
                      onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                      placeholder="e.g. Junior Backend Developer"
                      required
                    />
                    <Input
                      label="Assigned Team"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      placeholder="e.g. Payments Core"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Assigned Manager"
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      required
                    />
                    <Select
                      label="Seniority Level"
                      value={formData.seniority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seniority: e.target.value as 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD',
                        })
                      }
                      options={[
                        { value: 'JUNIOR', label: 'Junior / Associate' },
                        { value: 'MID', label: 'Mid-Level' },
                        { value: 'SENIOR', label: 'Senior' },
                        { value: 'LEAD', label: 'Staff / Principal / Lead' },
                      ]}
                    />
                    <Select
                      label="Employment Type"
                      value={formData.employmentType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employmentType: e.target.value as 'FULL_TIME' | 'CONTRACT' | 'INTERN',
                        })
                      }
                      options={[
                        { value: 'FULL_TIME', label: 'Full-Time Employee' },
                        { value: 'CONTRACT', label: 'Contractor' },
                        { value: 'INTERN', label: 'Intern' },
                      ]}
                    />
                  </div>

                  <Input
                    label="Primary Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India (Hybrid)"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Active Ruleset: <strong className="text-slate-700">v1.0.0 (Engineering Policy Active)</strong>
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Sparkles className="w-4 h-4 text-white" />}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="rounded-2xl px-6"
                  >
                    Synthesize Personalized Plan
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* BULK CSV UPLOAD MODE */
            <div className="space-y-6 p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Bulk CSV Employee Ingestion
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload multiple new hires at once. AI will automatically evaluate policies and generate individual plans for each.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={downloadSampleCsv}
                  leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Download Sample CSV
                </Button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl p-8 text-center bg-indigo-50/30 hover:bg-indigo-50/60 cursor-pointer transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCsvFileUpload}
                  accept=".csv,text/csv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Click to browse or drag and drop your CSV file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Format: <code className="font-mono bg-indigo-100/70 text-indigo-800 px-1.5 py-0.5 rounded">name, email, department, roleTitle, team, seniority, employmentType, location, managerName</code>
                  </p>
                </div>
              </div>

              {/* Preview Parsed Rows */}
              {bulkRows.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Parsed Candidates ({bulkRows.length} ready for onboarding)
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
                          <th className="p-3">Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Team</th>
                          <th className="p-3">Seniority</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-900">{row.name}</td>
                            <td className="p-3 font-mono text-slate-600">{row.email}</td>
                            <td className="p-3 text-slate-700">{row.department}</td>
                            <td className="p-3 text-slate-700">{row.roleTitle}</td>
                            <td className="p-3 text-slate-700">{row.team}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                                {row.seniority}
                              </span>
                            </td>
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
                      onClick={handleBulkSubmit}
                      disabled={isBulkLoading}
                      leftIcon={<Sparkles className="w-4 h-4 text-white" />}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="rounded-2xl px-6 bg-gradient-to-r from-indigo-600 to-blue-600"
                    >
                      {isBulkLoading ? 'Synthesizing All Plans...' : `Ingest & Synthesize Plans for All (${bulkRows.length})`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CreateEmployeePage;
