import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { client } from '../../services';
import { Calendar, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import type { FirstWeekPlanItem } from '../../types';

export function MyFirstWeekPage() {
  const [items, setItems] = useState<FirstWeekPlanItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getFirstWeekPlan('emp-rahul');
        setItems(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const days = [1, 2, 3, 4, 5];
  const filtered = items.filter((i) => i.day === selectedDay);

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="My First-Week Onboarding Schedule"
        description="Your step-by-step 5-day ramp agenda, team introductions, setup milestones, and architecture briefings."
      />

      <div className="flex items-center gap-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedDay === d
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Day {selectedDay} Schedule
          </h4>
        </div>

        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No meetings scheduled for Day {selectedDay}. Focus time for local setup & docs.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs md:text-sm ${
                  item.completed
                    ? 'bg-slate-50/50 border-slate-200/70 text-slate-500'
                    : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-mono text-xs font-bold">
                    {item.time}
                  </span>
                  <div>
                    <span className={`font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.title}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <StatusBadge
                  status={item.completed ? 'completed' : 'ready'}
                  label={item.completed ? 'Completed' : item.category}
                  size="sm"
                  className="flex-shrink-0"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

