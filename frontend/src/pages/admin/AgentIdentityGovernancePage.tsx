import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Pause,
  Play,
  Wrench,
} from 'lucide-react';
import type { AgentIdentity } from '../../types';

export function AgentIdentityGovernancePage() {
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);
      const data = await client.getAgentIdentities();
      setAgents(data);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await client.toggleAgentStatus(id, nextStatus);
    await loadAgents();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Service Account & AI Agent Identity Governance"
        description="Govern non-human identities, autonomous AI agents, and CI/CD service accounts with scoped tool permissions, max privilege boundaries, and instant pause controls."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>NHI Governance Active</Badge>
            <Badge variant="purple">P2-28</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {agents.map((agent) => {
          const isActive = agent.status === 'ACTIVE';

          return (
            <div
              key={agent.id}
              className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-4 ${
                isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600">{agent.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{agent.name}</h3>
                    <Badge variant="secondary" size="sm">{agent.type}</Badge>
                    <StatusBadge
                      status={isActive ? 'completed' : 'pending'}
                      label={agent.status}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-slate-500">
                    Human Sponsor: <strong className="text-slate-800">{agent.ownerName}</strong> ({agent.ownerEmail})
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleToggle(agent.id, agent.status)}
                  className="rounded-xl text-xs h-8"
                >
                  {isActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1 text-amber-600" /> Pause Agent
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Resume Agent
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 uppercase text-[10px] font-bold font-sans">Privilege Ceiling:</span>
                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{agent.maxPrivilegeLevel}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 font-sans">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" /> Allowed Tool Scopes ({agent.allowedTools.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.allowedTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-mono"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

