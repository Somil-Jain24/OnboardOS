import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightLeft,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Users,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface TransferRoleOption {
  id: string;
  title: string;
  department: string;
  team: string;
  seniority: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
  description: string;
  manager: string;
  revokedResources: {
    name: string;
    type: 'REPO' | 'IAM' | 'SLACK' | 'JIRA' | 'TOOL';
    reason: string;
  }[];
  newResources: {
    name: string;
    type: 'REPO' | 'IAM' | 'SLACK' | 'JIRA' | 'TOOL';
    accessLevel: string;
  }[];
  sodCheck: {
    passed: boolean;
    conflictsFound: number;
    notes: string;
  };
}

export function InternalTransferPage() {
  const { activeEmployeeId, currentUser } = useAuth();
  const effectiveEmployeeId =
    currentUser?.role === 'EMPLOYEE' && currentUser.employeeId
      ? currentUser.employeeId
      : activeEmployeeId || 'emp-rahul';
  const { employee } = useEmployee(effectiveEmployeeId);

  const availableRoles: TransferRoleOption[] = [
    {
      id: 'role-sr-backend',
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      team: 'Payments Core',
      seniority: 'SENIOR',
      description: 'Architecting high-throughput payment transaction pipelines and ledger synchronization microservices.',
      manager: employee?.managerName || 'Marcus Vance',
      revokedResources: [
        { name: 'Junior Sandbox Staging IAM Role', type: 'IAM', reason: 'Upgraded to Elevated Senior Cloud Role' },
        { name: 'Temporary Developer Read-Only Token', type: 'TOOL', reason: 'Replaced with Full Write Grants' },
      ],
      newResources: [
        { name: 'AWS Production Deployment IAM Role (Assumed)', type: 'IAM', accessLevel: 'Deploy / Release' },
        { name: 'Payment Core Gateway v2 Primary Repo', type: 'REPO', accessLevel: 'Admin / Maintainer' },
        { name: 'Datadog & PagerDuty On-Call Alerts', type: 'TOOL', accessLevel: 'Tier 1 Incident Responder' },
        { name: 'Slack #payments-leads & #eng-architecture', type: 'SLACK', accessLevel: 'Channel Member' },
      ],
      sodCheck: {
        passed: true,
        conflictsFound: 0,
        notes: 'Pre-check PASSED: Senior engineering privileges comply with Dual-Custody Payment rule.',
      },
    },
    {
      id: 'role-devops-eng',
      title: 'DevOps & Cloud Platform Engineer',
      department: 'Engineering',
      team: 'Cloud Infrastructure',
      seniority: 'MID',
      description: 'Managing Kubernetes clusters, Terraform infrastructure-as-code, and zero-downtime CI/CD deployment pipelines.',
      manager: 'David Kim',
      revokedResources: [
        { name: 'Payments Gateway Application Code Repo Write Access', type: 'REPO', reason: 'SoD Separation of Infrastructure vs Application' },
        { name: 'Local Mock Database Admin Credentials', type: 'TOOL', reason: 'Migrated to Central Secret Manager' },
        { name: 'Slack #payments-sprint Channel', type: 'SLACK', reason: 'Moved to #cloud-infra squad' },
      ],
      newResources: [
        { name: 'Kubernetes Production Cluster Admin Kubeconfig', type: 'IAM', accessLevel: 'Cluster Admin' },
        { name: 'Terraform Cloud Enterprise Workspace', type: 'TOOL', accessLevel: 'Plan & Apply' },
        { name: 'AWS Infrastructure Root Accounts & VPC Peering', type: 'IAM', accessLevel: 'Infra Admin' },
        { name: 'Slack #cloud-infra & #incident-command', type: 'SLACK', accessLevel: 'Squad Member' },
      ],
      sodCheck: {
        passed: true,
        conflictsFound: 0,
        notes: 'Pre-check PASSED: Infrastructure write permissions isolated from application code.',
      },
    },
    {
      id: 'role-product-designer',
      title: 'Product & Design Systems Specialist',
      department: 'Product & Design',
      team: 'Design Systems',
      seniority: 'MID',
      description: 'Leading Figma component library tokens, interactive UX research, and product design prototypes.',
      manager: 'Elena Rostova',
      revokedResources: [
        { name: 'AWS Cloud Developer Staging Access', type: 'IAM', reason: 'Least-privilege: Not required for Design role' },
        { name: 'GitHub Core Microservices Push Permissions', type: 'REPO', reason: 'Revoked write permissions' },
        { name: 'Jira Payments Backend Sprint Board', type: 'JIRA', reason: 'Transferred to Design Sprint Board' },
      ],
      newResources: [
        { name: 'Figma Enterprise Organization Full Editor Seat', type: 'TOOL', accessLevel: 'Full Design Editor' },
        { name: 'Design Tokens & UI Component Repository', type: 'REPO', accessLevel: 'Design Contributor' },
        { name: 'Miro & UserTesting Enterprise Workspace', type: 'TOOL', accessLevel: 'Research Lead' },
        { name: 'Slack #design-systems & #product-ux', type: 'SLACK', accessLevel: 'Squad Member' },
      ],
      sodCheck: {
        passed: true,
        conflictsFound: 0,
        notes: 'Pre-check PASSED: Transition from Engineering to Product clean with zero security residue.',
      },
    },
    {
      id: 'role-secops-analyst',
      title: 'Security & Compliance Analyst',
      department: 'Security & Operations',
      team: 'SecOps & Compliance',
      seniority: 'SENIOR',
      description: 'Auditing access entitlements, monitoring SoD toxic combinations, and conducting SOC 2 Type II compliance reviews.',
      manager: 'Elena Rostova',
      revokedResources: [
        { name: 'Direct Application Code Push Rights', type: 'REPO', reason: 'Mandatory SoD: Auditor cannot commit code' },
        { name: 'Direct Cloud Infrastructure Deployment Rights', type: 'IAM', reason: 'Separation of duties rule' },
      ],
      newResources: [
        { name: 'OnboardOS Audit Log & Compliance Engine Admin', type: 'TOOL', accessLevel: 'Compliance Auditor' },
        { name: 'AWS CloudTrail & GuardDuty Read-Only Security Hub', type: 'IAM', accessLevel: 'Security Auditor' },
        { name: 'Vanta / Drata SOC 2 Automated Evidence Suite', type: 'TOOL', accessLevel: 'Audit Lead' },
        { name: 'Slack #secops-alerts & #compliance-leads', type: 'SLACK', accessLevel: 'Channel Member' },
      ],
      sodCheck: {
        passed: true,
        conflictsFound: 0,
        notes: 'Pre-check PASSED: Direct code commit rights automatically scheduled for revocation upon approval.',
      },
    },
  ];

  const [selectedRole, setSelectedRole] = useState<TransferRoleOption>(availableRoles[0]);
  const [justification, setJustification] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<{
    id: string;
    roleTitle: string;
    managerName: string;
    submittedAt: string;
  } | null>(null);

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate transfer request submission
    setTimeout(() => {
      setSubmittedRequest({
        id: `trq-${Date.now().toString(36)}`,
        roleTitle: selectedRole.title,
        managerName: employee?.managerName || 'Marcus Vance',
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left pb-16">
      <PageHeader
        title="Internal Role Transfer & Entitlement Delta Center"
        description="Explore open internal positions, preview real-time access revocation & allotment impacts, and submit transition requests to your manager."
      />

      {/* Current Position Snapshot Banner */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Current Active Position</div>
            <h3 className="text-sm font-bold text-slate-900">{employee?.roleTitle || 'Software Engineer'}</h3>
            <p className="text-xs text-slate-500">{employee?.departmentName || 'Engineering'} • {employee?.teamName || 'Payments Core'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80">
          <Users className="w-4 h-4 text-slate-400" />
          <span>Reporting Manager: <strong>{employee?.managerName || 'Marcus Vance'}</strong></span>
        </div>
      </div>

      {/* Submission Success Confirmation */}
      {submittedRequest && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">Internal Transfer Request Submitted!</h3>
              <p className="text-xs text-emerald-800">
                Request ID <strong className="font-mono">{submittedRequest.id}</strong> has been routed to{' '}
                <strong>{submittedRequest.managerName}</strong> for approval.
              </p>
            </div>
          </div>
          <div className="text-xs text-emerald-900 bg-white/70 p-3 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
            <span>Target Role: <strong>{submittedRequest.roleTitle}</strong></span>
            <span>Status: <strong className="text-amber-700">⏳ Pending Manager Sign-off</strong></span>
          </div>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            Select Target Transition Role
          </h3>
          <span className="text-xs text-slate-500 font-medium">{availableRoles.length} Open Positions Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableRoles.map((role) => {
            const isSelected = selectedRole.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'bg-white border-slate-200/90 text-slate-900 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className={`text-[10px] font-bold uppercase font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {role.department}
                  </div>
                  <h4 className="font-bold text-xs mt-0.5">{role.title}</h4>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {role.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/30 text-[10px] font-bold">
                  <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {role.seniority}
                  </span>
                  <span className={isSelected ? 'text-blue-200' : 'text-blue-600'}>
                    Select ➔
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Entitlement Delta & Impact Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Revoked Access Card */}
        <div className="p-6 bg-white border border-rose-200 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Privileges to be Revoked</h4>
              <p className="text-[11px] text-slate-500">Access automatically decommissioned upon role switch</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {selectedRole.revokedResources.map((res, idx) => (
              <div key={idx} className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {res.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                    {res.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{res.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newly Allotted Access Card */}
        <div className="p-6 bg-white border border-emerald-200 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">New Resources to be Allotted</h4>
              <p className="text-[11px] text-slate-500">Birthright entitlements granted for {selectedRole.title}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {selectedRole.newResources.map((res, idx) => (
              <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {res.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    {res.type}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">Access Level: {res.accessLevel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separation of Duties (SoD) Pre-Check Card */}
      <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-3xl flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-blue-950">
          <div className="font-bold flex items-center gap-2">
            Automated Least-Privilege & SoD Pre-Evaluation
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              ✓ Pre-Check Passed
            </span>
          </div>
          <p className="text-blue-800 leading-relaxed">
            {selectedRole.sodCheck.notes}
          </p>
        </div>
      </div>

      {/* Transfer Request Submission Form */}
      <form onSubmit={handleSubmitTransfer} className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Submit Role Transition Justification</h4>
          <p className="text-xs text-slate-500">
            Provide context for your manager (<strong>{employee?.managerName || 'Marcus Vance'}</strong>) detailing your interest and readiness for {selectedRole.title}.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
            Transfer Motivation & Justification
          </label>
          <textarea
            required
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="e.g. I have completed core payments onboarding and look forward to transitioning into the Senior Backend role to lead architectural improvements..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            Destination Squad: <strong>{selectedRole.team}</strong> • Lead: <strong>{selectedRole.manager}</strong>
          </div>

          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
            className="rounded-2xl font-bold shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? 'Submitting Request...' : `Send Request for ${selectedRole.title}`}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InternalTransferPage;
