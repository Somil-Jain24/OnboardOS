import type { UserRole } from '../../types';

export type AIModeRole = 'HR' | 'EMPLOYEE' | 'MANAGER' | 'IT' | 'ADMIN';

export interface DecisionEvidence {
  whyThisDecision?: {
    roleReq?: string;
    projReq?: string;
    policy?: string;
    checks?: Array<{
      label: string;
      passed: boolean;
      detail?: string;
    }>;
  };
  stats?: {
    readinessScore?: number;
    riskScore?: number;
    completedTasks?: number;
    totalTasks?: number;
    blockerCount?: number;
  };
  policySnippet?: string;
  sourceType?: 'RULES_ENGINE' | 'LLM_GROUNDED' | 'HYBRID_GRAPH';
  deepLink?: string;
  deepLinkLabel?: string;
  tags?: string[];
}

export interface ActionButton {
  label: string;
  actionKey: string;
  primary?: boolean;
  deepLink?: string;
  icon?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'thinking' | 'streaming' | 'completed' | 'error';
  evidence?: DecisionEvidence;
  actions?: ActionButton[];
  roleContext?: UserRole;
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  messages: AIMessage[];
  summary?: string;
  isPinned?: boolean;
  timeGroup: 'Today' | 'Yesterday' | 'Earlier';
}

export interface AISuggestionCard {
  id: string;
  title: string;
  subtitle?: string;
  query: string;
  iconType: 'cloud' | 'expert' | 'status' | 'code' | 'help' | 'policy' | 'shield';
  role: UserRole;
}
