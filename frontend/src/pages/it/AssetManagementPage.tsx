import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { client } from '../../services';
import {
  Laptop,
  Monitor,
  Key,
  CheckCircle2,
  Plus,
  X,
  CreditCard,
  Mouse,
  RefreshCw,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import type { Asset, Employee } from '../../types';

export function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

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
    <div className="space-y-6 text-left">
      <PageHeader
        title="Hardware & Physical Asset Lifecycle"
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
      <div className="flex items-center gap-2 pb-1 overflow-x-auto text-xs">
        {['ALL', 'LAPTOP', 'MONITOR', 'ACCESS_CARD', 'KEYBOARD', 'MOUSE'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all whitespace-nowrap cursor-pointer ${
              filterType === type
                ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-3xl shadow-card">
            No assets match the selected filter. Click "Assign Hardware Asset" to register a device.
          </div>
        ) : (
          filteredAssets.map((ast) => {
            const isAssigned = ast.state === 'ASSIGNED';
            const isReceived = ast.state === 'RECEIVED';
            const isDamagedOrLost = ast.state === 'DAMAGED' || ast.state === 'LOST';
            const isReturned = ast.state === 'RETURNED';

            return (
              <div key={ast.id} className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      {getAssetIcon(ast.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900">{ast.model}</h4>
                        <StatusBadge
                          status={
                            isReceived
                              ? 'completed'
                              : isAssigned
                              ? 'in-progress'
                              : isDamagedOrLost
                              ? 'failed'
                              : 'warning'
                          }
                          label={ast.state}
                          size="sm"
                        />
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Assigned to: <strong className="text-slate-800">{ast.employeeName}</strong> • Serial:{' '}
                        <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">{ast.serialNumber}</span>
                        {ast.assignedAt && ` • Dispatched: ${new Date(ast.assignedAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Status Transition Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {isAssigned && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStateChange(ast.id, 'RECEIVED')}
                        className="text-xs h-8 text-emerald-700 hover:text-emerald-800 rounded-xl"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Mark Received
                      </Button>
                    )}

                    {!isDamagedOrLost && !isReturned && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStateChange(ast.id, 'RETURNED')}
                        className="text-xs h-8 rounded-xl"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-600" /> Return Device
                      </Button>
                    )}

                    {!isDamagedOrLost && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStateChange(ast.id, 'DAMAGED')}
                        className="text-xs h-8 rounded-xl"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Report Damaged
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Asset Modal */}
      {assignDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Assign Hardware Asset</h3>
              </div>
              <button
                onClick={() => setAssignDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              {/* Employee Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Employee</label>
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
                  className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs"
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
                <label className="block text-slate-700 font-semibold mb-1">Hardware Category</label>
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
                  className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs"
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
                <label className="block text-slate-700 font-semibold mb-1">Hardware Model & Specifications</label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              {/* Serial Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Device Serial Number</label>
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
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-generate
                  </button>
                </div>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setAssignDrawerOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={submitting}
                  className="text-xs"
                >
                  {submitting ? 'Assigning...' : 'Confirm Hardware Dispatch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

