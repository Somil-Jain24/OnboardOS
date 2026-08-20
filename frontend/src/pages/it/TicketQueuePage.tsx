import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
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
  X,
  User,
  Users,
  Check,
  Send,
  MessageSquare,
} from 'lucide-react';
import type { Ticket as TicketType } from '../../types';

export function TicketQueuePage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'HIGH'>('ALL');

  // TASK-182: Triage Drawer State
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
    <div className="space-y-6">
      <PageHeader
        title="IT Operations Ticket Queue (FR-TICK-*)"
        description="Unified workplace triage queue with AI-powered category classification, priority rating, and automated SLA breach timers."
        badge={
          <Badge variant={openCount > 0 ? 'warning' : 'success'} dot>
            {openCount} In-Flight Open Tickets
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'ALL', label: `All Tickets (${tickets.length})` },
          { id: 'OPEN', label: `In-Flight Open (${openCount})` },
          { id: 'HIGH', label: 'High Priority / Critical' },
          { id: 'RESOLVED', label: 'Resolved History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-mono transition-colors ${
              filterStatus === tab.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No tickets match the selected filter.
          </Card>
        ) : (
          filteredTickets.map((t) => {
            const isResolved = t.status === 'RESOLVED';
            const isHigh = t.priority === 'HIGH' || t.priority === 'CRITICAL';

            return (
              <Card
                key={t.id}
                className={`p-4 transition-all border space-y-3 ${
                  isResolved
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-80'
                    : isHigh
                    ? 'bg-amber-950/15 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Ticket className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-blue-400 font-bold">{t.id}</span>
                        <h4 className="font-semibold text-slate-100">{t.description}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Requester: <strong className="text-slate-200">{t.employeeName}</strong> • Team: <span className="text-slate-300 font-mono">{t.team}</span> • Category: <span className="text-slate-300">{t.category}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant={isHigh ? 'danger' : 'warning'} size="sm">
                      {t.priority}
                    </Badge>
                    <Badge variant={isResolved ? 'success' : 'info'} size="sm">
                      {t.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenTriage(t)}
                      className="text-xs h-7 ml-2 border-slate-700 hover:bg-slate-800 text-slate-300"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-purple-400" /> Triage & Resolve
                    </Button>
                  </div>
                </div>

                {t.aiClassification && (
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <strong>AI Suggestion:</strong> {t.aiClassification.recommendedActions.join(' • ')}
                    </span>
                    <span className="font-mono text-[10px] text-purple-400">
                      Confidence: {(t.aiClassification.confidence * 100).toFixed(0)}% • Target SLA: {t.slaHours}h
                    </span>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* TASK-182: Ticket Resolution & AI Triage Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-400 text-xs font-bold">{selectedTicket.id}</span>
                  <h3 className="font-bold text-slate-100 text-sm">{selectedTicket.description}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Requester: <strong className="text-slate-200">{selectedTicket.employeeName}</strong> • Category: {selectedTicket.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Classification & SLA Badge */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Triage Copilot Recommendation
                </span>
                <Badge variant="default" size="sm" className="bg-purple-600/30 text-purple-300 border-purple-500/40 font-mono text-[10px]">
                  96% Match
                </Badge>
              </div>
              <p className="text-slate-300 text-[11px]">
                {selectedTicket.aiClassification?.recommendedActions.join(' • ') ||
                  'Automated category tag applied. Priority rated based on Day-1 onboarding blocker impact.'}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-purple-500/20">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>SLA Target: <strong>{selectedTicket.slaHours} hours</strong> (Auto-escalation timer active)</span>
              </div>
            </div>

            {/* Reassign Team */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-medium">Assigned Resolver Queue</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 flex-1 focus:outline-none focus:border-blue-500"
                >
                  <option value="IT Operations">IT Operations</option>
                  <option value="Security Engineering">Security Engineering</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="People Ops / HR">People Ops / HR</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReassign}
                  disabled={selectedTeam === selectedTicket.team || resolving}
                  className="border-slate-700 text-slate-300 text-xs"
                >
                  Reassign
                </Button>
              </div>
            </div>

            {/* Resolution Form */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-medium">Resolution Notes & Actions Taken</label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Re-issued Okta 2FA push token and verified successful login on laptop."
                className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTicket(null)}
                className="border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!resolutionNote.trim() || resolving}
                onClick={handleResolveSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                {resolving ? 'Resolving...' : 'Resolve & Close Ticket'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
