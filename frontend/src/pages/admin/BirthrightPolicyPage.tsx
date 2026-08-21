import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
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
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveTab('simulator');
                handleRunSimulation();
              }}
              className="rounded-xl text-xs"
            >
              <Play className="w-4 h-4 mr-1.5 text-emerald-600" />
              Test in Simulator
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                resetForm();
                setActiveTab('builder');
              }}
              className="rounded-xl text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Policy Rule
            </Button>
          </div>
        }
      />

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Policies"
          value={policies.filter((p) => p.status === 'ACTIVE').length}
          subtitle="100% Deterministic evaluation"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconColor="blue"
        />

        <StatCard
          title="Birthright Baselines"
          value={policies.filter((p) => p.policyType === 'BIRTHRIGHT').length}
          subtitle="Zero-approval Day 1 grants"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="emerald"
        />

        <StatCard
          title="Approval Gates"
          value={policies.filter((p) => p.policyType === 'APPROVAL_REQUIRED').length}
          subtitle="Multi-stage manager / security SLA"
          icon={<Lock className="w-5 h-5" />}
          iconColor="amber"
        />

        <StatCard
          title="Time-Bound Grants"
          value={policies.filter((p) => p.policyType === 'TIME_BOUND').length}
          subtitle="Auto-expiring least privilege"
          icon={<Clock className="w-5 h-5" />}
          iconColor="purple"
        />
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
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search policies by name, rule ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
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
                <div
                  key={policy.id}
                  className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                          {policy.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{policy.name}</h4>
                        <StatusBadge
                          status={
                            isBirthright
                              ? 'completed'
                              : isGated
                              ? 'warning'
                              : isTimeBound
                              ? 'neutral'
                              : 'neutral'
                          }
                          label={policy.policyType}
                          size="sm"
                        />
                        <Badge variant="secondary" size="sm">
                          Priority: {policy.priority}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">v{policy.version}.0</span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">{policy.description}</p>

                      {/* Criteria Match Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                          Match Criteria (AND):
                        </span>
                        {policy.conditions.map((cond, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono"
                          >
                            <span className="text-blue-700 font-semibold">{cond.field}</span>
                            <span className="text-slate-400">{cond.operator}</span>
                            <span className="text-emerald-700 font-bold">"{cond.value}"</span>
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
                              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                            >
                              <Server className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-900 font-semibold">{ent.name}</span>
                              <span className="text-slate-500 text-xs font-mono">({ent.app})</span>
                              {ent.ttlHours && (
                                <Badge variant="purple" size="sm" className="text-[9px] py-0 px-1.5">
                                  {ent.ttlHours}h TTL
                                </Badge>
                              )}
                              {ent.requiresApproval ? (
                                <StatusBadge status="warning" label="Approval Req" size="sm" />
                              ) : (
                                <StatusBadge status="completed" label="Day-1 Auto" size="sm" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-row lg:flex-col items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditPolicy(policy)}
                        className="rounded-xl text-xs h-8"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-600" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="rounded-xl text-xs h-8"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE POLICY BUILDER */}
      {activeTab === 'builder' && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {formPolicy.id ? `Edit Policy Rule (${formPolicy.id})` : 'Create New Birthright Policy Rule'}
              </h3>
              <p className="text-xs text-slate-500">
                Define deterministic organizational conditions and configure automatically provisioned entitlements.
              </p>
            </div>
            <Badge variant="default">Policy Engine v1.0</Badge>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Policy Name *</label>
              <Input
                placeholder="e.g., Core Engineering Day-1 Baseline"
                value={formPolicy.name}
                onChange={(e) => setFormPolicy({ ...formPolicy, name: e.target.value })}
                className="text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Policy Type *</label>
              <select
                value={formPolicy.policyType}
                onChange={(e) => setFormPolicy({ ...formPolicy, policyType: e.target.value as PolicyType })}
                className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
              >
                <option value="BIRTHRIGHT">Birthright Access (Day-1 Auto)</option>
                <option value="APPROVAL_REQUIRED">Approval Required (Gated)</option>
                <option value="TIME_BOUND">Time Bound (Auto-Expiring)</option>
                <option value="OPTIONAL">Optional (Self-Requestable)</option>
                <option value="DENIED">Denied Access (Explicit Block)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Description & Business Rationale</label>
              <Input
                placeholder="Explain why this access is safe and required for employees matching these attributes..."
                value={formPolicy.description}
                onChange={(e) => setFormPolicy({ ...formPolicy, description: e.target.value })}
                className="text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Evaluation Priority (1-100)</label>
              <Input
                type="number"
                value={formPolicy.priority}
                onChange={(e) => setFormPolicy({ ...formPolicy, priority: parseInt(e.target.value) || 10 })}
                className="text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>
          </div>

          {/* Condition Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                1. Matching Conditions (AND Logic)
              </h4>
              <Button
                type="button"
                variant="secondary"
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
                className="text-xs rounded-xl h-7"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Condition
              </Button>
            </div>

            <div className="space-y-2">
              {formPolicy.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <select
                    value={cond.field}
                    onChange={(e) => {
                      const newConds = [...formPolicy.conditions];
                      newConds[idx].field = e.target.value as any;
                      setFormPolicy({ ...formPolicy, conditions: newConds });
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
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
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
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
                    className="bg-white border-slate-200 text-xs flex-1 rounded-xl"
                  />

                  {formPolicy.conditions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newConds = formPolicy.conditions.filter((_, i) => i !== idx);
                        setFormPolicy({ ...formPolicy, conditions: newConds });
                      }}
                      className="h-8 w-8 p-0 rounded-xl"
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
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                2. Entitlements Assigned by this Policy
              </h4>
              <Button
                type="button"
                variant="secondary"
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
                className="text-xs rounded-xl h-7"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Entitlement
              </Button>
            </div>

            <div className="space-y-2">
              {formPolicy.grantedEntitlements.map((ent, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <Input
                    placeholder="Entitlement Name (e.g. Slack Engineering Channels)"
                    value={ent.name}
                    onChange={(e) => {
                      const newEnts = [...formPolicy.grantedEntitlements];
                      newEnts[idx].name = e.target.value;
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="bg-white border-slate-200 text-xs flex-1 min-w-[200px] rounded-xl"
                  />

                  <select
                    value={ent.app}
                    onChange={(e) => {
                      const newEnts = [...formPolicy.grantedEntitlements];
                      newEnts[idx].app = e.target.value;
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
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
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>

                  <label className="flex items-center gap-1.5 text-xs text-slate-700 px-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={ent.requiresApproval}
                      onChange={(e) => {
                        const newEnts = [...formPolicy.grantedEntitlements];
                        newEnts[idx].requiresApproval = e.target.checked;
                        setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0"
                    />
                    Approval Req
                  </label>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newEnts = formPolicy.grantedEntitlements.filter((_, i) => i !== idx);
                      setFormPolicy({ ...formPolicy, grantedEntitlements: newEnts });
                    }}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetForm();
                setActiveTab('catalog');
              }}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSavePolicy}
              className="rounded-xl text-xs"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {formPolicy.id ? 'Save Policy Changes' : 'Create & Activate Policy'}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE POLICY SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Context Persona */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Test Context Persona
              </h3>
              <span className="text-[10px] font-mono text-slate-400 font-bold">Input Vector</span>
            </div>

            {/* Quick Persona Pre-fills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Load Existing Employee:</label>
              <select
                onChange={(e) => handleSelectEmployeeForSim(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600"
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
                <label className="text-xs font-medium text-slate-600">Department</label>
                <Input
                  value={simContext.department}
                  onChange={(e) => setSimContext({ ...simContext, department: e.target.value })}
                  className="text-xs rounded-2xl bg-white border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Role Title</label>
                <Input
                  value={simContext.roleTitle}
                  onChange={(e) => setSimContext({ ...simContext, roleTitle: e.target.value })}
                  className="text-xs rounded-2xl bg-white border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Team / Project</label>
                <Input
                  value={simContext.team}
                  onChange={(e) => setSimContext({ ...simContext, team: e.target.value })}
                  className="text-xs rounded-2xl bg-white border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Seniority</label>
                  <select
                    value={simContext.seniority}
                    onChange={(e) => setSimContext({ ...simContext, seniority: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Employment</label>
                  <select
                    value={simContext.employmentType}
                    onChange={(e) => setSimContext({ ...simContext, employmentType: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-2.5 py-1.5 text-xs text-slate-800"
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
              variant="primary"
              className="w-full text-xs mt-2 rounded-xl"
            >
              {simulating ? (
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1.5 text-emerald-400" />
              )}
              Evaluate Deterministic Policy
            </Button>
          </div>

          {/* Simulation Evaluation Results */}
          <div className="lg:col-span-2 space-y-4">
            {simResult ? (
              <>
                {/* Matched Policies Header */}
                <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matched Active Policies ({simResult.matchedPolicies.length})
                    </h4>
                    <StatusBadge status="completed" label="Deterministic Pass" size="sm" />
                  </div>

                  <div className="space-y-2">
                    {simResult.matchedPolicies.map((pol) => (
                      <div
                        key={pol.policyId}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{pol.policyName}</span>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            Matches: {pol.matchedConditions.join(' • ')}
                          </div>
                        </div>
                        <Badge variant="secondary" size="sm" className="font-mono text-blue-700">
                          {pol.policyType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Computed Day-1 Baseline Entitlements */}
                <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Computed Day-1 Birthright Entitlements ({simResult.evaluatedEntitlements.filter(e => e.isBirthright).length})
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">Zero-approval immediate grant</span>
                  </div>

                  <div className="space-y-2">
                    {simResult.evaluatedEntitlements
                      .filter((ent) => ent.isBirthright)
                      .map((ent) => (
                        <div
                          key={ent.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{ent.name}</span>
                              <Badge variant="secondary" size="sm" className="text-[10px]">
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
                            <p className="text-xs text-slate-500">{ent.reason}</p>
                          </div>
                          <StatusBadge status="completed" label="AUTO_GRANTED" size="sm" />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Computed Approval-Gated Entitlements */}
                {simResult.evaluatedEntitlements.some((e) => !e.isBirthright) && (
                  <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600" />
                        Approval Gated Entitlements ({simResult.evaluatedEntitlements.filter(e => !e.isBirthright).length})
                      </h4>
                      <span className="text-xs text-amber-700 font-medium">Requires Manager / Security Chain</span>
                    </div>

                    <div className="space-y-2">
                      {simResult.evaluatedEntitlements
                        .filter((ent) => !ent.isBirthright)
                        .map((ent) => (
                          <div
                            key={ent.id}
                            className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{ent.name}</span>
                                <Badge variant="warning" size="sm" className="text-[10px]">
                                  {ent.app}
                                </Badge>
                                <Badge variant="danger" size="sm" className="text-[10px]">
                                  {ent.riskLevel} Risk
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600">{ent.reason}</p>
                            </div>
                            <StatusBadge status="warning" label="APPROVAL_GATED" size="sm" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200/90 rounded-3xl shadow-card flex flex-col items-center justify-center text-slate-400">
                <Play className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-bold text-slate-800">Run the Policy Simulator</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Configure a persona on the left or select an employee to see deterministic policy matching in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

