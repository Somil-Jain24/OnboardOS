import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  HeartHandshake,
  Calendar,
  Sparkles,
  Loader2,
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Technical Mentor & Buddy Pairing"
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
        <div className="space-y-6">
          {/* Pairings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Technical Mentor Card */}
            <div className="p-6 bg-white border border-purple-200 rounded-3xl shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-purple-50 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Technical Mentor
                </span>
                <Badge variant="purple" size="sm">
                  Role Guide
                </Badge>
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar name={mentor.mentorName} size="lg" status="online" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{mentor.mentorName}</h4>
                  <p className="text-xs text-slate-500">{mentor.mentorRole}</p>
                  <span className="text-xs text-purple-700 font-mono block mt-0.5">
                    Slack: {mentor.mentorSlack} • {mentor.mentorEmail}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Provides codebase walkthroughs, CI/CD orientation, pull request reviews, and engineering architecture deep dives.
              </p>
            </div>

            {/* Culture Buddy Card */}
            <div className="p-6 bg-white border border-blue-200 rounded-3xl shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-blue-50 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-mono flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  Culture & Pod Buddy
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
                  <span className="text-xs text-blue-700 font-mono block mt-0.5">
                    Slack: {mentor.buddySlack} • {mentor.buddyEmail}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Helps with company culture questions, team rituals, office navigation, and casual catch-ups.
              </p>
            </div>
          </div>

          {/* Scheduled Mentor Syncs */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Scheduled 1:1 Orientation Milestones
            </h4>

            <div className="space-y-2.5">
              {mentor.scheduledSyncs.map((sync, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-mono text-xs font-semibold">
                      {sync.date}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{sync.topic}</span>
                      <span className="text-slate-500 block text-xs mt-0.5">{sync.time}</span>
                    </div>
                  </div>

                  <StatusBadge status="completed" label={sync.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

