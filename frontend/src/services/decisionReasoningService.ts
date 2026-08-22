import { client } from './index';
import { getRecentDomainEvents } from '../utils/domainEventBus';
import type { Employee, OnboardingPlan, Task, Approval, RiskAssessment, ExceptionEvent } from '../types';

export interface DecisionReasoningResult {
  question: string;
  answer: string;
  summary: string;
  sourceType: 'RULES_ENGINE' | 'LLM_GROUNDED';
  sourceLabel: string;
  evidence: {
    title: string;
    value: string;
    badge?: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
    citation?: string;
  }[];
  recommendedAction: {
    actionText: string;
    responsibleRole: 'HR' | 'MANAGER' | 'IT' | 'EMPLOYEE';
    deepLink?: string;
  };
  policyCitations?: {
    policyId: string;
    policyName: string;
    version: string;
    ruleSnippet: string;
  }[];
  rawContextSnapshot: {
    employeeName: string;
    role: string;
    department: string;
    readinessScore: number;
    riskScore: number;
    failedTasksCount: number;
    pendingApprovalsCount: number;
  };
}

export async function getDecisionIntelligence(
  employeeId = 'emp-rahul',
  query: string
): Promise<DecisionReasoningResult> {
  // 1. Gather all live data points from client
  const [emp, plan, tasks, approvals, risk, exceptions] = await Promise.all([
    client.getEmployee(employeeId),
    client.getPlan(employeeId),
    client.getTasks(employeeId),
    client.getApprovals(),
    client.getRiskAssessment(employeeId),
    client.getExceptions(),
  ]);

  const empName = emp?.name || 'Rahul Sharma';
  const roleTitle = emp?.roleTitle || 'Junior Backend Developer';
  const department = emp?.departmentName || 'Engineering';
  const managerName = emp?.managerName || 'Marcus Vance';
  const readiness = risk?.readinessScore ?? 65;
  const riskScore = risk?.riskScore ?? 75;

  const failedTasks = tasks.filter((t) => t.status === 'FAILED');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const waitingApprovalTasks = tasks.filter((t) => t.status === 'WAITING_APPROVAL');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const pendingApprovals = approvals.filter(
    (a) => a.employeeId === employeeId && a.status === 'PENDING'
  );
  const activeExceptions = exceptions.filter(
    (e) => e.employeeId === employeeId && e.severity !== 'RESOLVED'
  );
  const recentEvents = getRecentDomainEvents(3, undefined, employeeId);

  const rawSnapshot = {
    employeeName: empName,
    role: roleTitle,
    department,
    readinessScore: readiness,
    riskScore,
    failedTasksCount: failedTasks.length,
    pendingApprovalsCount: pendingApprovals.length,
  };

  const qLower = query.toLowerCase();

  // --------------------------------------------------------------------------
  // Query 1: "Why is Jira blocked?" / Jira failure diagnosis
  // --------------------------------------------------------------------------
  if (qLower.includes('jira') || (qLower.includes('blocked') && failedTasks.some((t) => t.name.includes('Jira')))) {
    const jiraTask = tasks.find((t) => t.name.includes('Jira') || t.adapterType === 'JIRA');
    const isJiraFailed = jiraTask?.status === 'FAILED';

    if (isJiraFailed) {
      return {
        question: query,
        answer: `Jira account provisioning for ${empName} failed due to an external API rate limit (HTTP 503). Because the Payments Sprint Backlog depends on this step, the DAG orchestrator has safely held downstream tasks in BLOCKED state.`,
        summary: 'Root Blocker: Jira API 503 Rate Limit Error on external gateway.',
        sourceType: 'RULES_ENGINE',
        sourceLabel: 'Rules-based decision explanation grounded in live DAG state',
        evidence: [
          {
            title: 'Failed Task',
            value: `${jiraTask?.name || 'Jira Software Access'} (Status: FAILED)`,
            badge: 'HTTP 503',
            badgeVariant: 'danger',
            citation: 'Task ID: task-rahul-jira',
          },
          {
            title: 'Downstream Impact',
            value: `${blockedTasks.length} dependent task(s) currently held`,
            badge: 'BLOCKED',
            badgeVariant: 'warning',
          },
          {
            title: 'Exception Center Status',
            value: activeExceptions.length > 0 ? 'Logged with CRITICAL severity' : 'Auto-remediation active',
            badge: 'Active Incident',
            badgeVariant: 'danger',
          },
        ],
        recommendedAction: {
          actionText: 'Trigger 1-click idempotent retry from Exception Center or IT Dashboard.',
          responsibleRole: 'IT',
          deepLink: '/hr/exceptions',
        },
        policyCitations: [
          {
            policyId: 'DAG-FAILOVER-01',
            policyName: 'Idempotent SCIM Connector Retry Policy',
            version: 'v2.1',
            ruleSnippet: 'When a downstream SaaS provider returns 5xx HTTP codes, isolate task and protect dependent pipeline without terminating employee onboarding state.',
          },
        ],
        rawContextSnapshot: rawSnapshot,
      };
    } else {
      return {
        question: query,
        answer: `Jira Software access for ${empName} is now ACTIVE and operational. All sprint board assignments have been successfully unblocked.`,
        summary: 'Jira Access Provisioned & Unblocked.',
        sourceType: 'RULES_ENGINE',
        sourceLabel: 'Rules-based decision explanation grounded in live DAG state',
        evidence: [
          {
            title: 'Task Status',
            value: 'COMPLETED (Sprint Board active)',
            badge: 'HEALTHY',
            badgeVariant: 'success',
          },
        ],
        recommendedAction: {
          actionText: 'Review team sprint backlog on Day 1.',
          responsibleRole: 'EMPLOYEE',
          deepLink: '/me/tasks',
        },
        rawContextSnapshot: rawSnapshot,
      };
    }
  }

  // --------------------------------------------------------------------------
  // Query 2: "Why does AWS need approval?" / "Why is AWS required?"
  // --------------------------------------------------------------------------
  if (qLower.includes('aws') || qLower.includes('approval') || qLower.includes('cloud')) {
    const awsApproval = pendingApprovals.find((a) => a.taskName.includes('AWS') || a.reason?.includes('AWS'));
    const isAwsApproved = completedTasks.some((t) => t.name.includes('AWS'));

    if (isAwsApproved) {
      return {
        question: query,
        answer: `AWS Production IAM access for ${empName} has been authorized and completed by Engineering Director ${managerName}.`,
        summary: 'Cloud IAM access granted with active audit trail.',
        sourceType: 'RULES_ENGINE',
        sourceLabel: 'Rules-based decision explanation grounded in live audit ledger',
        evidence: [
          {
            title: 'Authorization Status',
            value: `Approved by ${managerName}`,
            badge: 'APPROVED',
            badgeVariant: 'success',
          },
          {
            title: 'Assigned Role',
            value: 'AWS Developer (us-east-1 Payments Cluster)',
            badge: 'LOW RISK',
            badgeVariant: 'success',
          },
        ],
        recommendedAction: {
          actionText: 'Log into AWS via corporate SSO portal.',
          responsibleRole: 'EMPLOYEE',
          deepLink: '/me',
        },
        rawContextSnapshot: rawSnapshot,
      };
    }

    return {
      question: query,
      answer: `Under corporate SOC-2 Least Privilege Policy (POL-CLOUD-01 v1.2), Junior Engineers requesting cloud production credentials require explicit manager approval before credentials are created. An authorization request was routed to ${managerName} with a 4-hour SLA.`,
      summary: 'Gated Access: Manager Sign-off required by SOC-2 Cloud Policy.',
      sourceType: 'RULES_ENGINE',
      sourceLabel: 'Rules-based decision explanation grounded in corporate policy',
      evidence: [
        {
          title: 'Target Entitlement',
          value: 'AWS Production Developer IAM Role',
          badge: 'HIGH RISK',
          badgeVariant: 'warning',
          citation: 'Entitlement ID: ent-aws-prod',
        },
        {
          title: 'Assigned Approver',
          value: `${managerName} (Engineering Director)`,
          badge: 'PENDING',
          badgeVariant: 'warning',
        },
        {
          title: 'SLA Target',
          value: awsApproval?.slaTargetAt ? 'Within 4 hours of generation' : '4-hour standard SLA',
          badge: 'SLA Active',
          badgeVariant: 'default',
        },
      ],
      recommendedAction: {
        actionText: `Engineering Director ${managerName} must approve or reject in Manager Approvals queue.`,
        responsibleRole: 'MANAGER',
        deepLink: '/manager/approvals',
      },
      policyCitations: [
        {
          policyId: 'POL-CLOUD-01',
          policyName: 'Production Cloud Security & IAM Governance',
          version: 'v1.2.0',
          ruleSnippet: 'Employees with Seniority = JUNIOR must have managerial authorization prior to granting direct cloud console or IAM secret access.',
        },
      ],
      rawContextSnapshot: rawSnapshot,
    };
  }

  // --------------------------------------------------------------------------
  // Query 3: "Am I Day-1 ready?" / Readiness breakdown
  // --------------------------------------------------------------------------
  if (qLower.includes('day-1') || qLower.includes('ready') || qLower.includes('readiness')) {
    const is100Ready = readiness >= 90 && failedTasks.length === 0;

    return {
      question: query,
      answer: is100Ready
        ? `${empName} is ${readiness}% Day-1 Ready! All critical access, security keys, and communication channels are provisioned. Estimated status is READY.`
        : `${empName} is currently ${readiness}% Day-1 Ready (Status: AT RISK). There are ${failedTasks.length} failed provisioning task(s) and ${pendingApprovals.length} pending approval(s) requiring resolution before start date.`,
      summary: is100Ready ? '100% Day-1 Ready for Onboarding' : `Readiness at ${readiness}% — Blockers require triage`,
      sourceType: 'RULES_ENGINE',
      sourceLabel: 'Rules-based decision explanation grounded in readiness metrics',
      evidence: [
        {
          title: 'Readiness Score',
          value: `${readiness}% of prerequisites satisfied`,
          badge: is100Ready ? 'READY' : 'AT RISK',
          badgeVariant: is100Ready ? 'success' : 'warning',
        },
        {
          title: 'Completed Tasks',
          value: `${completedTasks.length} of ${tasks.length} total tasks complete`,
          badge: `${Math.round((completedTasks.length / (tasks.length || 1)) * 100)}%`,
          badgeVariant: is100Ready ? 'success' : 'default',
        },
        {
          title: 'Blocking Failures',
          value: failedTasks.length > 0 ? `${failedTasks.map((f) => f.name).join(', ')}` : '0 Blocking Failures',
          badge: failedTasks.length > 0 ? 'CRITICAL' : 'CLEAR',
          badgeVariant: failedTasks.length > 0 ? 'danger' : 'success',
        },
      ],
      recommendedAction: {
        actionText: is100Ready
          ? 'Confirm first-week calendar with mentor Kavita Rao.'
          : 'Resolve Jira exception in Exception Center and approve AWS access in Manager queue.',
        responsibleRole: is100Ready ? 'EMPLOYEE' : 'IT',
        deepLink: is100Ready ? '/me/first-week' : '/hr/exceptions',
      },
      rawContextSnapshot: rawSnapshot,
    };
  }

  // --------------------------------------------------------------------------
  // Default / "What should I do next?" / Summary
  // --------------------------------------------------------------------------
  const topBlocker = failedTasks[0];
  const topApproval = pendingApprovals[0];

  return {
    question: query,
    answer: topBlocker
      ? `Highest Priority Action: Resolve the ${topBlocker.name} failure (${topBlocker.failureReason || 'HTTP 503'}). This is blocking ${blockedTasks.length} downstream sprint onboarding tasks.`
      : topApproval
      ? `Highest Priority Action: Engineering Director ${managerName} must approve ${topApproval.taskName} in the Manager Queue.`
      : `${empName}'s onboarding pipeline is healthy. Next step is completing the Day-1 Security & Compliance training module.`,
    summary: topBlocker
      ? `Unblock ${topBlocker.name}`
      : topApproval
      ? `Complete Manager Approval for ${topApproval.taskName}`
      : 'Complete Compliance Checklist',
    sourceType: 'RULES_ENGINE',
    sourceLabel: 'Rules-based decision explanation grounded in live onboarding state',
    evidence: [
      {
        title: 'Current Readiness',
        value: `${readiness}% (Risk Score: ${riskScore})`,
        badge: readiness >= 90 ? 'HEALTHY' : 'NEEDS ATTENTION',
        badgeVariant: readiness >= 90 ? 'success' : 'warning',
      },
      {
        title: 'Active Exceptions',
        value: activeExceptions.length > 0 ? `${activeExceptions.length} active issue(s)` : '0 Active Exceptions',
        badge: activeExceptions.length > 0 ? 'ATTENTION' : 'CLEAR',
        badgeVariant: activeExceptions.length > 0 ? 'danger' : 'success',
      },
      {
        title: 'Latest Automation Event',
        value: recentEvents[0]?.summary || 'ViaSocket Slack & Google Sheet sync dispatched',
        badge: 'AUTOMATED',
        badgeVariant: 'default',
      },
    ],
    recommendedAction: {
      actionText: topBlocker
        ? 'Navigate to Exception Center to retry failed task.'
        : topApproval
        ? 'Navigate to Manager Approval Queue to sign off.'
        : 'Open My Tasks to complete daily checklists.',
      responsibleRole: topBlocker ? 'IT' : topApproval ? 'MANAGER' : 'EMPLOYEE',
      deepLink: topBlocker ? '/hr/exceptions' : topApproval ? '/manager/approvals' : '/me/tasks',
    },
    rawContextSnapshot: rawSnapshot,
  };
}
