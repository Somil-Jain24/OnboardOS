import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { client } from '../../services';
import {
  HelpCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Ticket as TicketIcon,
  Loader2,
} from 'lucide-react';
import type { Ticket } from '../../types';

export function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('Figma Enterprise Seat Request');
  const [category, setCategory] = useState('Software License');
  const [description, setDescription] = useState('Need enterprise seat assigned to priya.mehta@onboardos.internal for design sprints.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const data = await client.getTickets();
        setTickets(data);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newTicket = await client.createTicket({
        employeeId: 'emp-rahul',
        subject,
        category,
        description,
      });
      setTickets((prev) => [newTicket, ...prev]);
      setShowCreate(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="IT & Workplace Helpdesk"
        description="Submit tickets, track hardware orders, and request software license provisions with automated AI categorization and SLA tracking."
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCreate(!showCreate)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            {showCreate ? 'Cancel Ticket' : 'Open New Ticket'}
          </Button>
        }
      />

      {/* Ticket Creation Card */}
      {showCreate && (
        <form onSubmit={handleCreateTicket}>
          <Card className="p-5 bg-slate-900 border-blue-500/30 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              New IT Support Ticket (AI Auto-Categorization Active)
            </h3>

            <div className="space-y-3 text-xs">
              <Input
                label="Subject Summary"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Software License', label: 'Software License & Tools' },
                  { value: 'Access & IAM', label: 'Access & Permissions' },
                  { value: 'Hardware Support', label: 'Hardware & Peripherals' },
                  { value: 'Security & 2FA', label: 'Security & 2FA Keys' },
                ]}
              />

              <div>
                <label className="block text-slate-300 font-medium mb-1">Issue Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" isLoading={submitting}>
                Submit to IT Ops Queue
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Your Active Helpdesk Tickets ({tickets.length})
        </h3>

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
                    <TicketIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{t.id}</span>
                      <h4 className="font-semibold text-slate-100">{t.description}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Category: {t.category} • Assigned Team: {t.team} • SLA: {t.slaHours}h target
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    t.status === 'RESOLVED'
                      ? 'success'
                      : t.priority === 'HIGH'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {t.status} • {t.priority}
                </Badge>
              </div>

              {/* AI Classification Pill */}
              {t.aiClassification && (
                <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    AI Classification: <strong>{t.aiClassification.suggestedCategory}</strong> (
                    {(t.aiClassification.confidence * 100).toFixed(0)}% confidence) • Recommended Action:{' '}
                    {t.aiClassification.recommendedActions.join(', ')}
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
