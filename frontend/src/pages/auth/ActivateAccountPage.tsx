import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { client } from '../../services';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  User,
  Building,
  Briefcase,
  Calendar,
  KeyRound,
} from 'lucide-react';
import type { Employee } from '../../types';

export function ActivateAccountPage() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { setCurrentUser, switchRole, setActiveEmployeeId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [employee, setEmployee] = useState<Partial<Employee> | null>(null);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [isSupabaseSession, setIsSupabaseSession] = useState(false);

  // Validate activation token or Supabase Auth session on mount
  useEffect(() => {
    async function validateActivation() {
      // 1. Check if Supabase session exists
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session && sessionData.session.user) {
        setIsSupabaseSession(true);
        setIsValid(true);
        const user = sessionData.session.user;
        const meta = user.user_metadata || {};

        let candidateName = meta.name || user.email?.split('@')[0] || 'Employee';
        let candidateRole = meta.role_title || 'Software Engineer';
        let candidateDept = meta.department || 'Engineering';
        let candidateId = meta.employee_id || user.id;

        try {
          const { data: dbEmp } = await supabase.from('employees').select('*').eq('email', user.email).single();
          if (dbEmp) {
            candidateName = dbEmp.name || candidateName;
            candidateRole = dbEmp.role_title || candidateRole;
            candidateDept = dbEmp.department_name || candidateDept;
            candidateId = dbEmp.id || candidateId;
          }
        } catch {}

        setEmployee({
          id: candidateId,
          name: candidateName,
          email: user.email || '',
          roleTitle: candidateRole,
          departmentName: candidateDept,
        });
        setLoading(false);
        return;
      }

      // 2. Otherwise validate raw token if provided
      if (!token) {
        setErrorMessage('No activation token provided. Please use the link sent to your work email.');
        setLoading(false);
        return;
      }

      try {
        const res = await client.validateActivationToken(token);
        if (res.valid && res.employee) {
          setIsValid(true);
          setEmployee(res.employee);
          setExpiresAt(res.expiresAt || '');
        } else {
          setIsValid(false);
          setErrorMessage(res.error || 'This activation link is invalid or has expired.');
        }
      } catch (err: any) {
        setIsValid(false);
        setErrorMessage(err.message || 'Unable to validate activation token.');
      } finally {
        setLoading(false);
      }
    }

    validateActivation();
  }, [token]);

  // Password strength calculation (12+ characters, uppercase, lowercase, number, special character)
  const hasMinLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (strengthScore <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (strengthScore <= 4) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Strong (Enterprise Compliant)', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const isFormValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && passwordsMatch;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      if (isSupabaseSession) {
        // Update password via Supabase Auth
        const { error: updateErr } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateErr) {
          throw updateErr;
        }

        // Mark employee status ACTIVE in Supabase
        if (employee?.email) {
          try {
            await supabase.from('employees').update({
              status: 'ACTIVE',
              activated_at: new Date().toISOString(),
            }).eq('email', employee.email);
          } catch {}
        }

        setActivationSuccess(true);

        const targetRole = 'EMPLOYEE';
        const actualEmployeeId = employee?.id || (employee?.email ? `emp-${employee.email.split('@')[0]}` : 'emp-activated');
        const activatedUser = {
          id: actualEmployeeId ? `usr-${actualEmployeeId}` : 'usr-activated',
          name: employee?.name || 'Employee',
          email: employee?.email || '',
          role: 'EMPLOYEE' as const,
          employeeId: actualEmployeeId,
          avatarUrl: '',
        };

        setCurrentUser(activatedUser);
        setActiveEmployeeId(actualEmployeeId);

        const rolePath = '/me';

        setTimeout(() => {
          navigate(rolePath);
        }, 1200);
      } else if (token) {
        const res = await client.activateAccount(token, password);
        if (res.success && res.user) {
          setActivationSuccess(true);

          const rolePath = '/me';
          window.history.replaceState({}, document.title, window.location.pathname.replace(/\/activate\/.*$/, rolePath));

          const actualEmployeeId = res.user.employeeId || employee?.id || (employee?.email ? `emp-${employee.email.split('@')[0]}` : 'emp-activated');
          const activatedUser = {
            id: res.user.id || `usr-${actualEmployeeId}`,
            name: res.user.name || employee?.name || 'Employee',
            email: res.user.email || employee?.email || '',
            role: 'EMPLOYEE' as const,
            employeeId: actualEmployeeId,
            avatarUrl: '',
          };

          setCurrentUser(activatedUser);
          setActiveEmployeeId(actualEmployeeId);

          setTimeout(() => {
            navigate(rolePath);
          }, 1200);
        } else {
          setErrorMessage(res.error || 'Account activation failed. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to set password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-400 mb-4 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">OnboardOS</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Enterprise Access & Identity Orchestration</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-white shadow-2xl">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <h3 className="text-base font-semibold">Validating Security Token...</h3>
            <p className="text-xs text-slate-400 mt-1">Authenticating single-use activation credentials.</p>
          </div>
        )}

        {/* Error / Invalid Link State */}
        {!loading && !isValid && (
          <div className="bg-white/10 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 text-center text-white shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Activation Link Invalid</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">{errorMessage}</p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-lg"
              >
                Go to Work Login
              </Link>
            </div>
          </div>
        )}

        {/* Activation Form */}
        {!loading && isValid && !activationSuccess && (
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 bg-blue-50 font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  {isSupabaseSession ? 'Enterprise Secure Auth' : 'One-Time Invitation'}
                </span>
                {expiresAt && (
                  <span className="text-[10px] font-mono text-slate-500">
                    Expires: {new Date(expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3">Activate Your Workspace</h2>
              <p className="text-xs text-slate-500 mt-1">
                Create a compliant enterprise password to initialize your role-based tools and claims.
              </p>
            </div>

            {/* Candidate Context Card */}
            {employee && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee</span>
                    <span className="font-semibold text-slate-800">{employee.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Position</span>
                    <span className="font-semibold text-slate-800">{employee.roleTitle || 'Developer'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                    <span className="font-semibold text-slate-800">{employee.departmentName || 'Engineering'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Email</span>
                    <span className="font-mono text-slate-700 truncate block max-w-[130px]">{employee.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong 12+ character password"
                    className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Policy 5-Point Indicator */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">Enterprise Password Policy</span>
                  {password && <span className={getStrengthLabel().text}>{getStrengthLabel().label}</span>}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>12+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpperCase ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasLowerCase ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Numbers (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecialChar ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Special character (!@#)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Initializing Workspace...</span>
                ) : (
                  <>
                    <span>Set Password & Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Success State */}
        {activationSuccess && (
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-slate-200/80 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Account Successfully Activated</h2>
              <p className="text-xs text-slate-500 mt-2">
                Your credentials are saved. Redirecting to your employee onboarding workspace...
              </p>
            </div>
            <div className="inline-block animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
