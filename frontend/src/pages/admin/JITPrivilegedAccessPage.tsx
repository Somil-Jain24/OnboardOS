import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Flame,
  Trash2,
  KeyRound,
  Zap,
} from 'lucide-react';
import type { ElevationSession, Employee } from '../../types';

export function JITPrivilegedAccessPage() {
  const [sessions, setSessions] = useState<ElevationSession[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Elevation form
  const [targetSystem, setTargetSystem] = useState('AWS Production (us-east-1)');
  const [privilegedRole, setPrivilegedRole] = useState('Production Root Superuser');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [reason, setReason] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('emp-rahul');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sessionsData, empsData] = await Promise.all([
        client.getElevationSessions(),
        client.getEmployees(),
      ]);
      setSessions(sessionsData);
      setEmployees(empsData);
    } finally {
      setLoading(false);
    }
  }

  const handleRequestElevation = async () => {
    if (!reason.trim()) return;
    await client.requestJITElevation({
      employeeId: selectedEmpId,
      targetSystem,
      privilegedRole,
      durationMinutes,
      reason,
      isEmergency,
    });
    setReason('');
    await loadData();
  };

  const handleRevoke = async (id: string) => {
    await client.revokeElevationSession(id);
    await loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Just-In-Time (JIT) Privileged Access Center"
        description="Eliminate standing admin privileges with ephemeral elevation requests, break-glass on-call emergency access, and session timers."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Zero Standing Privileges</Badge>
            <Badge variant="purple">P1-20</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Elevation Request Panel */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Request Privilege Elevation
            </h3>
            <Badge variant="secondary" size="sm">Ephemeral TTL</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Requesting Engineer</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-600"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Target Production System</label>
              <select
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-600"
              >
                <option value="AWS Production (us-east-1)">AWS Production (us-east-1)</option>
                <option value="Production Kubernetes Cluster (EKS)">Production Kubernetes Cluster (EKS)</option>
                <option value="Production PostgreSQL Primary DB">Production PostgreSQL Primary DB</option>
                <option value="Stripe Production API Admin">Stripe Production API Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Privileged Role</label>
              <Input
                value={privilegedRole}
                onChange={(e) => setPrivilegedRole(e.target.value)}
                className="text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Duration (Minutes)</label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                className="text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Incident Ticket / Reason *</label>
              <textarea
                rows={3}
                placeholder="e.g. INC-4492 Production DB connection pool starvation troubleshooting..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <label className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer text-rose-900">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded text-rose-600 focus:ring-0"
              />
              <span className="font-bold text-xs">Break-Glass Emergency Mode (Auto-Grant)</span>
            </label>
          </div>

          <Button
            onClick={handleRequestElevation}
            disabled={!reason.trim()}
            variant={isEmergency ? 'destructive' : 'primary'}
            className="w-full text-xs rounded-xl"
          >
            {isEmergency ? <Flame className="w-4 h-4 mr-1.5" /> : <Zap className="w-4 h-4 mr-1.5" />}
            {isEmergency ? 'Trigger Break-Glass Elevation' : 'Request JIT Elevation'}
          </Button>
        </div>

        {/* Active Elevation Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider font-mono">
              Active Privileged Sessions ({sessions.filter((s) => s.status === 'ACTIVE').length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Auto-Revocation Countdown</span>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => {
              const isActive = session.status === 'ACTIVE';

              return (
                <div
                  key={session.id}
                  className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-3 ${
                    session.isEmergencyBreakGlass
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : isActive
                      ? 'border-slate-200/90'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                          {session.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{session.privilegedRole}</h4>
                        {session.isEmergencyBreakGlass && (
                          <Badge variant="danger" size="sm">
                            BREAK-GLASS
                          </Badge>
                        )}
                        <StatusBadge status={isActive ? 'in_progress' : 'neutral'} label={session.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-600">
                        Engineer: <strong className="text-slate-900">{session.employeeName}</strong> • Target: {session.targetSystem}
                      </p>

                      <p className="text-xs text-slate-500 italic">
                        "{session.reason}"
                      </p>

                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                        <span>Started: {new Date(session.startedAt).toLocaleTimeString()}</span>
                        <span>Expires: {new Date(session.expiresAt).toLocaleTimeString()}</span>
                        {isActive && (
                          <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            ⏳ {session.remainingMinutes} min remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevoke(session.id)}
                        className="rounded-xl text-xs h-8 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Terminate Session
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

