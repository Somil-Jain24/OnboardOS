import type { TaskStatus, RequirementDecision, RiskLevel, ExceptionSeverity, ApprovalStatus } from '../types';

export function getTaskStatusConfig(status: TaskStatus) {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        iconColor: 'text-emerald-500',
      };
    case 'RUNNING':
      return {
        label: 'In Progress',
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500 animate-pulse',
        badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
        iconColor: 'text-blue-500',
      };
    case 'READY':
      return {
        label: 'Ready',
        bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        iconColor: 'text-indigo-500',
      };
    case 'WAITING_APPROVAL':
      return {
        label: 'Approval Required',
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        iconColor: 'text-amber-500',
      };
    case 'FAILED':
      return {
        label: 'Failed',
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500 animate-ping',
        badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        iconColor: 'text-rose-500',
      };
    case 'BLOCKED':
      return {
        label: 'Blocked',
        bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        dot: 'bg-slate-500',
        badge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
        iconColor: 'text-slate-500',
      };
    case 'HUMAN_INTERVENTION':
      return {
        label: 'Action Required',
        bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        dot: 'bg-purple-500',
        badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        iconColor: 'text-purple-500',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        dot: 'bg-red-500',
        badge: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
        iconColor: 'text-red-500',
      };
    case 'SKIPPED':
      return {
        label: 'Skipped',
        bg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        dot: 'bg-zinc-500',
        badge: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
        iconColor: 'text-zinc-500',
      };
    case 'PENDING':
    default:
      return {
        label: 'Pending',
        bg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
        dot: 'bg-zinc-400',
        badge: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
        iconColor: 'text-zinc-400',
      };
  }
}

export function getDecisionConfig(decision: RequirementDecision) {
  switch (decision) {
    case 'REQUIRED':
      return {
        label: 'Required',
        bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
        badge: 'bg-blue-600 text-white',
      };
    case 'APPROVAL_REQUIRED':
      return {
        label: 'Approval Req.',
        bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        badge: 'bg-amber-600 text-white',
      };
    case 'OPTIONAL':
      return {
        label: 'Optional',
        bg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
        badge: 'bg-zinc-600 text-white',
      };
    case 'NOT_APPLICABLE':
      return {
        label: 'Not Applicable',
        bg: 'bg-zinc-500/5 text-zinc-500 border-zinc-500/20 line-through opacity-70',
        badge: 'bg-zinc-400 text-white',
      };
    case 'BLOCKED':
      return {
        label: 'Blocked',
        bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
        badge: 'bg-slate-600 text-white',
      };
  }
}

export function getRiskConfig(level: RiskLevel) {
  switch (level) {
    case 'HIGH':
      return {
        label: 'High Risk',
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
        badge: 'bg-rose-600 text-white',
        border: 'border-rose-500',
      };
    case 'MEDIUM':
      return {
        label: 'Medium Risk',
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-600 text-white',
        border: 'border-amber-500',
      };
    case 'LOW':
    default:
      return {
        label: 'Low Risk',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-600 text-white',
        border: 'border-emerald-500',
      };
  }
}

export function getApprovalStatusConfig(status: ApprovalStatus) {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved',
        bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      };
    case 'MORE_INFO_REQUESTED':
      return {
        label: 'Info Requested',
        bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      };
    case 'PENDING':
    default:
      return {
        label: 'Pending Review',
        bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      };
  }
}

export function getExceptionSeverityConfig(severity: ExceptionSeverity) {
  switch (severity) {
    case 'CRITICAL':
      return {
        label: 'Critical',
        bg: 'bg-rose-600 text-white',
        cardBg: 'border-rose-500/30 bg-rose-500/5',
      };
    case 'ACTION_REQUIRED':
      return {
        label: 'Action Required',
        bg: 'bg-purple-600 text-white',
        cardBg: 'border-purple-500/30 bg-purple-500/5',
      };
    case 'WARNING':
      return {
        label: 'Warning',
        bg: 'bg-amber-600 text-white',
        cardBg: 'border-amber-500/30 bg-amber-500/5',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        bg: 'bg-emerald-600 text-white',
        cardBg: 'border-emerald-500/30 bg-emerald-500/5',
      };
  }
}
