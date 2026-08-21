import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import type { Ticket as TicketType } from '../../types';

export function TicketQueuePage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'HIGH'>('ALL');

  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('IT Operations');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      setLoading(true);
      const data = await client.getTickets();
      setTickets(data);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenTriage = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setSelectedTeam(ticket.team || 'IT Operations');
    setResolutionNote('');
  };

  const handleResolveSubmit = async () => {
    if (!selectedTicket || !resolutionNote.trim()) return;
    try {
      setResolving(true);
      await client.resolveTicket(selectedTicket.id, resolutionNote);
      setSelectedTicket(null);
      setResolutionNote('');
      await loadTickets();
    } finally {
      setResolving(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedTicket) return;
    try {
      setResolving(true);
      await client.reassignTicket(selectedTicket.id, selectedTeam);
      setSelectedTicket(null);
      await loadTickets();
    } finally {
      setResolving(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'OPEN') return t.status !== 'RESOLVED';
    if (filterStatus === 'RESOLVED') return t.status === 'RESOLVED';
    if (filterStatus === 'HIGH') return t.priority === 'HIGH' || t.priority === 'CRITICAL';
    return true;
  });

  const openCount = tickets.filter((t) => t.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="IT Operations Ticket Queue"
        description="Unified workplace triage queue with AI-powered category classification, priority rating, and automated SLA breach timers."
        badge={
          <Badge variant={openCount > 0 ? 'warning' : 'success'} dot>
            {openCount} In-Flight Open Tickets
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-1 text-xs overflow-x-auto">
        {[
          { id: 'ALL', label: `All Tickets (${tickets.length})` },
          { id: 'OPEN', label: `In-Flight Open (${openCount})` },
          { id: 'HIGH', label: 'High Priority / Critical' },
          { id: 'RESOLVED', label: 'Resolved History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-3xl shadow-card">
            No tickets match the selected filter.
          </div>
        ) : (
          filteredTickets.map((t) => {
            const isResolved = t.status === 'RESOLVED';
            const isHigh = t.priority === 'HIGH' || t.priority === 'CRITICAL';

            return (
              <div
                key={t.id}
                className={`p-5 rounded-3xl transition-all border bg-white shadow-card space-y-3 ${
                  isResolved
                    ? 'border-slate-200/80 opacity-80'
                    : isHigh
                    ? 'border-amber-300 ring-1 ring-amber-200/50'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-blue-700 font-bold text-xs">{t.id}</span>
                        <h4 className="font-bold text-slate-900">{t.description}</h4>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Requester: <strong className="text-slate-800">{t.employeeName}</strong> • Team: <span className="text-slate-700 font-mono">{t.team}</span> • Category: <span className="text-slate-700">{t.category}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={isHigh ? 'warning' : 'completed'} label={t.priority} size="sm" />
                    <StatusBadge status={isResolved ? 'completed' : 'pending'} label={t.status} size="sm" />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenTriage(t)}
                      className="text-xs h-8 ml-2 rounded-xl"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" /> Triage & Resolve
                    </Button>
                  </div>
                </div>

                {t.aiClassification && (
                  <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/70 text-xs text-purple-900 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <strong>AI Suggestion:</strong> {t.aiClassification.recommendedActions.join(' • ')}
                    </span>
                    <span className="font-mono text-xs text-purple-700 font-semibold">
                      Confidence: {(t.aiClassification.confidence * 100).toFixed(0)}% • Target SLA: {t.slaHours}h
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Resolution & AI Triage Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-600 text-xs font-bold">{selectedTicket.id}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedTicket.description}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Requester: <strong className="text-slate-800">{selectedTicket.employeeName}</strong> • Category: {selectedTicket.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Classification & SLA Badge */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-900 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Triage Copilot Recommendation
                </span>
                <Badge variant="purple" size="sm" className="font-mono text-[10px]">
                  96% Match
                </Badge>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {selectedTicket.aiClassification?.recommendedActions.join(' • ') ||
                  'Automated category tag applied. Priority rated based on Day-1 onboarding blocker impact.'}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 pt-1.5 border-t border-purple-200/60">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>SLA Target: <strong>{selectedTicket.slaHours} hours</strong> (Auto-escalation timer active)</span>
              </div>
            </div>

            {/* Reassign Team */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-700 font-semibold text-xs">Assigned Resolver Queue</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-white border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs"
                >
                  <option value="IT Operations">IT Operations</option>
                  <option value="Security Engineering">Security Engineering</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="People Ops / HR">People Ops / HR</option>
                </select>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleReassign}
                  disabled={selectedTeam === selectedTicket.team || resolving}
                  className="text-xs"
                >
                  Reassign
                </Button>
              </div>
            </div>

            {/* Resolution Form */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-700 font-semibold text-xs">Resolution Notes & Actions Taken</label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Re-issued Okta 2FA push token and verified successful login on laptop."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedTicket(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="success"
                disabled={!resolutionNote.trim() || resolving}
                onClick={handleResolveSubmit}
                className="text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                {resolving ? 'Resolving...' : 'Resolve & Close Ticket'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

