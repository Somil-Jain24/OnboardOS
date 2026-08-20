import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { client } from '../../services';
import {
  HeartHandshake,
  Calendar,
  Sparkles,
  MessageSquare,
  Clock,
  ExternalLink,
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Technical Mentor & Culture Buddy"
        description="Connect with your dedicated guides for codebase orientation, engineering practices, and company culture."
      />

      {mentor && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-5 bg-slate-900/90 border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  Technical Mentor
                </span>
                <Badge variant="purple" size="sm">
                  Staff Engineer
                </Badge>
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar name={mentor.mentorName} size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{mentor.mentorName}</h4>
                  <p className="text-xs text-slate-400">{mentor.mentorRole}</p>
                  <span className="text-[11px] text-purple-300 font-mono">Slack: {mentor.mentorSlack}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Kavita is your go-to partner for backend service architecture, pull request reviews, and payments onboarding.
              </p>
            </Card>

            <Card className="p-5 bg-slate-900/90 border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Culture Buddy
                </span>
                <Badge variant="info" size="sm">
                  Peer Guide
                </Badge>
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar name={mentor.buddyName} size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{mentor.buddyName}</h4>
                  <p className="text-xs text-slate-400">{mentor.buddyRole}</p>
                  <span className="text-[11px] text-blue-300 font-mono">Slack: {mentor.buddySlack}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Alex is here to help with team rituals, workspace tips, company culture, and lunch catch-ups.
              </p>
            </Card>
          </div>

          {/* Scheduled 1:1s */}
          <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Scheduled Onboarding Syncs
            </h4>

            <div className="space-y-2">
              {mentor.scheduledSyncs.map((sync, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-[11px]">
                      {sync.date}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-100">{sync.topic}</span>
                      <span className="text-slate-400 block text-[11px]">{sync.time}</span>
                    </div>
                  </div>

                  <Badge variant="secondary" size="sm">
                    {sync.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
