import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { client } from '../../services';
import {
  Calendar,
  Loader2,
} from 'lucide-react';
import type { MentorAssignment } from '../../types';

export function MyMentorPage() {
  const [mentor, setMentor] = useState<MentorAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getMentorAssignment('emp-rahul');
        setMentor(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="My Technical Mentor & Culture Buddy"
        description="Connect with your dedicated guides for codebase orientation, engineering practices, and company culture."
      />

      {mentor && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 font-mono">
                  Technical Mentor
                </span>
                <Badge variant="purple" size="sm">
                  Staff Engineer
                </Badge>
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar name={mentor.mentorName} size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{mentor.mentorName}</h4>
                  <p className="text-xs text-slate-500">{mentor.mentorRole}</p>
                  <span className="text-[11px] text-purple-700 font-mono font-medium">Slack: {mentor.mentorSlack}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Kavita is your go-to partner for backend service architecture, pull request reviews, and payments onboarding.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono">
                  Culture Buddy
                </span>
                <Badge variant="info" size="sm">
                  Peer Guide
                </Badge>
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar name={mentor.buddyName} size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{mentor.buddyName}</h4>
                  <p className="text-xs text-slate-500">{mentor.buddyRole}</p>
                  <span className="text-[11px] text-blue-700 font-mono font-medium">Slack: {mentor.buddySlack}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Alex is here to help with team rituals, workspace tips, company culture, and lunch catch-ups.
              </p>
            </div>
          </div>

          {/* Scheduled 1:1s */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Scheduled Onboarding Syncs
              </h4>
            </div>

            <div className="space-y-2.5 pt-1">
              {mentor.scheduledSyncs.map((sync, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between gap-3 text-xs md:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-mono text-xs font-bold">
                      {sync.date}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{sync.topic}</span>
                      <span className="text-slate-500 block text-xs mt-0.5">{sync.time}</span>
                    </div>
                  </div>

                  <StatusBadge
                    status={sync.status === 'COMPLETED' ? 'completed' : 'pending'}
                    label={sync.status}
                    size="sm"
                    className="flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

