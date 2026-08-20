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
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
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
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
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

          <p className="text-slate-300 text-xs leading-relaxed">{item.reason}</p>
        </div>

        {/* AI Recommendation vs Deterministic Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* AI Reasoning */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI Role Reasoning</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {item.aiRationale ||
                'Context model matched employee role, tech stack requirements, and active repository assignments.'}
            </p>
            <div className="text-[11px] text-purple-300 font-mono">
              Suggested: {item.aiRecommendedDecision || item.finalDecision}
            </div>
          </div>

          {/* Rules Engine Authority */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Rules Engine Policy (Authoritative)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Enforced by deterministic policy rule <code className="text-blue-300">RULE-ENG-v1.0.0</code>. Policy rules override AI recommendations whenever least-privilege or approval gates apply.
            </p>
            <div className="text-[11px] text-emerald-400 font-mono">
              Final Decision: {item.finalDecision}
            </div>
          </div>
        </div>

        {/* Input Context Factors */}
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Input Context Attributes Evaluated
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Role</span>
              <span className="font-semibold">{employee?.roleTitle || 'Backend Developer'}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Department</span>
              <span className="font-semibold">{employee?.departmentName || 'Engineering'}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Seniority</span>
              <span className="font-semibold font-mono">{employee?.seniority || 'JUNIOR'}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Team</span>
              <span className="font-semibold">{employee?.teamName || 'Payments Core'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Explanation
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
