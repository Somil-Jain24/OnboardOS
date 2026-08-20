import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { client } from '../../services';
import {
  Laptop,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((device) => {
          const isCompliant = device.complianceStatus === 'COMPLIANT';

          return (
            <Card
              key={device.deviceId}
              className={`p-5 border transition-all ${
                isCompliant ? 'bg-slate-900/80 border-slate-800' : 'bg-rose-950/15 border-rose-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{device.deviceId}</span>
                    <h3 className="font-semibold text-slate-100 text-sm">{device.deviceType}</h3>
                    <Badge variant={isCompliant ? 'default' : 'danger'} size="sm">
                      {device.complianceStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Owner: <strong className="text-slate-200">{device.employeeName}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Trust Score</span>
                  <p className={`text-xl font-bold font-mono ${device.trustScore > 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {device.trustScore}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 mt-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Management</span>
                  <p className="font-medium text-slate-200 mt-0.5">{device.managementStatus}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Disk Encrypted</span>
                  <p className={`font-medium mt-0.5 ${device.diskEncrypted ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {device.diskEncrypted ? 'YES (FileVault)' : 'NO (Unencrypted)'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">OS Build</span>
                  <p className="font-medium text-slate-200 mt-0.5">{device.osVersion}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
