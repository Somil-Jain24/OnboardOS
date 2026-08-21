import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { client } from '../../services';
import type { DevicePostureSignal } from '../../types';

export function DeviceSignalsPage() {
  const [signals, setSignals] = useState<DevicePostureSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    try {
      setLoading(true);
      const data = await client.getDevicePostureSignals();
      setSignals(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Device-Aware Access Signals & Posture"
        description="Feed device management status (MDM), disk encryption, and OS trust posture into conditional access decision policies."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Device Posture Active</Badge>
            <Badge variant="purple">P2-26</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {signals.map((device) => {
          const isCompliant = device.complianceStatus === 'COMPLIANT';

          return (
            <div
              key={device.deviceId}
              className={`p-6 border rounded-3xl transition-all shadow-card bg-white space-y-4 ${
                isCompliant ? 'border-slate-200/90' : 'border-rose-300 ring-1 ring-rose-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{device.deviceId}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{device.deviceType}</h3>
                    <StatusBadge status={isCompliant ? 'completed' : 'failed'} label={device.complianceStatus} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Owner: <strong className="text-slate-800">{device.employeeName}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Trust Score</span>
                  <p className={`text-2xl font-bold font-mono ${device.trustScore > 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {device.trustScore}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Management</span>
                  <p className="font-bold text-slate-900 mt-0.5">{device.managementStatus}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Disk Encrypted</span>
                  <p className={`font-bold mt-0.5 ${device.diskEncrypted ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {device.diskEncrypted ? 'YES (FileVault)' : 'NO (Unencrypted)'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">OS Build</span>
                  <p className="font-bold text-slate-900 mt-0.5">{device.osVersion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

