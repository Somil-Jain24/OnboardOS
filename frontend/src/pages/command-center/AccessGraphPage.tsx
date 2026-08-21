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
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { WhyExplanationPanel } from '../../components/shared/WhyExplanationPanel';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  Briefcase,
  Layers,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Code2,
} from 'lucide-react';
import type { PlanItem } from '../../types';

// Custom Node component with enterprise light styling
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
        return 'border-emerald-200 bg-white shadow-card text-emerald-700 hover:border-emerald-400';
      case 'running':
        return 'border-blue-200 bg-white shadow-card text-blue-700 hover:border-blue-400';
      case 'failed':
        return 'border-rose-300 bg-rose-50/50 shadow-card text-rose-800 animate-pulse';
      case 'blocked':
        return 'border-slate-200 bg-slate-50 text-slate-500 opacity-80';
      case 'waiting':
        return 'border-amber-300 bg-amber-50/50 shadow-card text-amber-800';
      default:
        return 'border-slate-200 bg-white shadow-card text-slate-900';
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-2xl border min-w-[200px] max-w-[240px] transition-all cursor-pointer ${getStatusStyles()}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5 !border-2 !border-white" />
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0">{nodeData.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate text-slate-900">{nodeData.label}</div>
          {nodeData.sublabel && (
            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
              {nodeData.sublabel}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5 !border-2 !border-white" />
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
        icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      },
    },
    // Middle Context Tier
    {
      id: 'node-dept',
      type: 'custom',
      position: { x: 200, y: 130 },
      data: {
        label: 'Engineering Dept',
        sublabel: 'Scope: Org Policies',
        type: 'dept',
        status: 'granted',
        icon: <Layers className="w-4 h-4 text-indigo-600" />,
      },
    },
    {
      id: 'node-team',
      type: 'custom',
      position: { x: 560, y: 130 },
      data: {
        label: 'Payments Core Team',
        sublabel: 'Scope: Pod Repos & Backlog',
        type: 'team',
        status: 'granted',
        icon: <Code2 className="w-4 h-4 text-purple-600" />,
      },
    },
    // Downstream Application Tier
    {
      id: 'node-google',
      type: 'custom',
      position: { x: 40, y: 250 },
      data: {
        label: 'Google Workspace',
        sublabel: 'Granted: SSO & Mailbox',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-github',
      type: 'custom',
      position: { x: 260, y: 250 },
      data: {
        label: 'GitHub Enterprise',
        sublabel: 'Granted: payments-backend',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-slack',
      type: 'custom',
      position: { x: 480, y: 250 },
      data: {
        label: 'Slack Workplace',
        sublabel: 'Granted: #payments',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-jira',
      type: 'custom',
      position: { x: 700, y: 250 },
      data: {
        label: 'Jira Backlog',
        sublabel: 'Failed: HTTP 503 Rate Limit',
        type: 'app',
        status: 'failed',
        icon: <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />,
      },
    },
    // Gated & Dependent Tier
    {
      id: 'node-jira-sprint',
      type: 'custom',
      position: { x: 700, y: 370 },
      data: {
        label: 'Sprint Backlog Assignment',
        sublabel: 'Blocked: Gated on Jira Task',
        type: 'app',
        status: 'blocked',
        icon: <Lock className="w-4 h-4 text-slate-400" />,
      },
    },
    {
      id: 'node-aws-gate',
      type: 'custom',
      position: { x: 260, y: 370 },
      data: {
        label: 'AWS Production Cloud',
        sublabel: 'Approval Gate: Marcus Vance',
        type: 'approval',
        status: 'waiting',
        icon: <Clock className="w-4 h-4 text-amber-600" />,
      },
    },
  ];

  const initialEdges = [
    { id: 'e-role-dept', source: 'node-role', target: 'node-dept', animated: true, style: { stroke: '#2563EB', strokeWidth: 2 } },
    { id: 'e-role-team', source: 'node-role', target: 'node-team', animated: true, style: { stroke: '#2563EB', strokeWidth: 2 } },
    { id: 'e-dept-google', source: 'node-dept', target: 'node-google', style: { stroke: '#059669', strokeWidth: 2 } },
    { id: 'e-dept-github', source: 'node-dept', target: 'node-github', style: { stroke: '#059669', strokeWidth: 2 } },
    { id: 'e-team-slack', source: 'node-team', target: 'node-slack', style: { stroke: '#059669', strokeWidth: 2 } },
    { id: 'e-team-jira', source: 'node-team', target: 'node-jira', animated: true, style: { stroke: '#E11D48', strokeWidth: 2 } },
    { id: 'e-jira-sprint', source: 'node-jira', target: 'node-jira-sprint', style: { stroke: '#94A3B8', strokeDasharray: '4 4', strokeWidth: 2 } },
    { id: 'e-github-aws', source: 'node-github', target: 'node-aws-gate', style: { stroke: '#D97706', strokeDasharray: '4 4', strokeWidth: 2 } },
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
    <div className="space-y-6 text-left">
      <PageHeader
        title="Access Intelligence Graph"
        description="Interactive graph representing the access topology: Role → Department → Team → Applications → Permissions → Approval Gates."
        badge={<Badge variant="default" dot>Interactive Topology</Badge>}
        actions={
          <div className="flex items-center gap-2.5">
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
      <div className="h-[620px] bg-slate-50/50 border border-slate-200/90 rounded-3xl relative overflow-hidden shadow-card">
        {/* Permanent Graph Legend */}
        <div className="absolute top-4 left-4 z-10 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs space-y-2 shadow-dropdown pointer-events-none">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Topology Legend
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium">Granted / Completed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-medium">Failed (Rate Limit)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="font-medium">Blocked Downstream</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium">Approval Gate Required</span>
          </div>
        </div>

        {/* Interactive Notice */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-dropdown">
          <Info className="w-4 h-4 text-blue-600" />
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
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={24} size={1.5} />
          <Controls className="!bg-white !border-slate-200 !text-slate-700 !shadow-dropdown !rounded-2xl" />
          <MiniMap
            className="!bg-white !border-slate-200 !rounded-2xl !shadow-dropdown"
            nodeColor={(n) => {
              if (n.data.status === 'failed') return '#f43f5e';
              if (n.data.status === 'granted') return '#10b981';
              if (n.data.status === 'waiting') return '#f59e0b';
              return '#3b82f6';
            }}
          />
        </ReactFlow>
      </div>

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

