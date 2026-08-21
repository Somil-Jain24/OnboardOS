import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { WhyExplanationPanel } from '../../components/shared/WhyExplanationPanel';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  Sparkles,
  HelpCircle,
  Shield,
  Play,
  Loader2,
} from 'lucide-react';
import type { PlanItem } from '../../types';

export function PlanDetailPage() {
  const { id = 'emp-rahul' } = useParams();
  const navigate = useNavigate();
  const { employee, plan, loading } = useEmployee(id);

  const [selectedItemForWhy, setSelectedItemForWhy] = useState<PlanItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
        return { label: 'Required', status: 'completed' as const };
      case 'APPROVAL_REQUIRED':
        return { label: 'Approval Required', status: 'pending' as const };
      case 'OPTIONAL':
        return { label: 'Optional', status: 'ready' as const };
      case 'NOT_APPLICABLE':
        return { label: 'N/A', status: 'upcoming' as const };
      default:
        return { label: decision, status: 'ready' as const };
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={
          <div className="flex items-center gap-3.5">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status="online" />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-slate-900">Personalized Plan: {employee?.name}</span>
                <Badge variant="purple" dot>AI-Synthesized</Badge>
              </div>
              <span className="text-xs font-normal text-slate-500 block mt-0.5">
                {employee?.roleTitle} • {employee?.departmentName} ({employee?.teamName}) • Ruleset v1.0.0
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
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
      <div className="p-6 bg-blue-50/50 border border-blue-200/80 rounded-3xl shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Deterministic Policy + AI Role Reasoning Synthesis
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Generated 5 targeted access requirements tailored to {employee?.roleTitle} in {employee?.teamName}. 1 requirement (AWS Cloud) has been gated by the Rules Engine for least-privilege compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 font-medium block">Total Requirements</span>
              <span className="text-sm font-bold text-slate-900">{items.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-amber-200 text-center shadow-xs">
              <span className="text-[10px] text-amber-700 font-medium block">Approval Gates</span>
              <span className="text-sm font-bold text-amber-800">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card hover:border-slate-300 transition-all space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={decisionBadge.status} label={decisionBadge.label} size="sm" />

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      {isDivergent && (
                        <Badge
                          variant="purple"
                          size="sm"
                          icon={<Shield className="w-3 h-3 text-purple-600" />}
                        >
                          Rules Engine Policy Tightened
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                      Category: {item.category} • Risk Level: {item.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">AI Confidence</span>
                    <span className="text-xs font-bold text-purple-700 font-mono">
                      {((item.aiConfidence || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedItemForWhy(item)}
                    leftIcon={<HelpCircle className="w-3.5 h-3.5 text-blue-600" />}
                    className="text-xs rounded-xl"
                  >
                    Why?
                  </Button>
                </div>
              </div>

              {/* Explainability Snippet */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">Why required:</strong> {item.reason}
                </p>
                {item.aiRationale && (
                  <p className="text-purple-900 text-xs flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>{item.aiRationale}</span>
                  </p>
                )}
              </div>
            </div>
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

