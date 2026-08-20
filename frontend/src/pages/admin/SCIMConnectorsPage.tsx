import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Server,
  Activity,
  CheckCircle2,
  RefreshCw,
  Globe,
  Lock,
  Layers,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
            <Card key={conn.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-4 shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{conn.id}</span>
                    <h3 className="font-semibold text-slate-100 text-base">{conn.appName}</h3>
                    <Badge variant="default" size="sm">{conn.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-md">{conn.endpointUrl}</p>
                </div>
                <Badge variant="outline" size="sm" className="font-mono">{conn.scimVersion}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Success Rate</span>
                  <p className="font-bold text-emerald-400 mt-0.5">{conn.syncSuccessRate}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Synced Users</span>
                  <p className="font-bold text-slate-200 mt-0.5">{conn.totalSyncedUsers}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Auth Type</span>
                  <p className="font-bold text-blue-400 mt-0.5">{conn.authType}</p>
                </div>
              </div>

              {result && (
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded text-xs text-emerald-300 font-mono">
                  ✓ {result.message} ({result.latencyMs}ms)
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-500 font-mono">
                  Last Health Check: {new Date(conn.lastHealthCheck).toLocaleTimeString()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isTesting}
                  onClick={() => handleTest(conn.id)}
                  className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs h-8"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing...' : 'Test SCIM Endpoint'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
