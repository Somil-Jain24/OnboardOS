import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../services';
import {
  UserCheck,
  Building2,
  Briefcase,
  Users,
  Calendar,
  Lock,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  Loader2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { Employee, ProfileReviewStatus } from '../../types';

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { currentUser, activeEmployeeId } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    skillsInput: '',
    joiningNotes: '',
  });

  // Fetch current employee data
  const loadProfile = async () => {
    try {
      const empData = await client.getMyProfile();
      if (empData) {
        setEmployee(empData);
        setFormData({
          name: empData.name || currentUser?.name || '',
          personalEmail: empData.personalEmail || '',
          phone: empData.phone || '',
          emergencyContactName: empData.emergencyContactName || '',
          emergencyContactPhone: empData.emergencyContactPhone || '',
          address: empData.address || '',
          skillsInput: Array.isArray(empData.skills) ? empData.skills.join(', ') : '',
          joiningNotes: empData.joiningNotes || '',
        });

        // If already approved, automatically redirect to /me
        if (empData.profileStatus === 'APPROVED') {
          setTimeout(() => {
            navigate('/me');
          }, 1200);
        }
      }
    } catch (err: any) {
      console.warn('Failed to load employee profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Real-time automatic polling to detect HR approval without requiring logout/login
  useEffect(() => {
    if (employee?.profileStatus === 'PENDING_HR_APPROVAL' || employee?.profileStatus === 'CHANGES_REQUESTED') {
      const pollInterval = setInterval(async () => {
        try {
          const fresh = await client.getMyProfile();
          if (fresh && fresh.profileStatus !== employee.profileStatus) {
            setEmployee(fresh);
            if (fresh.profileStatus === 'APPROVED') {
              setSuccessMessage('🎉 Your onboarding profile was approved by HR! Unlocking dashboard...');
              setTimeout(() => {
                navigate('/me');
              }, 1500);
            }
          }
        } catch {}
      }, 3500);

      return () => clearInterval(pollInterval);
    }
  }, [employee?.profileStatus, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage('Full legal name is required.');
      return;
    }
    if (!formData.personalEmail.trim() || !formData.personalEmail.includes('@')) {
      setErrorMessage('A valid personal email address is required.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      setErrorMessage('A valid phone number is required.');
      return;
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      setErrorMessage('Emergency contact name and phone number are mandatory.');
      return;
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setErrorMessage('Residential address is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const skillsArray = formData.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await client.completeProfile({
        name: formData.name.trim(),
        personalEmail: formData.personalEmail.trim(),
        phone: formData.phone.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        address: formData.address.trim(),
        skills: skillsArray,
        joiningNotes: formData.joiningNotes.trim(),
      });

      if (res.success && res.data) {
        setEmployee(res.data);
        setSuccessMessage('Onboarding profile submitted successfully! Sent to People Operations for review.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit onboarding profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading your onboarding profile...</p>
      </div>
    );
  }

  const profileStatus: ProfileReviewStatus = employee?.profileStatus || 'DRAFT';

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-20">
      <PageHeader
        title="Complete Your Onboarding Profile"
        description="Verify your organization assignment and provide mandatory personal and emergency details for HR approval."
      />

      {/* Profile Review Status Banner */}
      {profileStatus === 'PENDING_HR_APPROVAL' && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">Profile Submitted & Under HR Review</h3>
              <p className="text-xs text-amber-800">
                Your submitted onboarding details are currently being verified by People Operations.
              </p>
            </div>
          </div>
          <div className="p-3.5 bg-white/80 rounded-2xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-center justify-between">
            <span>
              Self-service task claims (Slack, GitHub, Jira) will <strong>automatically unlock</strong> as soon as HR approves your submission.
            </span>
            <span className="font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ml-2">
              Auto-Checking Live
            </span>
          </div>
        </div>
      )}

      {profileStatus === 'CHANGES_REQUESTED' && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl space-y-2 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">HR Requested Adjustments</h3>
              <p className="text-xs text-rose-800">
                Please review the feedback from People Operations below, update your details, and resubmit.
              </p>
            </div>
          </div>
          {employee?.hrReviewNotes && (
            <div className="p-3.5 bg-white rounded-2xl border border-rose-200 text-xs font-mono text-rose-900">
              <strong>HR Note:</strong> "{employee.hrReviewNotes}"
            </div>
          )}
        </div>
      )}

      {profileStatus === 'REJECTED' && (
        <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Onboarding Profile Rejected</h3>
              <p className="text-xs text-slate-300">
                Your onboarding profile could not be approved at this time. Please contact HR directly.
              </p>
            </div>
          </div>
          {employee?.hrReviewNotes && (
            <div className="p-3.5 bg-slate-800 rounded-2xl border border-slate-700 text-xs font-mono text-slate-200">
              <strong>Reason:</strong> {employee.hrReviewNotes}
            </div>
          )}
          <div className="pt-1">
            <a href="mailto:people-ops@onboardos.internal">
              <Button size="sm" variant="secondary" className="rounded-xl text-xs font-bold bg-white text-slate-900">
                Contact People Operations (HR)
              </Button>
            </a>
          </div>
        </div>
      )}

      {profileStatus === 'APPROVED' && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">Profile Approved by HR!</h3>
              <p className="text-xs text-emerald-800">
                Your onboarding workspace, tool claims, and first-week schedule are fully unlocked.
              </p>
            </div>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/me')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="rounded-2xl font-bold"
          >
            Go to My Onboarding Workspace
          </Button>
        </div>
      )}

      {/* Main Form (Editable in DRAFT or CHANGES_REQUESTED) */}
      {(profileStatus === 'DRAFT' || profileStatus === 'CHANGES_REQUESTED') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Read-Only HR Assigned Information */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Organization & Role Assignment</h3>
                  <p className="text-xs text-slate-500">Configured by People Operations (Read-Only Confirmation)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold uppercase">
                HR-Owned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Work Email</span>
                <div className="font-mono font-bold text-slate-800 truncate">{employee?.email || currentUser?.email}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Job Title</span>
                <div className="font-bold text-slate-800 truncate">{employee?.roleTitle || 'Software Engineer'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Department</span>
                <div className="font-bold text-slate-800 truncate">{employee?.departmentName || 'Engineering'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Assigned Squad / Team</span>
                <div className="font-bold text-slate-800 truncate">{employee?.teamName || 'Payments Core'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Reporting Manager</span>
                <div className="font-bold text-slate-800 truncate">{employee?.managerName || 'Marcus Vance'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Employment Type & Start Date</span>
                <div className="font-bold text-slate-800 truncate">
                  {employee?.employmentType || 'FULL_TIME'} • {employee?.startDate?.split('T')[0] || '2026-09-01'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Candidate Mandatory Personal & Contact Information */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-5 shadow-card">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal & Contact Details</h3>
                <p className="text-xs text-slate-500">Provide legal and emergency contact details for verification</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Yash Jhanwar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Personal Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  placeholder="e.g. yashjhanwarphoto2@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Emergency Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g. Parent, Spouse, or Guardian"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Emergency Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Current Residential Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House / Flat No, Street, City, State, Pincode"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Joining Preferences */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-card">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Skills & Additional Preferences</h3>
                <p className="text-xs text-slate-500">Helps customize peer buddy matches and starter tickets</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Primary Skills & Tech Interests (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skillsInput}
                  onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                  placeholder="e.g. TypeScript, Node.js, React, PostgreSQL, Docker, AWS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Any Special Requests or Joining Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.joiningNotes}
                  onChange={(e) => setFormData({ ...formData, joiningNotes: e.target.value })}
                  placeholder="e.g. Hardware preferences, preferred development IDE, or accessibility notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-3xl shadow-card">
            <div className="text-xs text-slate-500">
              Submitted data will be reviewed by <strong>Sarah Chen (People Operations)</strong> before access is granted.
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              className="rounded-2xl font-bold shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              {isSubmitting ? 'Submitting for Review...' : 'Submit Profile for HR Approval'}
            </Button>
          </div>
        </form>
      )}

      {/* Read-Only Summary View When Under Review */}
      {profileStatus === 'PENDING_HR_APPROVAL' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-card">
          <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Summary of Your Submitted Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Full Legal Name</span>
              <span className="font-bold text-slate-900">{employee?.name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Personal Email</span>
              <span className="font-mono text-slate-800">{employee?.personalEmail || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Phone Number</span>
              <span className="font-mono text-slate-800">{employee?.phone || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Emergency Contact</span>
              <span className="font-bold text-slate-800">{employee?.emergencyContactName} ({employee?.emergencyContactPhone})</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Address</span>
              <span className="text-slate-800">{employee?.address || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompleteProfilePage;
