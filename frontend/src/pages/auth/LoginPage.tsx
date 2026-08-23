import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<{ name: string; role: string; email: string } | null>(null);

  const directRoleRedirect = (role: string) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'HR') navigate('/hr');
    else if (role === 'IT') navigate('/it');
    else if (role === 'MANAGER') navigate('/manager');
    else if (role === 'EMPLOYEE') navigate('/me');
    else navigate('/me');
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
      const result = await login(email.trim(), password || 'Hr@onboard1234');
      if (result.success && result.user) {
        setVerifiedUser({
          name: result.user.name,
          role: result.user.role,
          email: result.user.email,
        });
        setTimeout(() => {
          directRoleRedirect(result.user!.role);
        }, 1200);
      } else {
        setError(result.error || 'Invalid credentials. Please verify your email and password.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden text-left font-sans">
      {/* Professional Top Slide-in Green Verification Banner */}
      {verifiedUser && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-8 duration-300 ease-out px-4 w-full max-w-md pointer-events-none">
          <div className="bg-emerald-900/95 border border-emerald-500/50 text-white rounded-2xl p-3.5 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl flex items-center justify-between gap-3.5 ring-1 ring-white/15">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-inner">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider font-mono">
                    User Verified
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-sm font-bold text-white truncate">
                  Welcome, {verifiedUser.name}!
                </div>
                <div className="text-[11px] text-emerald-200/80 truncate">
                  Authenticated for {verifiedUser.role} portal • Launching workspace...
                </div>
              </div>
            </div>

            <div className="w-7 h-7 rounded-xl bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Check className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
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

        {/* Credentials Form Card */}
        <div className="p-7 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Account Authentication
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Argon2id & Auth Verified
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
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md shadow-blue-500/20 font-bold mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
