import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  HeartHandshake,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  User,
} from 'lucide-react';
import type { MentorAssignment } from '../../types';

export function MentorPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, loading } = useEmployee(id);
  const [mentor, setMentor] = useState<MentorAssignment | null>(null);

  useEffect(() => {
    async function load() {
      const data = await client.getMentorAssignment(id);
      setMentor(data);
    }
    load();
  }, [id]);

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
        title="Technical Mentor & Buddy Pairing (FR-LIFE-06)"
        description="Facilitate peer onboarding relationships with automated technical mentor matching, culture buddy onboarding, and synchronized meeting schedules."
        badge={<Badge variant="purple" dot>AI-Matched Pairing</Badge>}
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {mentor && (
        <div className="space-y-5">
          {/* Pairings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Technical Mentor Card */}
            <Card className="p-5 bg-slate-900/90 border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Technical Mentor
                </span>
                <Badge variant="purple" size="sm">
                  Role Guide
                </Badge>
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar name={mentor.mentorName} size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{mentor.mentorName}</h4>
                  <p className="text-xs text-slate-400">{mentor.mentorRole}</p>
                  <span className="text-[11px] text-purple-300 font-mono">
                    Slack: {mentor.mentorSlack} • {mentor.mentorEmail}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Provides codebase walkthroughs, CI/CD orientation, pull request reviews, and engineering architecture deep dives.
              </p>
            </Card>

            {/* Culture Buddy Card */}
            <Card className="p-5 bg-slate-900/90 border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" />
                  Culture & Pod Buddy
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
                  <span className="text-[11px] text-blue-300 font-mono">
                    Slack: {mentor.buddySlack} • {mentor.buddyEmail}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Helps with company culture questions, team rituals, office navigation, and casual catch-ups.
              </p>
            </Card>
          </div>

          {/* Scheduled Mentor Syncs */}
          <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Scheduled 1:1 Orientation Milestones
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
