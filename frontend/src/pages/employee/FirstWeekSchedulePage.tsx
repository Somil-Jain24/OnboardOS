import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  UserCheck,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronRight,
  MapPin,
  Users,
  Target,
  ArrowRight,
  X,
  PlusCircle,
  Edit3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScheduleEvent {
  id: string;
  day: number;
  dayTitle: string;
  time: string;
  title: string;
  description: string;
  type: '1ON1' | 'WORKSHOP' | 'STANDUP' | 'SOLO' | 'SOCIAL';
  attendees: string[];
  meetingLink?: string;
  completed?: boolean;
}

export function FirstWeekSchedulePage() {
  const { activeEmployeeId, currentUser } = useAuth();
  const effectiveEmployeeId =
    currentUser?.role === 'EMPLOYEE' && currentUser.employeeId
      ? currentUser.employeeId
      : activeEmployeeId || 'emp-rahul';
  const { employee } = useEmployee(effectiveEmployeeId);

  const managerName = employee?.managerName || 'Marcus Vance';
  const managerRole = 'Engineering Manager & Team Lead';
  const managerEmail = `${managerName.toLowerCase().replace(/\s+/g, '.')}@onboardos.internal`;

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showMeetManagerModal, setShowMeetManagerModal] = useState<boolean>(false);
  const [meetingNotes, setMeetingNotes] = useState<string>(
    '1. Introductions and role expectations overview.\n2. Discussion of 30-60-90 day engineering goals.\n3. Team ceremonies (Daily standup at 10 AM, bi-weekly sprint planning).\n4. Questions regarding codebase access and repo architecture.'
  );
  const [savedNotesSuccess, setSavedNotesSuccess] = useState<boolean>(false);
  const [managerMeetingCompleted, setManagerMeetingCompleted] = useState<boolean>(false);

  const initialSchedule: ScheduleEvent[] = [
    // Day 1
    {
      id: 'sch-1',
      day: 1,
      dayTitle: 'Day 1 • Orientation & Core Setup',
      time: '09:30 AM - 10:30 AM',
      title: 'Company Welcome & IT Setup Verification',
      description: 'Meet the People Ops team, verify Google Workspace and Slack credentials, and setup password manager.',
      type: 'WORKSHOP',
      attendees: ['Sarah Chen (HR)', employee?.name || 'You'],
      meetingLink: 'https://meet.google.com/onboardos-welcome',
      completed: true,
    },
    {
      id: 'sch-2',
      day: 1,
      dayTitle: 'Day 1 • Orientation & Core Setup',
      time: '11:30 AM - 12:15 PM',
      title: '1:1 Welcome & Team Expectations Catchup',
      description: 'Introductory sync with your direct manager to align on first-week objectives and team rituals.',
      type: '1ON1',
      attendees: [managerName, employee?.name || 'You'],
      meetingLink: 'https://meet.google.com/onboardos-manager-sync',
      completed: managerMeetingCompleted,
    },
    {
      id: 'sch-3',
      day: 1,
      dayTitle: 'Day 1 • Orientation & Core Setup',
      time: '03:00 PM - 03:45 PM',
      title: 'Peer Buddy & Mentor Coffee Chat',
      description: 'Casual introduction with your designated buddy to learn team workflow tips and informal best practices.',
      type: 'SOCIAL',
      attendees: ['Aman Verma (Senior Backend Dev)', employee?.name || 'You'],
      meetingLink: 'https://meet.google.com/onboardos-buddy-chat',
    },

    // Day 2
    {
      id: 'sch-4',
      day: 2,
      dayTitle: 'Day 2 • Deep Dive & Architecture',
      time: '10:00 AM - 10:30 AM',
      title: 'Payments Core Daily Engineering Standup',
      description: 'Join the morning agile standup to meet the squad and observe active sprint progress.',
      type: 'STANDUP',
      attendees: ['Payments Squad (8 engineers)', employee?.name || 'You'],
      meetingLink: 'https://meet.google.com/onboardos-daily-standup',
    },
    {
      id: 'sch-5',
      day: 2,
      dayTitle: 'Day 2 • Deep Dive & Architecture',
      time: '02:00 PM - 03:30 PM',
      title: 'Core Microservices Architecture Walkthrough',
      description: 'Technical walkthrough of domain services, message queues, and database schemas with tech lead.',
      type: 'WORKSHOP',
      attendees: ['Priya Mehta (Lead Architect)', employee?.name || 'You'],
      meetingLink: 'https://meet.google.com/onboardos-arch-review',
    },

    // Day 3
    {
      id: 'sch-6',
      day: 3,
      dayTitle: 'Day 3 • Local Dev & First Contribution',
      time: '11:00 AM - 12:30 PM',
      title: 'Local Environment Setup & First Ticket Claim',
      description: 'Clone primary repository, run test suites locally, and pick your first starter Jira issue.',
      type: 'SOLO',
      attendees: [employee?.name || 'You'],
    },
    {
      id: 'sch-7',
      day: 3,
      dayTitle: 'Day 3 • Local Dev & First Contribution',
      time: '04:00 PM - 04:30 PM',
      title: 'DevOps & CI/CD Pipeline Onboarding',
      description: 'Overview of automated pull-request checks, staging deployment pipelines, and observability metrics.',
      type: 'WORKSHOP',
      attendees: ['David Kim (IT/DevOps)', employee?.name || 'You'],
    },

    // Day 4
    {
      id: 'sch-8',
      day: 4,
      dayTitle: 'Day 4 • Code Review & Security Training',
      time: '10:00 AM - 10:30 AM',
      title: 'Daily Standup & Sprint Sync',
      description: 'Share updates on starter ticket progress and address any environment blockers.',
      type: 'STANDUP',
      attendees: ['Payments Squad', employee?.name || 'You'],
    },
    {
      id: 'sch-9',
      day: 4,
      dayTitle: 'Day 4 • Code Review & Security Training',
      time: '02:00 PM - 03:00 PM',
      title: 'SOC 2 Type II Security Training & Best Practices',
      description: 'Complete compliance handbook module on zero-trust least privilege hygiene.',
      type: 'SOLO',
      attendees: [employee?.name || 'You'],
    },

    // Day 5
    {
      id: 'sch-10',
      day: 5,
      dayTitle: 'Day 5 • Week-1 Retrospective & Signoff',
      time: '10:00 AM - 10:30 AM',
      title: 'Daily Standup & Sprint Commitments',
      description: 'Review merged starter PR and upcoming sprint commitments.',
      type: 'STANDUP',
      attendees: ['Payments Squad', employee?.name || 'You'],
    },
    {
      id: 'sch-11',
      day: 5,
      dayTitle: 'Day 5 • Week-1 Retrospective & Signoff',
      time: '03:30 PM - 04:15 PM',
      title: '1:1 Manager Week-1 Retrospective & Day-1 Signoff',
      description: 'Wrap up your first week, review completed tool requirements, and formalize Day-1 Ready sign-off.',
      type: '1ON1',
      attendees: [managerName, employee?.name || 'You'],
      meetingLink: 'https://meet.google.com/onboardos-manager-sync',
    },
  ];

  const currentDayEvents = initialSchedule.filter((e) => e.day === selectedDay);

  const handleSaveNotes = () => {
    setSavedNotesSuccess(true);
    setTimeout(() => setSavedNotesSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left pb-16">
      <PageHeader
        title="First-Week Orientation & Onboarding Schedule"
        description="Structured, personalized 5-day schedule covering technical setup, team ceremonies, peer buddies, and manager check-ins."
      />

      {/* Top Highlight Card: Meet Manager Spotlight */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            Direct Manager & Signoff Lead
          </div>
          <h2 className="text-xl md:text-2xl font-bold">1:1 Onboarding Sync with {managerName}</h2>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl leading-relaxed">
            Your manager has scheduled 1:1 touchpoints during your first week to align on goals, answer questions, and ensure seamless provisioning access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowMeetManagerModal(true)}
            leftIcon={<Video className="w-4 h-4 text-blue-600" />}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md rounded-2xl"
          >
            Meet Manager (1:1 Hub)
          </Button>
          <Link to="/me/tasks">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold rounded-2xl"
            >
              View Daily Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { day: 1, label: 'Day 1', subtitle: 'Orientation' },
          { day: 2, label: 'Day 2', subtitle: 'Architecture' },
          { day: 3, label: 'Day 3', subtitle: 'First PR' },
          { day: 4, label: 'Day 4', subtitle: 'Code Review' },
          { day: 5, label: 'Day 5', subtitle: 'Retrospective' },
        ].map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedDay === d.day
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider ${selectedDay === d.day ? 'text-blue-100' : 'text-slate-400'}`}>
              {d.label}
            </div>
            <div className="text-xs font-bold mt-0.5 truncate">{d.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Schedule Items for Selected Day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            {initialSchedule.find((e) => e.day === selectedDay)?.dayTitle}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {currentDayEvents.length} Scheduled Events
          </span>
        </div>

        <div className="space-y-3">
          {currentDayEvents.map((event) => (
            <div
              key={event.id}
              className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-100 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                      event.type === '1ON1'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : event.type === 'WORKSHOP'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : event.type === 'STANDUP'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : event.type === 'SOCIAL'
                        ? 'bg-pink-100 text-pink-800 border border-pink-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {event.type}
                  </span>

                  {event.completed && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attended
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{event.description}</p>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Participants: {event.attendees.join(' • ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {event.type === '1ON1' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowMeetManagerModal(true)}
                    leftIcon={<HeartHandshake className="w-3.5 h-3.5" />}
                    className="rounded-xl font-bold"
                  >
                    Open 1:1 Hub
                  </Button>
                ) : event.meetingLink ? (
                  <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Video className="w-3.5 h-3.5 text-blue-600" />}
                      rightIcon={<ExternalLink className="w-3 h-3 text-slate-400" />}
                      className="rounded-xl font-bold"
                    >
                      Join Google Meet
                    </Button>
                  </a>
                ) : (
                  <Link to="/me/tasks">
                    <Button size="sm" variant="secondary" className="rounded-xl font-bold">
                      Open Daily Tasks
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Meet Manager Modal */}
      {showMeetManagerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 md:p-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20">
                  {managerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{managerName}</h3>
                  <p className="text-xs text-slate-500">{managerRole} • {managerEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMeetManagerModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://meet.google.com/onboardos-manager-sync"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-2xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-blue-900">Launch Google Meet</div>
                    <div className="text-[10px] text-blue-700">Dedicated 1:1 video bridge</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={`mailto:${managerEmail}?subject=Onboarding%201:1%20Catchup`}
                className="p-3.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-2xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-600 text-white rounded-xl">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-purple-900">Send Direct Email</div>
                    <div className="text-[10px] text-purple-700">{managerEmail}</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* 1:1 Agenda & Talking Points */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                Structured 1:1 Agenda & Talking Points
              </span>
              <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">1.</span>
                  <span><strong>Day-1 Readiness Verification:</strong> Confirm all corporate identity accounts (Google, Slack, GitHub, Jira) are active without roadblocks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">2.</span>
                  <span><strong>30/60/90 Day Milestone Alignment:</strong> Review core metrics, starter tickets, and expectations for the first sprint.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 shrink-0">3.</span>
                  <span><strong>Privileged Access Sign-off:</strong> Review required AWS IAM roles and elevated permissions requiring manager approval.</span>
                </div>
              </div>
            </div>

            {/* 1:1 Collaborative Notes Scratchpad */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Your 1:1 Notes & Questions Scratchpad
                </span>
                <span className="text-[10px] text-slate-400">Shared with Manager</span>
              </div>
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={4}
                className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Type your talking points, questions, or notes..."
              />
              <div className="flex items-center justify-between">
                {savedNotesSuccess && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Notes saved successfully!
                  </span>
                )}
                <div className="ml-auto">
                  <Button size="sm" variant="secondary" onClick={handleSaveNotes} className="rounded-xl text-xs font-bold">
                    Save Notes
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                size="md"
                variant="secondary"
                onClick={() => setShowMeetManagerModal(false)}
                className="rounded-2xl text-xs font-bold"
              >
                Close
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  setManagerMeetingCompleted(true);
                  setShowMeetManagerModal(false);
                }}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="rounded-2xl text-xs font-bold"
              >
                Mark 1:1 Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FirstWeekSchedulePage;
