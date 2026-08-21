import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  RefreshCw,
} from 'lucide-react';
import type { SCIMConnector } from '../../types';

export function SCIMConnectorsPage() {
  const [connectors, setConnectors] = useState<SCIMConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; latencyMs: number } | null>(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  async function loadConnectors() {
    try {
      setLoading(true);
      const data = await client.getSCIMConnectors();
      setConnectors(data);
    } finally {
      setLoading(false);
    }
  }

  const handleTest = async (id: string) => {
    try {
      setTestingId(id);
      const res = await client.testSCIMConnector(id);
      setTestResult({ id, message: res.message, latencyMs: res.latencyMs });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="SCIM 2.0 Provisioning Connector Telemetry"
        description="Monitor RFC 7643 / 7644 standards-compliant SCIM 2.0 connectors for automated lifecycle user and group synchronizations."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>SCIM 2.0 Online</Badge>
            <Badge variant="purple">P1-22</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connectors.map((conn) => {
          const isTesting = testingId === conn.id;
          const result = testResult?.id === conn.id ? testResult : null;

          return (
            <div key={conn.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{conn.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{conn.appName}</h3>
                    <StatusBadge status="completed" label={conn.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate max-w-md">{conn.endpointUrl}</p>
                </div>
                <Badge variant="secondary" size="sm" className="font-mono">{conn.scimVersion}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Success Rate</span>
                  <p className="font-bold text-emerald-600 mt-0.5">{conn.syncSuccessRate}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Synced Users</span>
                  <p className="font-bold text-slate-900 mt-0.5">{conn.totalSyncedUsers}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Auth Type</span>
                  <p className="font-bold text-blue-600 mt-0.5">{conn.authType}</p>
                </div>
              </div>

              {result && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-mono">
                  ✓ {result.message} ({result.latencyMs}ms)
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-mono">
                  Last Health Check: {new Date(conn.lastHealthCheck).toLocaleTimeString()}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isTesting}
                  onClick={() => handleTest(conn.id)}
                  className="rounded-xl text-xs h-8"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing...' : 'Test SCIM Endpoint'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

