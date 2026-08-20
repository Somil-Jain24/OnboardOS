import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Flame,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Play,
  Trash2,
  Lock,
  KeyRound,
  Server,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Request Privilege Elevation
            </h3>
            <Badge variant="outline" size="sm">Ephemeral TTL</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Requesting Engineer</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Target Production System</label>
              <select
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="AWS Production (us-east-1)">AWS Production (us-east-1)</option>
                <option value="Production Kubernetes Cluster (EKS)">Production Kubernetes Cluster (EKS)</option>
                <option value="Production PostgreSQL Primary DB">Production PostgreSQL Primary DB</option>
                <option value="Stripe Production API Admin">Stripe Production API Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Privileged Role</label>
              <Input
                value={privilegedRole}
                onChange={(e) => setPrivilegedRole(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Duration (Minutes)</label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Incident Ticket / Reason *</label>
              <textarea
                rows={3}
                placeholder="e.g. INC-4492 Production DB connection pool starvation troubleshooting..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>

            <label className="flex items-center gap-2 p-2.5 bg-rose-950/20 border border-rose-500/30 rounded cursor-pointer text-rose-300">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded bg-slate-900 text-rose-500 focus:ring-0"
              />
              <span className="font-semibold">Break-Glass Emergency Mode (Auto-Grant & Page Security)</span>
            </label>
          </div>

          <Button
            onClick={handleRequestElevation}
            disabled={!reason.trim()}
            className={`w-full text-xs text-white ${
              isEmergency ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {isEmergency ? <Flame className="w-4 h-4 mr-1.5" /> : <Zap className="w-4 h-4 mr-1.5" />}
            {isEmergency ? 'Trigger Break-Glass Elevation' : 'Request JIT Elevation'}
          </Button>
        </Card>

        {/* Active Elevation Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider font-mono">
              Active Privileged Sessions ({sessions.filter((s) => s.status === 'ACTIVE').length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Auto-Revocation Countdown</span>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => {
              const isActive = session.status === 'ACTIVE';

              return (
                <Card
                  key={session.id}
                  className={`p-5 border transition-all ${
                    session.isEmergencyBreakGlass
                      ? 'bg-rose-950/15 border-rose-500/30'
                      : isActive
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {session.id}
                        </span>
                        <h4 className="font-semibold text-slate-100 text-sm">{session.privilegedRole}</h4>
                        {session.isEmergencyBreakGlass && (
                          <Badge variant="danger" size="sm">
                            BREAK-GLASS
                          </Badge>
                        )}
                        <Badge variant={isActive ? 'default' : 'secondary'} size="sm">
                          {session.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300">
                        Engineer: <strong className="text-slate-100">{session.employeeName}</strong> • Target: {session.targetSystem}
                      </p>

                      <p className="text-xs text-slate-400 italic">
                        "{session.reason}"
                      </p>

                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                        <span>Started: {new Date(session.startedAt).toLocaleTimeString()}</span>
                        <span>Expires: {new Date(session.expiresAt).toLocaleTimeString()}</span>
                        {isActive && (
                          <span className="text-amber-400 font-semibold">
                            ⏳ {session.remainingMinutes} min remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevoke(session.id)}
                        className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs h-8 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Terminate Session
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
