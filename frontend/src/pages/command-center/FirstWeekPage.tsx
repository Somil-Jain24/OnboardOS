import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  Calendar,
  Loader2,
} from 'lucide-react';
import type { FirstWeekPlanItem } from '../../types';

export function FirstWeekPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, loading } = useEmployee(id);
  const [items, setItems] = useState<FirstWeekPlanItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    async function load() {
      const data = await client.getFirstWeekPlan(id);
      setItems(data);
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

  const days = [1, 2, 3, 4, 5];
  const filtered = items.filter((i) => i.day === selectedDay);

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Smart First-Week Schedule"
        description="Structured, role-tailored 5-day orientation plan with automated calendar milestones, training sessions, and team syncs."
        badge={<Badge variant="default" dot>5-Day Ramp Plan</Badge>}
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              selectedDay === d
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Day Schedule List */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Day {selectedDay} Orientation Agenda
        </h4>

        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No milestones scheduled for Day {selectedDay}. Dedicated focus time & ramp-up.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  item.completed
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                    : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-mono text-xs font-semibold">
                    {item.time}
                  </span>
                  <div>
                    <span className={`font-bold text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.title}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <StatusBadge
                  status={item.completed ? 'completed' : 'ready'}
                  label={item.completed ? 'Completed' : item.category}
                  size="sm"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

