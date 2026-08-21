import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { client } from '../../services';
import {
  PlusCircle,
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
    <div className="space-y-6 max-w-4xl mx-auto text-left">
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
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              New IT Support Ticket (AI Auto-Categorization Active)
            </h3>

            <div className="space-y-3 text-xs md:text-sm">
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
                <label className="block text-slate-700 font-semibold mb-1 text-xs">Issue Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs md:text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button size="sm" variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" isLoading={submitting}>
                Submit to IT Ops Queue
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Your Active Helpdesk Tickets ({tickets.length})
        </h3>

        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <TicketIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400 text-xs">{t.id}</span>
                      <h4 className="font-bold text-slate-900">{t.description}</h4>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Category: <strong className="text-slate-700">{t.category}</strong> • Assigned Team: <strong className="text-slate-700">{t.team}</strong> • SLA: {t.slaHours}h target
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
                  className="flex-shrink-0"
                >
                  {t.status} • {t.priority}
                </Badge>
              </div>

              {/* AI Classification Pill */}
              {t.aiClassification && (
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/70 text-xs text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>
                    AI Classification: <strong>{t.aiClassification.suggestedCategory}</strong> (
                    {(t.aiClassification.confidence * 100).toFixed(0)}% confidence) • Recommended Action:{' '}
                    {t.aiClassification.recommendedActions.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

