import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Smile,
  Meh,
  Frown,
  Heart,
  Send,
  CheckCircle2,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import type { PulseTrendData } from '../../types';

export function PulseCheckPage() {
  const [pulseValue, setPulseValue] = useState<'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING' | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trends, setTrends] = useState<PulseTrendData[]>([]);

  useEffect(() => {
    async function loadTrends() {
      const data = await client.getPulseTrends();
      setTrends(data);
    }
    loadTrends();
  }, []);

  const handleSubmit = async () => {
    if (!pulseValue) return;
    setIsSubmitting(true);
    try {
      await client.submitPulse('emp-rahul', pulseValue, note);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { value: 'GREAT' as const, label: 'Feeling Great! 🚀', icon: <Heart className="w-5 h-5 text-emerald-600" />, desc: 'All tools working, team is super supportive.' },
    { value: 'GOOD' as const, label: 'Good & On Track 👍', icon: <Smile className="w-5 h-5 text-blue-600" />, desc: 'Making good progress on my onboarding tasks.' },
    { value: 'OKAY' as const, label: 'Okay / Neutral 😐', icon: <Meh className="w-5 h-5 text-amber-600" />, desc: 'Slight friction on access or waiting on approvals.' },
    { value: 'STRUGGLING' as const, label: 'Struggling / Blocked 🛑', icon: <Frown className="w-5 h-5 text-rose-600" />, desc: 'Need help from HR or IT immediately.' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Onboarding Sentiment & Pulse Tracker"
        description="Share confidential weekly check-ins on your ramp-up experience to help People Ops maintain psychological safety and catch onboarding friction early."
        badge={<Badge variant="purple" dot>Confidential Feedback</Badge>}
      />

      {submitted ? (
        <div className="p-8 text-center bg-white border border-emerald-200 rounded-3xl shadow-card space-y-3 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Thank you for your pulse check-in! ❤️</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your sentiment has been anonymously aggregated into cohort health metrics. If you indicated friction, your HR partner has been notified to assist.
          </p>
        </div>
      ) : (
        /* Submission Card */
        <div className="p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              How is your onboarding experience going this week?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => setPulseValue(opt.value)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  pulseValue === opt.value
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs md:text-sm text-slate-900">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs md:text-sm">
            <label className="block text-slate-700 font-semibold mb-1 text-xs">Optional Note to People Ops</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific roadblocks or shout-outs for your team?"
              className="w-full h-24 p-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs md:text-sm"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              size="md"
              variant="primary"
              disabled={!pulseValue}
              isLoading={isSubmitting}
              onClick={handleSubmit}
              leftIcon={<Send className="w-4 h-4" />}
              className="rounded-2xl px-6"
            >
              Submit Weekly Pulse
            </Button>
          </div>
        </div>
      )}

      {/* Aggregate Cohort Trends Card */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Company-Wide Onboarding Sentiment Trend
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Last 3 Weeks Cohort Data</span>
        </div>

        <div className="space-y-4 pt-1">
          {trends.map((t, idx) => (
            <div key={idx} className="space-y-1.5 text-xs md:text-sm">
              <div className="flex justify-between text-slate-700 font-medium">
                <span className="font-bold text-slate-900">{t.week}</span>
                <span className="font-mono text-emerald-600 font-semibold">{t.greatPercent + t.goodPercent}% Positive ({t.totalResponses} responses)</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 border border-slate-200/80 flex overflow-hidden">
                <div style={{ width: `${t.greatPercent}%` }} className="bg-emerald-500" title="Great" />
                <div style={{ width: `${t.goodPercent}%` }} className="bg-blue-500" title="Good" />
                <div style={{ width: `${t.okayPercent}%` }} className="bg-amber-400" title="Okay" />
                <div style={{ width: `${t.strugglingPercent}%` }} className="bg-rose-500" title="Struggling" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
