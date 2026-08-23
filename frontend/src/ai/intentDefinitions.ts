import type { UserRole } from '../types';

export type AIIntentType =
  // HR Intents
  | 'HR_OVERDUE_TASKS_RAHUL'
  | 'HR_WEEKLY_ONBOARDING_SUMMARY'
  | 'HR_SUMMARIZE_ACTIONS_RAHUL'
  | 'HR_WAITING_IT_ACCESS'
  | 'HR_NEED_ATTENTION_TODAY'
  | 'HR_COMPLETED_TASKS_RAHUL_MONTH'
  // Manager Intents
  | 'MGR_WHO_IS_OVERDUE'
  | 'MGR_WHAT_RAHUL_COMPLETED_WEEK'
  | 'MGR_WHO_NEEDS_ATTENTION'
  | 'MGR_TEAM_PERFORMANCE_TRENDS'
  // Employee Intents
  | 'EMP_WHAT_TO_DO_NEXT'
  | 'EMP_SHOW_ONBOARDING_PROGRESS'
  | 'EMP_HELP_CURRENT_TASK'
  | 'EMP_LAPTOP_NOT_WORKING'
  | 'EMP_NEED_GITHUB_ACCESS'
  | 'EMP_SHOW_ASSIGNED_RESOURCES'
  | 'EMP_WHAT_IS_BLOCKING_ONBOARDING'
  // Cross-Employee / Privacy
  | 'EMP_QUERY_ANOTHER_EMPLOYEE_STATUS'
  // General / Fallback
  | 'GENERAL_GREETING'
  | 'GENERAL_UNKNOWN_QUERY';

export interface AIActionItem {
  label: string;
  actionKey: string;
  deepLink?: string;
  primary?: boolean;
}

export interface AIEvidenceData {
  stats?: {
    readinessScore?: number;
    riskScore?: number;
    completedTasks?: number;
    totalTasks?: number;
    blockerCount?: number;
  };
  whyThisDecision?: {
    roleReq?: string;
    projReq?: string;
    policy?: string;
    checks?: Array<{
      label: string;
      passed: boolean;
      detail: string;
    }>;
  };
  sourceType?: 'DETERMINISTIC_KB' | 'RULES_ENGINE' | 'HYBRID_GRAPH' | 'LLM_GROUNDED' | 'GEMINI_FALLBACK' | 'SECURITY_GUARD';
  deepLink?: string;
  deepLinkLabel?: string;
  tags?: string[];
  isDeterministic?: boolean;
}

export interface AIIntentResult {
  intent: AIIntentType;
  ownerRole?: UserRole;
  content: string;
  badge: '✓ OnboardOS Intelligence' | '✨ AI Assistant' | '🛡️ Security Policy';
  isRestricted?: boolean;
  evidence?: AIEvidenceData;
  actions?: AIActionItem[];
}
