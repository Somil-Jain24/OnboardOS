import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Search,
  CheckSquare,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyTasksPage() {
  const { tasks, employee } = useEmployee('emp-rahul');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Identity', 'Communication', 'Development', 'Project', 'Cloud'];

  const filteredTasks =
    activeCategory === 'ALL'
      ? tasks
      : tasks.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Onboarding Tasks"
        description="Track and complete your Day-1 setup requirements, hardware receipts, and access requests."
        badge={
          <Badge variant="default" dot>
            {tasks.filter((t) => t.status === 'COMPLETED').length} of {tasks.length} Completed
          </Badge>
        }
        actions={
          <Link to="/employee/helpdesk">
            <Button size="sm" variant="outline" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>
              Need Help? Open Ticket
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((t, idx) => {
          const isDone = t.status === 'COMPLETED';
          const isFailed = t.status === 'FAILED';
          const isBlocked = t.status === 'BLOCKED';
          const isWaiting = t.status === 'WAITING_APPROVAL';

          return (
            <Card
              key={t.id}
              className={`p-4 transition-all border ${
                isDone
                  ? 'bg-slate-900/60 border-slate-800'
                  : isFailed
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isWaiting
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isFailed ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : isBlocked ? (
                    <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}

                  <div>
                    <span className={`font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {t.name}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Category: {t.category}</span>
                      <span>•</span>
                      <span>Adapter: <code className="text-slate-300 font-mono">{t.adapterType}</code></span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    isDone ? 'success' : isFailed ? 'danger' : isBlocked ? 'muted' : 'warning'
                  }
                  size="sm"
                >
                  {isDone
                    ? 'Granted'
                    : isFailed
                    ? 'IT Provisioning Error'
                    : isBlocked
                    ? 'Blocked on Jira'
                    : 'Pending Manager Signoff'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
