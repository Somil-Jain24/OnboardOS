import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Smile,
  Meh,
  Frown,
  Heart,
  TrendingUp,
  Send,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Loader2,
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
    { value: 'GREAT' as const, label: 'Feeling Great! 🚀', icon: <Heart className="w-5 h-5 text-emerald-400" />, desc: 'All tools working, team is super supportive.' },
    { value: 'GOOD' as const, label: 'Good & On Track 👍', icon: <Smile className="w-5 h-5 text-blue-400" />, desc: 'Making good progress on my onboarding tasks.' },
    { value: 'OKAY' as const, label: 'Okay / Neutral 😐', icon: <Meh className="w-5 h-5 text-amber-400" />, desc: 'Slight friction on access or waiting on approvals.' },
    { value: 'STRUGGLING' as const, label: 'Struggling / Blocked 🛑', icon: <Frown className="w-5 h-5 text-rose-400" />, desc: 'Need help from HR or IT immediately.' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Onboarding Sentiment & Pulse Tracker (FR-LIFE-07)"
        description="Share confidential weekly check-ins on your ramp-up experience to help People Ops maintain psychological safety and catch onboarding friction early."
        badge={<Badge variant="purple" dot>Confidential Feedback</Badge>}
      />

      {submitted ? (
        <Card className="p-8 text-center bg-slate-900/90 border-emerald-500/40 space-y-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">Thank you for your pulse check-in! ❤️</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your sentiment has been anonymously aggregated into cohort health metrics. If you indicated friction, your HR partner has been notified to assist.
          </p>
        </Card>
      ) : (
        /* Submission Card */
        <Card className="p-6 bg-slate-900/90 border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            How is your onboarding experience going this week?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => setPulseValue(opt.value)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                  pulseValue === opt.value
                    ? 'bg-purple-950/30 border-purple-500/60 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                <p className="text-[11px] text-slate-400">{opt.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block text-slate-300 font-medium">Optional Note to People Ops</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific roadblocks or shout-outs for your team?"
              className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button
              size="md"
              variant="primary"
              disabled={!pulseValue}
              isLoading={isSubmitting}
              onClick={handleSubmit}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Weekly Pulse
            </Button>
          </div>
        </Card>
      )}

      {/* Aggregate Cohort Trends Card */}
      <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Company-Wide Onboarding Sentiment Trend
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Last 3 Weeks Cohort Data</span>
        </div>

        <div className="space-y-3">
          {trends.map((t, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="font-semibold">{t.week}</span>
                <span className="font-mono text-emerald-400">{t.greatPercent + t.goodPercent}% Positive ({t.totalResponses} responses)</span>
              </div>
              <div className="h-3 rounded-full bg-slate-950 flex overflow-hidden">
                <div style={{ width: `${t.greatPercent}%` }} className="bg-emerald-500 h-full" title={`Great: ${t.greatPercent}%`} />
                <div style={{ width: `${t.goodPercent}%` }} className="bg-blue-500 h-full" title={`Good: ${t.goodPercent}%`} />
                <div style={{ width: `${t.okayPercent}%` }} className="bg-amber-500 h-full" title={`Okay: ${t.okayPercent}%`} />
                <div style={{ width: `${t.strugglingPercent}%` }} className="bg-rose-500 h-full" title={`Struggling: ${t.strugglingPercent}%`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
