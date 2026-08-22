import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SEEDED_DEMO_USERS } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, UserCheck, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('sarah.chen@onboardos.internal');
  const [password, setPassword] = useState('OnboardOS2026!Secure');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const directRoleRedirect = (role: string) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'HR') navigate('/hr');
    else if (role === 'IT') navigate('/it');
    else if (role === 'MANAGER') navigate('/manager');
    else if (role === 'EMPLOYEE') navigate('/me');
    else navigate('/me');
  };

  const handleDirectLogin = async (demoUser: (typeof SEEDED_DEMO_USERS)[0]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(demoUser.email, demoUser.devPasswordHint);
      if (result.success && result.user) {
        directRoleRedirect(result.user.role);
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await login(email.trim(), password || 'OnboardOS2026!Secure');
      if (result.success && result.user) {
        directRoleRedirect(result.user.role);
      } else {
        setError(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden text-left font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to <span className="text-blue-600">OnboardOS</span>
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise Employee Onboarding & Identity Governance Platform
          </p>
        </div>

        {/* 1-Click Instant Demo Logins */}
        <div className="p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-200/80 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                1-Click Instant Demo Login
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              No password needed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SEEDED_DEMO_USERS.map((u) => {
              const badgeColor =
                u.role === 'HR'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200/80'
                  : u.role === 'EMPLOYEE'
                  ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200/80'
                  : u.role === 'MANAGER'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200/80'
                  : u.role === 'IT'
                  ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200/80'
                  : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200/80';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleDirectLogin(u)}
                  disabled={loading}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer shadow-xs group flex flex-col justify-between ${badgeColor}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-extrabold uppercase">
                      {u.role}
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                    {u.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Login Card */}
        <div className="p-7 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Account Credentials
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Live & Mock Ready
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.chen@onboardos.internal"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">Password</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Default: <code className="text-blue-600 font-bold font-mono">OnboardOS2026!Secure</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-2.5 rounded-2xl text-xs font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
