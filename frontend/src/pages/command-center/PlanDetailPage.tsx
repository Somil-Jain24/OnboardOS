import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { WhyExplanationPanel } from '../../components/shared/WhyExplanationPanel';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  Sparkles,
  HelpCircle,
  Shield,
  Play,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  Layers,
  Server,
  Terminal,
  Clock,
} from 'lucide-react';
import type { PlanItem, RuleCategory } from '../../types';

export function PlanDetailPage() {
  const { id = 'emp-rahul' } = useParams();
  const navigate = useNavigate();
  const { employee, plan, loading } = useEmployee(id);

  const [selectedItemForWhy, setSelectedItemForWhy] = useState<PlanItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-xs">Loading personalized onboarding plan...</span>
      </div>
    );
  }

  const items = plan?.items || [];
  const categories = ['ALL', 'Identity', 'Communication', 'Development', 'Project', 'Cloud'];

  const filteredItems =
    activeCategory === 'ALL'
      ? items
      : items.filter((item) => item.category === activeCategory);

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'REQUIRED':
        return { label: 'Required', variant: 'info' as const };
      case 'APPROVAL_REQUIRED':
        return { label: 'Approval Required', variant: 'warning' as const };
      case 'OPTIONAL':
        return { label: 'Optional', variant: 'secondary' as const };
      case 'NOT_APPLICABLE':
        return { label: 'N/A', variant: 'muted' as const };
      default:
        return { label: decision, variant: 'default' as const };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <span>Personalized Plan: {employee?.name}</span>
                <Badge variant="default" dot>AI-Synthesized</Badge>
              </div>
              <span className="text-xs font-normal text-slate-400 block mt-0.5">
                {employee?.roleTitle} • {employee?.departmentName} ({employee?.teamName}) • Ruleset v1.0.0
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/employees/${id}`}>
              <Button size="sm" variant="secondary">
                View Command Center
              </Button>
            </Link>
            <Link to={`/employees/${id}/provisioning`}>
              <Button size="sm" variant="primary" leftIcon={<Play className="w-3.5 h-3.5" />}>
                Execute Orchestration
              </Button>
            </Link>
          </div>
        }
      />

      {/* AI Synthesis Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Deterministic Policy + AI Role Reasoning Synthesis
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Generated 5 targeted access requirements tailored to {employee?.roleTitle} in {employee?.teamName}. 1 requirement (AWS Cloud) has been gated by the Rules Engine for least-privilege compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Total Requirements</span>
              <span className="text-sm font-bold text-slate-100">{items.length}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Approval Gates</span>
              <span className="text-sm font-bold text-amber-400">1</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Plan Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const decisionBadge = getDecisionBadge(item.finalDecision);
          const isDivergent =
            item.aiRecommendedDecision &&
            item.aiRecommendedDecision !== item.finalDecision;

          return (
            <Card
              key={item.id}
              className="p-4 bg-slate-900/80 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant={decisionBadge.variant} size="sm">
                    {decisionBadge.label}
                  </Badge>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                      {isDivergent && (
                        <Badge
                          variant="purple"
                          size="sm"
                          icon={<Shield className="w-3 h-3 text-emerald-400" />}
                        >
                          Rules Engine Policy Tightened
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Category: {item.category} • Risk Level: {item.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">AI Confidence</span>
                    <span className="text-xs font-bold text-purple-400 font-mono">
                      {((item.aiConfidence || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedItemForWhy(item)}
                    leftIcon={<HelpCircle className="w-3.5 h-3.5 text-blue-400" />}
                  >
                    Why?
                  </Button>
                </div>
              </div>

              {/* Explainability Snippet */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                <p className="text-slate-300">
                  <strong className="text-slate-100 font-medium">Why required:</strong> {item.reason}
                </p>
                {item.aiRationale && (
                  <p className="text-slate-400 text-[11px] flex items-center gap-1.5 italic">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>{item.aiRationale}</span>
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Why Explanation Dialog */}
      <WhyExplanationPanel
        isOpen={Boolean(selectedItemForWhy)}
        onClose={() => setSelectedItemForWhy(null)}
        item={selectedItemForWhy}
        employee={employee}
      />
    </div>
  );
}
