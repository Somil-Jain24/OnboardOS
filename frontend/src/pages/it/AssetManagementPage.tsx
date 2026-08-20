import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { client } from '../../services';
import {
  Laptop,
  Monitor,
  Key,
  CheckCircle2,
  Shield,
  ArrowRight,
  Loader2,
  Plus,
  X,
  CreditCard,
  Mouse,
  RefreshCw,
  AlertTriangle,
  Check,
} from 'lucide-react';
import type { Asset, Employee } from '../../types';

export function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  // TASK-181 Drawer State
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: 'emp-devin-1',
    employeeName: 'Devin Larson',
    type: 'LAPTOP' as 'LAPTOP' | 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'ID_CARD' | 'ACCESS_CARD',
    model: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
    serialNumber: `APL-MBP-${Math.floor(100000 + Math.random() * 900000)}`,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [assetList, empList] = await Promise.all([
        client.getAssets(),
        client.getEmployees(),
      ]);
      setAssets(assetList);
      setEmployees(empList);
    } finally {
      setLoading(false);
    }
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const selectedEmp = employees.find((e) => e.id === formData.employeeId);
      await client.assignAsset({
        employeeId: formData.employeeId,
        employeeName: selectedEmp?.name || formData.employeeName,
        type: formData.type,
        model: formData.model,
        serialNumber: formData.serialNumber,
      });
      setAssignDrawerOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStateChange = async (
    assetId: string,
    newState: 'ASSIGNED' | 'RECEIVED' | 'DAMAGED' | 'LOST' | 'RETURNED'
  ) => {
    await client.updateAssetState(assetId, newState);
    await loadData();
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'LAPTOP':
        return <Laptop className="w-4 h-4" />;
      case 'MONITOR':
        return <Monitor className="w-4 h-4" />;
      case 'ID_CARD':
      case 'ACCESS_CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'KEYBOARD':
      case 'MOUSE':
        return <Mouse className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const filteredAssets = assets.filter(
    (a) => filterType === 'ALL' || a.type === filterType
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware & Physical Asset Lifecycle (FR-AST-*)"
        description="Track provisioning status, serial numbers, security keys, and automated return handoffs for laptops and peripherals."
        badge={<Badge variant="default" dot>{assets.length} Registered Enterprise Assets</Badge>}
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAssignDrawerOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs"
          >
            Assign Hardware Asset
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {['ALL', 'LAPTOP', 'MONITOR', 'ACCESS_CARD', 'KEYBOARD', 'MOUSE'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg font-mono transition-colors whitespace-nowrap ${
              filterType === type
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No assets match the selected filter. Click "Assign Hardware Asset" to register a device.
          </Card>
        ) : (
          filteredAssets.map((ast) => {
            const isAssigned = ast.state === 'ASSIGNED';
            const isReceived = ast.state === 'RECEIVED';
            const isDamagedOrLost = ast.state === 'DAMAGED' || ast.state === 'LOST';
            const isReturned = ast.state === 'RETURNED';

            return (
              <Card key={ast.id} className="p-4 bg-slate-900/80 border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      {getAssetIcon(ast.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-100">{ast.model}</h4>
                        <Badge
                          variant={
                            isReceived
                              ? 'success'
                              : isAssigned
                              ? 'default'
                              : isDamagedOrLost
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {ast.state}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Assigned to: <strong className="text-slate-200">{ast.employeeName}</strong> • Serial:{' '}
                        <span className="font-mono text-slate-300">{ast.serialNumber}</span>
                        {ast.assignedAt && ` • Dispatched: ${new Date(ast.assignedAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Status Transition Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {isAssigned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStateChange(ast.id, 'RECEIVED')}
                        className="text-xs h-7 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30"
                      >
                        <Check className="w-3 h-3 mr-1" /> Mark Received
                      </Button>
                    )}

                    {!isDamagedOrLost && !isReturned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStateChange(ast.id, 'RETURNED')}
                        className="text-xs h-7 border-slate-700 text-slate-400 hover:bg-slate-800"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Return Device
                      </Button>
                    )}

                    {!isDamagedOrLost && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStateChange(ast.id, 'DAMAGED')}
                        className="text-xs h-7 border-rose-500/30 text-rose-400 hover:bg-rose-950/30"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" /> Report Damaged
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* TASK-181: Assign Asset Slide-over Drawer / Modal */}
      {assignDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-slate-100 text-sm">Assign Hardware Asset</h3>
              </div>
              <button
                onClick={() => setAssignDrawerOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs">
              {/* Employee Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    setFormData({
                      ...formData,
                      employeeId: e.target.value,
                      employeeName: emp?.name || '',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.roleTitle} • {emp.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Hardware Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    const defaultModel =
                      t === 'LAPTOP'
                        ? 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)'
                        : t === 'MONITOR'
                        ? 'Dell UltraSharp 27" 4K USB-C Hub Monitor'
                        : t === 'ACCESS_CARD'
                        ? 'HID Global NFC Security Access Card'
                        : 'Logitech MX Master 3S Wireless Combo';
                    setFormData({
                      ...formData,
                      type: t,
                      model: defaultModel,
                      serialNumber: `APL-${t.substring(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`,
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="LAPTOP">Laptop / Workstation</option>
                  <option value="MONITOR">External Monitor</option>
                  <option value="ACCESS_CARD">NFC Building Access Card</option>
                  <option value="KEYBOARD">Mechanical Keyboard</option>
                  <option value="MOUSE">Ergonomic Mouse</option>
                  <option value="ID_CARD">Corporate ID Badge</option>
                </select>
              </div>

              {/* Model & Specs */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Hardware Model & Specifications</label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-950 border-slate-800 text-slate-200"
                  required
                />
              </div>

              {/* Serial Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Device Serial Number</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        serialNumber: `APL-${formData.type.substring(0, 3)}-${Math.floor(
                          100000 + Math.random() * 900000
                        )}`,
                      })
                    }
                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Auto-generate
                  </button>
                </div>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full bg-slate-950 border-slate-800 text-slate-200 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAssignDrawerOpen(false)}
                  className="border-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                >
                  {submitting ? 'Assigning...' : 'Confirm Hardware Dispatch'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
