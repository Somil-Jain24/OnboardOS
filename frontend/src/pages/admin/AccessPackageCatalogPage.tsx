import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { client } from '../../services';
import {
  Package,
  Plus,
  Search,
  Filter,
  Shield,
  Clock,
  Layers,
  CheckCircle2,
  Users,
  Server,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import type { AccessPackage, PackageEntitlement, RiskLevel } from '../../types';

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Access Package
          </Button>
        }
      />

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Curated Packages</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{packages.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Multi-application bundles</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Active Grants</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            {packages.reduce((acc, p) => acc + p.activeGrantCount, 0)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Governed assignments</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Total Requests</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-1">
            {packages.reduce((acc, p) => acc + p.requestCount, 0)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Self-service requests</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Critical Risk Bundles</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">
            {packages.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Gated with Security SLA</p>
        </Card>
      </div>

      {/* Main Catalog View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Package List */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search packages by title, code or app..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900/80 border-slate-800 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
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
                <Card
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-5 cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {pkg.code}
                        </span>
                        <h4 className="font-semibold text-slate-100 text-sm">{pkg.name}</h4>
                        <Badge
                          variant={
                            pkg.riskLevel === 'CRITICAL'
                              ? 'danger'
                              : pkg.riskLevel === 'HIGH'
                              ? 'warning'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {pkg.riskLevel} Risk
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">{pkg.description}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          {pkg.entitlements.length} Entitlements
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {pkg.maxDurationDays}d Max TTL
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          {pkg.activeGrantCount} Active Users
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        isSelected ? 'text-blue-400 translate-x-1' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Package Drilldown Detail */}
        <div>
          {selectedPackage ? (
            <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-5 sticky top-4">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 font-bold">{selectedPackage.code}</span>
                  <Badge variant="purple">{selectedPackage.category}</Badge>
                </div>
                <h3 className="font-bold text-slate-100 text-base">{selectedPackage.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{selectedPackage.description}</p>
              </div>

              {/* Package Governance Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Package Owner</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{selectedPackage.ownerName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Review Cycle</span>
                  <p className="font-semibold text-slate-200 mt-0.5">Every {selectedPackage.reviewFrequencyDays} Days</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Max Duration</span>
                  <p className="font-semibold text-purple-300 mt-0.5">{selectedPackage.maxDurationDays} Days TTL</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Risk Classification</span>
                  <p className="font-semibold text-amber-300 mt-0.5">{selectedPackage.riskLevel}</p>
                </div>
              </div>

              {/* Entitlement Bundle Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Bundled Entitlements ({selectedPackage.entitlements.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedPackage.entitlements.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-200">{ent.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {ent.app} • <span className="text-blue-400">{ent.permission}</span>
                        </div>
                      </div>
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        {ent.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Stages Stepper */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Approval Workflow ({selectedPackage.approvalStages.length} Stages)
                </h4>
                <div className="space-y-1.5">
                  {selectedPackage.approvalStages.map((stage) => (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <span className="text-slate-300 font-mono">
                        Stage {stage.stage}: <strong className="text-slate-100">{stage.approverRole}</strong>
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">{stage.slaHours}h SLA</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 bg-slate-900/40 border-slate-800">
              Select an access package to view entitlements and approval requirements.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
