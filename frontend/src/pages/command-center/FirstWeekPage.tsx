import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Laptop,
  Users,
  BookOpen,
  ArrowRight,
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const days = [1, 2, 3, 4, 5];
  const filtered = items.filter((i) => i.day === selectedDay);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Smart First-Week Schedule (FR-LIFE-05)"
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
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedDay === d
                ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Day Schedule List */}
      <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Day {selectedDay} Orientation Agenda
        </h4>

        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No milestones scheduled for Day {selectedDay}. Dedicated focus time & ramp-up.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  item.completed
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-[11px]">
                    {item.time}
                  </span>
                  <div>
                    <span className={`font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {item.title}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    item.completed
                      ? 'success'
                      : item.category === 'MEETING'
                      ? 'info'
                      : item.category === 'TRAINING'
                      ? 'purple'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {item.completed ? 'Completed' : item.category}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
