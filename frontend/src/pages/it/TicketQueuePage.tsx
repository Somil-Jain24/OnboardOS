import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';
import type { Ticket as TicketType } from '../../types';

export function TicketQueuePage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getTickets();
        setTickets(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="IT Operations Ticket Queue (FR-TICK-*)"
        description="Unified workplace triage queue with AI-powered category classification, priority rating, and automated SLA breach timers."
        badge={
          <Badge variant="default" dot>
            {tickets.length} In-Flight Tickets
          </Badge>
        }
      />

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          tickets.map((t) => (
            <Card key={t.id} className="p-4 bg-slate-900/80 border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Ticket className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-bold">{t.id}</span>
                      <h4 className="font-semibold text-slate-100">{t.description}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Requested by: <strong className="text-slate-200">{t.employeeName}</strong> • Category: {t.category} • Target SLA: {t.slaHours}h
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={t.priority === 'HIGH' ? 'danger' : 'warning'} size="sm">
                    {t.priority} Priority
                  </Badge>
                  <Badge variant={t.status === 'RESOLVED' ? 'success' : 'info'} size="sm">
                    {t.status}
                  </Badge>
                </div>
              </div>

              {t.aiClassification && (
                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Recommendation: {t.aiClassification.recommendedActions.join(' • ')}
                  </span>
                  <span className="font-mono text-[10px] text-purple-400">
                    Confidence: {(t.aiClassification.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
