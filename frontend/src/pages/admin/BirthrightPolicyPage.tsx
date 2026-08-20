import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { client } from '../../services';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Layers,
  Sliders,
  Play,
  Lock,
  Cpu,
  RefreshCw,
  Server,
} from 'lucide-react';
import type {
  BirthrightPolicy,
  PolicyType,
  PolicyCondition,
  GrantedEntitlement,
  PolicyEvaluationResult,
  Employee,
} from '../../types';

export function BirthrightPolicyPage() {
  const [policies, setPolicies] = useState<BirthrightPolicy[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState('catalog');

  // Policy Builder Form State
  const [formPolicy, setFormPolicy] = useState<{
    id?: string;
    name: string;
    description: string;
    policyType: PolicyType;
    status: 'ACTIVE' | 'DRAFT';
    priority: number;
    conditions: PolicyCondition[];
    grantedEntitlements: GrantedEntitlement[];
  }>({
    name: '',
    description: '',
    policyType: 'BIRTHRIGHT',
    status: 'ACTIVE',
    priority: 25,
    conditions: [{ field: 'department', operator: 'EQUALS', value: 'Engineering' }],
    grantedEntitlements: [
      {
        id: 'ent-new-1',
        name: 'GitHub Core Repository Access',
        app: 'GitHub',
        accessType: 'Read/Write',
        riskLevel: 'LOW',
        isBirthright: true,
        requiresApproval: false,
        description: 'Standard source code collaboration',
      },
    ],
  });

  // Simulator State
  const [simContext, setSimContext] = useState({
    department: 'Engineering',
    roleTitle: 'Backend Developer',
    team: 'Payments',
    seniority: 'JUNIOR',
    employmentType: 'FULL_TIME',
    location: 'Bengaluru, India',
  });
  const [simResult, setSimResult] = useState<PolicyEvaluationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [policiesData, employeesData] = await Promise.all([
        client.getBirthrightPolicies(),
        client.getEmployees(),
      ]);
      setPolicies(policiesData);
      setEmployees(employeesData);
    } finally {
      setLoading(false);
    }
  }

  const handleSavePolicy = async () => {
    if (!formPolicy.name.trim()) return;

    if (formPolicy.id) {
      await client.updateBirthrightPolicy(formPolicy.id, {
        name: formPolicy.name,
        description: formPolicy.description,
        policyType: formPolicy.policyType,
        status: formPolicy.status,
        priority: Number(formPolicy.priority),
        conditions: formPolicy.conditions,
        grantedEntitlements: formPolicy.grantedEntitlements,
      });
    } else {
      await client.createBirthrightPolicy({
        name: formPolicy.name,
        description: formPolicy.description,
        policyType: formPolicy.policyType,
        status: formPolicy.status,
        priority: Number(formPolicy.priority),
        conditions: formPolicy.conditions,
        grantedEntitlements: formPolicy.grantedEntitlements,
        author: 'Admin Operator',
      });
    }

    await loadData();
    setActiveTab('catalog');
    resetForm();
  };

  const resetForm = () => {
    setFormPolicy({
      name: '',
      description: '',
      policyType: 'BIRTHRIGHT',
      status: 'ACTIVE',
      priority: 30,
      conditions: [{ field: 'department', operator: 'EQUALS', value: 'Engineering' }],
      grantedEntitlements: [],
    });
  };

  const handleEditPolicy = (policy: BirthrightPolicy) => {
    setFormPolicy({
      id: policy.id,
      name: policy.name,
      description: policy.description,
      policyType: policy.policyType,
      status: policy.status === 'ARCHIVED' ? 'DRAFT' : policy.status,
      priority: policy.priority,
      conditions: policy.conditions,
      grantedEntitlements: policy.grantedEntitlements,
    });
    setActiveTab('builder');
  };

  const handleDeletePolicy = async (id: string) => {
    await client.deleteBirthrightPolicy(id);
    await loadData();
  };

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const result = await client.evaluateBirthrightAccess(simContext as any);
      setSimResult(result);
    } finally {
      setSimulating(false);
    }
  };

  const handleSelectEmployeeForSim = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setSimContext({
        department: emp.departmentName || 'Engineering',
        roleTitle: emp.roleTitle || 'Developer',
        team: emp.teamName || 'Payments',
        seniority: emp.seniority || 'JUNIOR',
        employmentType: emp.employmentType || 'FULL_TIME',
        location: emp.location || 'Remote',
      });
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.policyType === filterType;
    return matchesSearch && matchesType;
  });

  const tabItems = [
    {
      id: 'catalog',
      label: `Policy Catalog (${policies.length})`,
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'builder',
      label: formPolicy.id ? 'Edit Policy' : 'Policy Builder',
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      id: 'simulator',
      label: 'Live Policy Simulator',
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Birthright Access Policy Engine"
        description="Deterministic baseline policy engine that auto-computes safe Day-1 access and approval-gated entitlements from employee context."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>
              Rules Engine: Authoritative
            </Badge>
            <Badge variant="purple">P0-14</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('simulator');
                handleRunSimulation();
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Play className="w-4 h-4 mr-1.5 text-emerald-400" />
              Test in Simulator
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setActiveTab('builder');
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Policy Rule
            </Button>
          </div>
        }
      />

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Policies</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">
                {policies.filter((p) => p.status === 'ACTIVE').length}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">100% Deterministic evaluation</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Birthright Baselines</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {policies.filter((p) => p.policyType === 'BIRTHRIGHT').length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Zero-approval Day 1 grants</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Approval Gates</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">
                {policies.filter((p) => p.policyType === 'APPROVAL_REQUIRED').length}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Multi-stage manager / security SLA</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Time-Bound Grants</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">
                {policies.filter((p) => p.policyType === 'TIME_BOUND').length}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Auto-expiring least privilege</p>
        </Card>
      </div>

      {/* Segmented Tabs */}
      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="segmented"
      />

      {/* TAB 1: POLICY CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search policies by name, rule ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900/80 border-slate-800 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Policy Types</option>
                <option value="BIRTHRIGHT">Birthright Access</option>
                <option value="APPROVAL_REQUIRED">Approval Required</option>
                <option value="TIME_BOUND">Time Bound</option>
                <option value="OPTIONAL">Optional</option>
                <option value="DENIED">Denied Access</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredPolicies.map((policy) => {
              const isBirthright = policy.policyType === 'BIRTHRIGHT';
              const isGated = policy.policyType === 'APPROVAL_REQUIRED';
              const isTimeBound = policy.policyType === 'TIME_BOUND';

              return (
                <Card
                  key={policy.id}
                  className="p-5 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {policy.id}
                        </span>
                        <h4 className="font-semibold text-slate-100 text-sm">{policy.name}</h4>
                        <Badge
                          variant={
                            isBirthright
                              ? 'default'
                              : isGated
                              ? 'warning'
                              : isTimeBound
                              ? 'purple'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {policy.policyType}
                        </Badge>
                        <Badge variant="outline" size="sm" className="text-slate-400">
                          Priority: {policy.priority}
                        </Badge>
                        <span className="text-[11px] text-slate-500">v{policy.version}.0</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{policy.description}</p>

                      {/* Criteria Match Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                          Match Criteria (AND):
                        </span>
                        {policy.conditions.map((cond, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 font-mono"
                          >
                            <span className="text-blue-400">{cond.field}</span>
                            <span className="text-slate-500">{cond.operator}</span>
                            <span className="text-emerald-300 font-semibold">"{cond.value}"</span>
                          </span>
                        ))}
                      </div>

                      {/* Granted Entitlements List */}
                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">
                          Granted Entitlements ({policy.grantedEntitlements.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {policy.grantedEntitlements.map((ent) => (
                            <div
                              key={ent.id}
                              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
                            >
                              <Server className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-200 font-medium">{ent.name}</span>
                              <span className="text-slate-500 text-[10px] font-mono">({ent.app})</span>
                              {ent.ttlHours && (
                                <Badge variant="purple" size="sm" className="text-[9px] py-0 px-1">
                                  {ent.ttlHours}h TTL
                                </Badge>
                              )}
                              {ent.requiresApproval ? (
                                <Badge variant="warning" size="sm" className="text-[9px] py-0 px-1">
                                  Approval Req
                                </Badge>
                              ) : (
                                <Badge variant="default" size="sm" className="text-[9px] py-0 px-1">
                                  Day-1 Auto
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-row lg:flex-col items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPolicy(policy)}
                        className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE POLICY BUILDER */}
      {activeTab === 'builder' && (
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {formPolicy.id ? `Edit Policy Rule (${formPolicy.id})` : 'Create New Birthright Policy Rule'}
              </h3>
              <p className="text-xs text-slate-400">
                Define deterministic organizational conditions and configure automatically provisioned entitlements.
              </p>
            </div>
            <Badge variant="default">Policy Engine v1.0</Badge>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-slate-300">Policy Name *</label>
              <Input
                placeholder="e.g., Core Engineering Day-1 Baseline"
                value={formPolicy.name}
                onChange={(e) => setFormPolicy({ ...formPolicy, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Policy Type *</label>
              <select
                value={formPolicy.policyType}
                onChange={(e) => setFormPolicy({ ...formPolicy, policyType: e.target.value as PolicyType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="BIRTHRIGHT">Birthright Access (Day-1 Auto)</option>
                <option value="APPROVAL_REQUIRED">Approval Required (Gated)</option>
                <option value="TIME_BOUND">Time Bound (Auto-Expiring)</option>
                <option value="OPTIONAL">Optional (Self-Requestable)</option>
                <option value="DENIED">Denied Access (Explicit Block)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-slate-300">Description & Business Rationale</label>
              <Input
                placeholder="Explain why this access is safe and required for employees matching these attributes..."
                value={formPolicy.description}
                onChange={(e) => setFormPolicy({ ...formPolicy, description: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Evaluation Priority (1-100)</label>
              <Input
                type="number"
                value={formPolicy.priority}
                onChange={(e) => setFormPolicy({ ...formPolicy, priority: parseInt(e.target.value) || 10 })}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Condition Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                1. Matching Conditions (AND Logic)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormPolicy({
                    ...formPolicy,
                    conditions: [
                      ...formPolicy.conditions,
                      { field: 'team', operator: 'EQUALS', value: '' },
                    ],
                  })
                }
                className="text-xs border-slate-700 h-7"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Condition
              </Button>
            </div>

            <div className="space-y-2">
              {formPolicy.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <select
                    value={cond.field}
                    onChange={(e) => {
                      const newConds = [...formPolicy.conditions];
                      newConds[idx].field = e.target.value as any;
                      setFormPolicy({ ...formPolicy, conditions: newConds });
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="department">Department</option>
                    <option value="roleTitle">Role Title</option>
                    <option value="team">Team</option>
                    <option value="seniority">Seniority</option>
                    <option value="employmentType">Employment Type</option>
                    <option value="location">Location</option>
                  </select>

                  <select
                    value={cond.operator}
                    onChange={(e) => {
                      const newConds = [...formPolicy.conditions];
                      newConds[idx].operator = e.target.value as any;
                      setFormPolicy({ ...formPolicy, conditions: newConds });
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="EQUALS">EQUALS</option>
                    <option value="CONTAINS">CONTAINS</option>
                    <option value="IN">IN (comma-separated)</option>
                    <option value="NOT_EQUALS">NOT EQUALS</option>
                  </select>

                  <Input
                    placeholder="Target Value (e.g. Engineering, Full Time, Payments)"
                    value={cond.value}
                    onChange={(e) => {
                      const newConds = [...formPolicy.conditions];
                      newConds[idx].value = e.target.value;
                      setFormPolicy({ ...formPolicy, conditions: newConds });
                    }}
                    className="bg-slate-900 border-slate-800 text-xs flex-1"
                  />

                  {formPolicy.conditions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newConds = formPolicy.conditions.filter((_, i) => i !== idx);
                        setFormPolicy({ ...formPolicy, conditions: newConds });
                      }}
                      className="text-rose-400 hover:text-rose-300 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Entitlements Granted */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                2. Entitlements Assigned by this Policy
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormPolicy({
                    ...formPolicy,
                    grantedEntitlements: [
                      ...formPolicy.grantedEntitlements,
                      {
                        id: `ent-${Date.now()}`,
                        name: 'New Application Entitlement',
                        app: 'Slack',
                        accessType: 'Member',
                        riskLevel: 'LOW',
                        isBirthright: true,
                        requiresApproval: false,
                      },
                    ],
                  })
                }
                className="text-xs border-slate-700 h-7"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Entitlement
              </Button>
            </div>

            <div className="space-y-2">
              {formPolicy.grantedEntitlements.map((ent, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <Input
                    placeholder="Entitlement Name (e.g. Slack Engineering Channels)"
                    value={ent.name}
                    onChange={(e) => {
                      const newEnts = [...formPolicy.grantedEntitlements];
                      newEnts[idx].name = e.target.value;
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="bg-slate-900 border-slate-800 text-xs flex-1 min-w-[200px]"
                  />

                  <select
                    value={ent.app}
                    onChange={(e) => {
                      const newEnts = [...formPolicy.grantedEntitlements];
                      newEnts[idx].app = e.target.value;
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Google Workspace">Google Workspace</option>
                    <option value="Slack">Slack</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Jira">Jira</option>
                    <option value="AWS">AWS</option>
                    <option value="Figma">Figma</option>
                    <option value="Database">Database</option>
                    <option value="Workday">Workday</option>
                  </select>

                  <select
                    value={ent.riskLevel}
                    onChange={(e) => {
                      const newEnts = [...formPolicy.grantedEntitlements];
                      newEnts[idx].riskLevel = e.target.value as any;
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>

                  <label className="flex items-center gap-1.5 text-xs text-slate-300 px-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ent.requiresApproval}
                      onChange={(e) => {
                        const newEnts = [...formPolicy.grantedEntitlements];
                        newEnts[idx].requiresApproval = e.target.checked;
                        setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                      }}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    Approval Req
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newEnts = formPolicy.grantedEntitlements.filter((_, i) => i !== idx);
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="text-rose-400 hover:text-rose-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm();
                setActiveTab('catalog');
              }}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSavePolicy}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {formPolicy.id ? 'Save Policy Changes' : 'Create & Activate Policy'}
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 3: LIVE POLICY SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Context Persona */}
          <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Test Context Persona
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Input Vector</span>
            </div>

            {/* Quick Persona Pre-fills */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Load Existing Employee:</label>
              <select
                onChange={(e) => handleSelectEmployeeForSim(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="">-- Choose employee persona --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle} - {emp.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Department</label>
                <Input
                  value={simContext.department}
                  onChange={(e) => setSimContext({ ...simContext, department: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Role Title</label>
                <Input
                  value={simContext.roleTitle}
                  onChange={(e) => setSimContext({ ...simContext, roleTitle: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Team / Project</label>
                <Input
                  value={simContext.team}
                  onChange={(e) => setSimContext({ ...simContext, team: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Seniority</label>
                  <select
                    value={simContext.seniority}
                    onChange={(e) => setSimContext({ ...simContext, seniority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Employment</label>
                  <select
                    value={simContext.employmentType}
                    onChange={(e) => setSimContext({ ...simContext, employmentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="CONTRACT">Contractor</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs mt-2"
            >
              {simulating ? (
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1.5 text-emerald-400" />
              )}
              Evaluate Deterministic Policy
            </Button>
          </Card>

          {/* Simulation Evaluation Results */}
          <div className="lg:col-span-2 space-y-4">
            {simResult ? (
              <>
                {/* Matched Policies Header */}
                <Card className="p-4 bg-slate-900/80 border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-100 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Matched Active Policies ({simResult.matchedPolicies.length})
                    </h4>
                    <Badge variant="default" size="sm">
                      Deterministic Pass
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {simResult.matchedPolicies.map((pol) => (
                      <div
                        key={pol.policyId}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">{pol.policyName}</span>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Matches: {pol.matchedConditions.join(' • ')}
                          </div>
                        </div>
                        <Badge variant="outline" size="sm" className="text-blue-400 font-mono">
                          {pol.policyType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Computed Day-1 Baseline Entitlements */}
                <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-100 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Computed Day-1 Birthright Entitlements ({simResult.evaluatedEntitlements.filter(e => e.isBirthright).length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Zero-approval immediate grant</span>
                  </div>

                  <div className="space-y-2">
                    {simResult.evaluatedEntitlements
                      .filter((ent) => ent.isBirthright)
                      .map((ent) => (
                        <div
                          key={ent.id}
                          className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-200 text-xs">{ent.name}</span>
                              <Badge variant="info" size="sm" className="text-[10px]">
                                {ent.app}
                              </Badge>
                              <Badge
                                variant={ent.riskLevel === 'LOW' ? 'secondary' : 'warning'}
                                size="sm"
                                className="text-[10px]"
                              >
                                {ent.riskLevel} Risk
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-400">{ent.reason}</p>
                          </div>
                          <Badge variant="default" size="sm" className="shrink-0 font-mono">
                            AUTO_GRANTED
                          </Badge>
                        </div>
                      ))}
                  </div>
                </Card>

                {/* Computed Approval-Gated Entitlements */}
                {simResult.evaluatedEntitlements.some((e) => !e.isBirthright) && (
                  <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-100 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        Approval Gated Entitlements ({simResult.evaluatedEntitlements.filter(e => !e.isBirthright).length})
                      </h4>
                      <span className="text-[11px] text-amber-400">Requires Manager / Security Chain</span>
                    </div>

                    <div className="space-y-2">
                      {simResult.evaluatedEntitlements
                        .filter((ent) => !ent.isBirthright)
                        .map((ent) => (
                          <div
                            key={ent.id}
                            className="p-3 rounded-lg bg-slate-950 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-200 text-xs">{ent.name}</span>
                                <Badge variant="warning" size="sm" className="text-[10px]">
                                  {ent.app}
                                </Badge>
                                <Badge variant="danger" size="sm" className="text-[10px]">
                                  {ent.riskLevel} Risk
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-400">{ent.reason}</p>
                            </div>
                            <Badge variant="warning" size="sm" className="shrink-0 font-mono">
                              APPROVAL_GATED
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-12 text-center bg-slate-900/40 border-slate-800 flex flex-col items-center justify-center text-slate-400">
                <Play className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-300">Run the Policy Simulator</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Configure a persona on the left or select an employee to see deterministic policy matching in real-time.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
