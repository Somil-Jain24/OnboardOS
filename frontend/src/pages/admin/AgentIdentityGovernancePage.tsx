import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Bot,
  Pause,
  Play,
  Shield,
  Layers,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            <Card
              key={agent.id}
              className={`p-5 border transition-all ${
                isActive ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/40 border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400">{agent.id}</span>
                    <h3 className="font-semibold text-slate-100 text-base">{agent.name}</h3>
                    <Badge variant="outline" size="sm">{agent.type}</Badge>
                    <Badge variant={isActive ? 'default' : 'secondary'} size="sm">
                      {agent.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400">
                    Human Sponsor: <strong className="text-slate-200">{agent.ownerName}</strong> ({agent.ownerEmail})
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggle(agent.id, agent.status)}
                  className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs h-8"
                >
                  {isActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> Pause Agent
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Resume Agent
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 uppercase text-[10px]">Privilege Ceiling:</span>
                  <span className="text-amber-400 font-semibold">{agent.maxPrivilegeLevel}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500 flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-blue-400" /> Allowed Tool Scopes ({agent.allowedTools.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.allowedTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
