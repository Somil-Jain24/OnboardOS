import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, Shield, AlertTriangle, BookOpen, User, CheckCircle2, FileCode } from 'lucide-react';
import type { PlanItem, Employee } from '../../types';

export interface WhyExplanationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  item: PlanItem | null;
  employee: Employee | null;
  onDecisionChange?: (itemId: string, newDecision: any, reason: string) => void;
}

export function WhyExplanationPanel({
  isOpen,
  onClose,
  item,
  employee,
}: WhyExplanationPanelProps) {
  if (!item) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <BookOpen className="w-4 h-4" />
          </span>
          <span>Why is this task required?</span>
        </div>
      }
      description={`Plain-language explainability rationale for ${item.name}`}
      size="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Top Header Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-left">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
              <Badge
                variant={
                  item.finalDecision === 'REQUIRED'
                    ? 'info'
                    : item.finalDecision === 'APPROVAL_REQUIRED'
                    ? 'warning'
                    : 'secondary'
                }
                size="sm"
              >
                {item.finalDecision}
              </Badge>
            </div>
            <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3" />}>
              Confidence: {((item.aiConfidence || 0.95) * 100).toFixed(0)}%
            </Badge>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">{item.reason}</p>
        </div>

        {/* AI Recommendation vs Deterministic Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {/* AI Reasoning */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI Role Reasoning</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {item.aiRationale ||
                'Context model matched employee role, tech stack requirements, and active repository assignments.'}
            </p>
            <div className="text-[11px] text-purple-700 font-mono font-medium">
              Suggested: {item.aiRecommendedDecision || item.finalDecision}
            </div>
          </div>

          {/* Rules Engine Authority */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Rules Engine Policy (Authoritative)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Enforced by deterministic policy rule <code className="text-blue-700 bg-blue-100 px-1 py-0.5 rounded font-mono">RULE-ENG-v1.0.0</code>. Policy rules override AI recommendations whenever least-privilege or approval gates apply.
            </p>
            <div className="text-[11px] text-emerald-700 font-mono font-semibold">
              Final Decision: {item.finalDecision}
            </div>
          </div>
        </div>

        {/* Input Context Factors */}
        <div className="space-y-2 text-left">
          <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Input Context Attributes Evaluated
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Role</span>
              <span className="font-semibold text-slate-900 text-xs">{employee?.roleTitle || 'Backend Developer'}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Department</span>
              <span className="font-semibold text-slate-900 text-xs">{employee?.departmentName || 'Engineering'}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Seniority</span>
              <span className="font-semibold text-slate-900 font-mono text-xs">{employee?.seniority || 'JUNIOR'}</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-slate-400 text-[10px] block uppercase font-mono">Team</span>
              <span className="font-semibold text-slate-900 text-xs">{employee?.teamName || 'Payments Core'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Explanation
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

