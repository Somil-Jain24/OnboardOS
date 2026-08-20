import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">OnboardOS</span>
          </h1>
          <p className="text-xs text-slate-400">
            AI-Assisted Employee Onboarding & Lifecycle Orchestration Platform
          </p>
        </div>

        {/* Persona Select Card */}
        <Card className="p-6 bg-slate-900/90 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-200">Select Demo Persona to Sign In</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Mock Auth Active
            </span>
          </div>

          <div className="space-y-2">
            {SEEDED_USERS.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectRole(u.role)}
                className="p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800/40 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} size="md" status="online" />
                  <div>
                    <h4 className="font-semibold text-slate-100">{u.name}</h4>
                    <span className="text-slate-400 text-[11px] font-mono">
                      Role: <strong className="text-purple-300">{u.role}</strong> ({u.email})
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
