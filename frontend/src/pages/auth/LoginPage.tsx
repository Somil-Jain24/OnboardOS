import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';
import { SEEDED_USERS, useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    if (role === 'HR') navigate('/hr');
    else if (role === 'MANAGER') navigate('/manager');
    else if (role === 'EMPLOYEE') navigate('/employee');
    else if (role === 'IT') navigate('/it');
    else if (role === 'ADMIN') navigate('/admin/policies');
    else navigate('/hr');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden text-left">
      {/* Soft background accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to <span className="text-blue-600">OnboardOS</span>
          </h1>
          <p className="text-xs text-slate-500">
            AI-Assisted Employee Onboarding & Lifecycle Orchestration Platform
          </p>
        </div>

        {/* Persona Select Card */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800">Select Demo Persona to Sign In</span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Mock Auth Active
            </span>
          </div>

          <div className="space-y-2.5">
            {SEEDED_USERS.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectRole(u.role)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar name={u.name} size="md" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                    <span className="text-slate-500 text-xs font-mono">
                      Role: <strong className="text-blue-700 font-semibold">{u.role}</strong> ({u.email})
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

