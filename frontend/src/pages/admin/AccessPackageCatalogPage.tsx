import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Package,
  Plus,
  Search,
  Clock,
  Layers,
  Users,
  ChevronRight,
  Lock,
} from 'lucide-react';
import type { AccessPackage, RiskLevel } from '../../types';

export function AccessPackageCatalogPage() {
  const [packages, setPackages] = useState<AccessPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPackage, setSelectedPackage] = useState<AccessPackage | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New package form
  const [newPkg, setNewPkg] = useState({
    name: '',
    code: '',
    description: '',
    category: 'DEVELOPMENT' as const,
    riskLevel: 'LOW' as RiskLevel,
    ownerName: 'Security Lead',
    ownerEmail: 'secops@onboardos.internal',
    maxDurationDays: 90,
    reviewFrequencyDays: 90,
    availableToScopes: { departments: ['Engineering'] },
    approvalStages: [{ stage: 1, approverRole: 'MANAGER' as const, slaHours: 24 }],
    entitlements: [
      {
        id: 'pe-new-1',
        name: 'GitHub Repository Contributor',
        app: 'GitHub',
        type: 'REPO_PERM' as const,
        permission: 'Write',
        riskLevel: 'LOW' as RiskLevel,
      },
    ],
  });

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    try {
      setLoading(true);
      const data = await client.getAccessPackages();
      setPackages(data);
      if (data.length > 0 && !selectedPackage) {
        setSelectedPackage(data[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePackage = async () => {
    if (!newPkg.name.trim()) return;
    await client.createAccessPackage(newPkg);
    await loadPackages();
    setShowCreateModal(false);
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || pkg.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Access Package & Entitlement Catalog"
        description="First-class entitlement bundles and curated access packages with automated approval chains, TTL expiry, and review governance."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Catalog Active</Badge>
            <Badge variant="purple">P0-15</Badge>
          </div>
        }
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="rounded-xl text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Access Package
          </Button>
        }
      />

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Curated Packages"
          value={packages.length}
          subtitle="Multi-application bundles"
          icon={<Package className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Active Grants"
          value={packages.reduce((acc, p) => acc + p.activeGrantCount, 0)}
          subtitle="Governed assignments"
          icon={<Layers className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Total Requests"
          value={packages.reduce((acc, p) => acc + p.requestCount, 0)}
          subtitle="Self-service requests"
          icon={<Users className="w-5 h-5" />}
          iconColor="purple"
        />
        <StatCard
          title="Critical Risk Bundles"
          value={packages.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length}
          subtitle="Gated with Security SLA"
          icon={<Lock className="w-5 h-5" />}
          iconColor="rose"
        />
      </div>

      {/* Main Catalog View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Package List */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search packages by title, code or app..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs rounded-2xl bg-white border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="FINANCE">Finance</option>
                <option value="SECURITY">Security</option>
                <option value="OPERATIONS">Operations</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredPackages.map((pkg) => {
              const isSelected = selectedPackage?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-6 cursor-pointer transition-all border rounded-3xl shadow-card ${
                    isSelected
                      ? 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                          {pkg.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                        <StatusBadge
                          status={
                            pkg.riskLevel === 'CRITICAL' || pkg.riskLevel === 'HIGH'
                              ? 'failed'
                              : 'completed'
                          }
                          label={`${pkg.riskLevel} Risk`}
                          size="sm"
                        />
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{pkg.description}</p>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1.5 font-sans font-medium text-slate-700">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          {pkg.entitlements.length} Entitlements
                        </span>
                        <span className="flex items-center gap-1.5 font-sans font-medium text-purple-700">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          {pkg.maxDurationDays}d Max TTL
                        </span>
                        <span className="flex items-center gap-1.5 font-sans font-medium text-emerald-700">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {pkg.activeGrantCount} Active Users
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition-transform mt-1 ${
                        isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Package Drilldown Detail */}
        <div>
          {selectedPackage ? (
            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5 sticky top-20">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-600 font-bold">{selectedPackage.code}</span>
                  <Badge variant="purple">{selectedPackage.category}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{selectedPackage.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{selectedPackage.description}</p>
              </div>

              {/* Package Governance Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Package Owner</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedPackage.ownerName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Review Cycle</span>
                  <p className="font-bold text-slate-900 mt-0.5">Every {selectedPackage.reviewFrequencyDays} Days</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Max Duration</span>
                  <p className="font-bold text-purple-700 mt-0.5">{selectedPackage.maxDurationDays} Days TTL</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Risk Classification</span>
                  <p className="font-bold text-amber-700 mt-0.5">{selectedPackage.riskLevel}</p>
                </div>
              </div>

              {/* Entitlement Bundle Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Bundled Entitlements ({selectedPackage.entitlements.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedPackage.entitlements.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{ent.name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {ent.app} • <span className="text-blue-600 font-semibold">{ent.permission}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {ent.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Stages Stepper */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Approval Workflow ({selectedPackage.approvalStages.length} Stages)
                </h4>
                <div className="space-y-2">
                  {selectedPackage.approvalStages.map((stage) => (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="text-slate-700 font-sans">
                        Stage {stage.stage}: <strong className="text-slate-900">{stage.approverRole}</strong>
                      </span>
                      <span className="text-slate-500 font-mono text-xs">{stage.slaHours}h SLA</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white border border-slate-200/90 rounded-3xl shadow-card">
              Select an access package to view entitlements and approval requirements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

