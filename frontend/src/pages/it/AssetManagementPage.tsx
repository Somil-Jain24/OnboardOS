import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import { Laptop, Monitor, Key, CheckCircle2, Shield, ArrowRight, Loader2 } from 'lucide-react';
import type { Asset } from '../../types';

export function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getAssets();
        setAssets(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware & Physical Asset Lifecycle (FR-AST-*)"
        description="Track provisioning status, serial numbers, security keys, and automated return handoffs for laptops and peripherals."
        badge={<Badge variant="default" dot>{assets.length} Active Assigned Assets</Badge>}
      />

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          assets.map((ast) => (
            <Card key={ast.id} className="p-4 bg-slate-900/80 border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    {ast.type === 'LAPTOP' ? (
                      <Laptop className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">{ast.model}</h4>
                    <span className="text-[11px] text-slate-400">
                      Assigned to: <strong className="text-slate-200">{ast.employeeName}</strong> • Serial:{' '}
                      <span className="font-mono text-slate-300">{ast.serialNumber}</span>
                    </span>
                  </div>
                </div>

                <Badge variant={ast.state === 'ASSIGNED' ? 'success' : 'info'} size="sm">
                  {ast.state}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
