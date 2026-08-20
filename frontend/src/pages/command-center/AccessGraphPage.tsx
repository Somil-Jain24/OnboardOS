import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { WhyExplanationPanel } from '../../components/shared/WhyExplanationPanel';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  Sparkles,
  Shield,
  Briefcase,
  Layers,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Server,
  Code2,
} from 'lucide-react';
import type { PlanItem } from '../../types';

// Custom Node component with enterprise styling
function CustomAccessNode({ data }: NodeProps) {
  const nodeData = data as {
    label: string;
    sublabel?: string;
    type: 'role' | 'dept' | 'team' | 'app' | 'approval';
    status: 'granted' | 'running' | 'failed' | 'blocked' | 'waiting';
    icon?: React.ReactNode;
  };

  const getStatusStyles = () => {
    switch (nodeData.status) {
      case 'granted':
        return 'border-emerald-500/50 bg-slate-900/95 shadow-sm shadow-emerald-500/10 text-emerald-300';
      case 'running':
        return 'border-blue-500/50 bg-slate-900/95 shadow-sm shadow-blue-500/10 text-blue-300';
      case 'failed':
        return 'border-rose-500/80 bg-rose-950/40 shadow-md shadow-rose-500/20 text-rose-300 animate-pulse';
      case 'blocked':
        return 'border-slate-700 bg-slate-900/70 text-slate-400 opacity-80';
      case 'waiting':
        return 'border-amber-500/60 bg-amber-950/30 text-amber-300';
      default:
        return 'border-slate-800 bg-slate-900 text-slate-200';
    }
  };

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl border min-w-[180px] max-w-[220px] transition-all cursor-pointer backdrop-blur-md ${getStatusStyles()}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-2 !h-2" />
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{nodeData.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate text-slate-100">{nodeData.label}</div>
          {nodeData.sublabel && (
            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
              {nodeData.sublabel}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomAccessNode,
};

export function AccessGraphPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, plan } = useEmployee(id);
  const [selectedItemForWhy, setSelectedItemForWhy] = useState<PlanItem | null>(null);

  // Canonical node DAG
  const initialNodes = [
    // Top Root
    {
      id: 'node-role',
      type: 'custom',
      position: { x: 380, y: 20 },
      data: {
        label: employee?.roleTitle || 'Backend Developer',
        sublabel: 'Role Context (Seniority: JUNIOR)',
        type: 'role',
        status: 'granted',
        icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      },
    },
    // Middle Context Tier
    {
      id: 'node-dept',
      type: 'custom',
      position: { x: 200, y: 120 },
      data: {
        label: 'Engineering Dept',
        sublabel: 'Scope: Org Policies',
        type: 'dept',
        status: 'granted',
        icon: <Layers className="w-4 h-4 text-indigo-400" />,
      },
    },
    {
      id: 'node-team',
      type: 'custom',
      position: { x: 560, y: 120 },
      data: {
        label: 'Payments Core Team',
        sublabel: 'Scope: Pod Repos & Backlog',
        type: 'team',
        status: 'granted',
        icon: <Code2 className="w-4 h-4 text-purple-400" />,
      },
    },
    // Downstream Application Tier
    {
      id: 'node-google',
      type: 'custom',
      position: { x: 40, y: 240 },
      data: {
        label: 'Google Workspace',
        sublabel: 'Granted: SSO & Mailbox',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      },
    },
    {
      id: 'node-github',
      type: 'custom',
      position: { x: 260, y: 240 },
      data: {
        label: 'GitHub Enterprise',
        sublabel: 'Granted: payments-backend',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      },
    },
    {
      id: 'node-slack',
      type: 'custom',
      position: { x: 480, y: 240 },
      data: {
        label: 'Slack Workplace',
        sublabel: 'Granted: #payments',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      },
    },
    {
      id: 'node-jira',
      type: 'custom',
      position: { x: 700, y: 240 },
      data: {
        label: 'Jira Backlog',
        sublabel: 'Failed: HTTP 503 Rate Limit',
        type: 'app',
        status: 'failed',
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />,
      },
    },
    // Gated & Dependent Tier
    {
      id: 'node-jira-sprint',
      type: 'custom',
      position: { x: 700, y: 360 },
      data: {
        label: 'Sprint Backlog Assignment',
        sublabel: 'Blocked: Gated on Jira Task',
        type: 'app',
        status: 'blocked',
        icon: <Lock className="w-4 h-4 text-slate-500" />,
      },
    },
    {
      id: 'node-aws-gate',
      type: 'custom',
      position: { x: 260, y: 360 },
      data: {
        label: 'AWS Production Cloud',
        sublabel: 'Approval Gate: Marcus Vance',
        type: 'approval',
        status: 'waiting',
        icon: <Clock className="w-4 h-4 text-amber-400" />,
      },
    },
  ];

  const initialEdges = [
    { id: 'e-role-dept', source: 'node-role', target: 'node-dept', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-role-team', source: 'node-role', target: 'node-team', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-dept-google', source: 'node-dept', target: 'node-google', style: { stroke: '#10b981' } },
    { id: 'e-dept-github', source: 'node-dept', target: 'node-github', style: { stroke: '#10b981' } },
    { id: 'e-team-slack', source: 'node-team', target: 'node-slack', style: { stroke: '#10b981' } },
    { id: 'e-team-jira', source: 'node-team', target: 'node-jira', animated: true, style: { stroke: '#f43f5e' } },
    { id: 'e-jira-sprint', source: 'node-jira', target: 'node-jira-sprint', style: { stroke: '#64748b', strokeDasharray: '4 4' } },
    { id: 'e-github-aws', source: 'node-github', target: 'node-aws-gate', style: { stroke: '#f59e0b', strokeDasharray: '4 4' } },
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      const matchedItem = plan?.items.find((i) =>
        node.data.label.toLowerCase().includes(i.category.toLowerCase()) ||
        i.name.toLowerCase().includes(node.data.label.toLowerCase())
      );
      if (matchedItem) {
        setSelectedItemForWhy(matchedItem);
      } else if (plan?.items[0]) {
        setSelectedItemForWhy(plan.items[0]);
      }
    },
    [plan]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Intelligence Graph (FR-GRAPH-*)"
        description="Interactive graph representing the access topology: Role → Department → Team → Applications → Permissions → Approval Gates."
        badge={<Badge variant="default" dot>React Flow Interactive Topology</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/employees/${id}/plan`}>
              <Button size="sm" variant="secondary">
                View Plan List
              </Button>
            </Link>
            <Link to={`/employees/${id}/provisioning`}>
              <Button size="sm" variant="primary">
                Provisioning View
              </Button>
            </Link>
          </div>
        }
      />

      {/* React Flow Canvas Card */}
      <Card className="h-[620px] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden">
        {/* Permanent Graph Legend */}
        <div className="absolute top-4 left-4 z-10 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs space-y-1.5 shadow-lg pointer-events-none">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Topology Legend
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Granted / Completed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Failed (Jira Rate Limit)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Blocked Downstream</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Approval Gate Required</span>
          </div>
        </div>

        {/* Interactive Notice */}
        <div className="absolute bottom-4 left-4 z-10 p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-slate-400 flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Click any node to open the explainability ("Why?") panel. Pan & zoom enabled.</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={20} size={1.5} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" />
          <MiniMap
            className="!bg-slate-900 !border-slate-800"
            nodeColor={(n) => {
              if (n.data.status === 'failed') return '#f43f5e';
              if (n.data.status === 'granted') return '#10b981';
              if (n.data.status === 'waiting') return '#f59e0b';
              return '#3b82f6';
            }}
          />
        </ReactFlow>
      </Card>

      {/* Why Explanation Panel */}
      <WhyExplanationPanel
        isOpen={Boolean(selectedItemForWhy)}
        onClose={() => setSelectedItemForWhy(null)}
        item={selectedItemForWhy}
        employee={employee}
      />
    </div>
  );
}
