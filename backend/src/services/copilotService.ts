import { env } from '../config/env';
import { store } from '../db/store';
import type { Employee, Task, Approval } from '../types';

export interface CopilotEvidence {
  type: 'TASK' | 'POLICY' | 'APPROVAL' | 'EXCEPTION' | 'AUTOMATION';
  label: string;
  detail: string;
}

export interface CopilotResponse {
  source: 'gemini_grounded' | 'rules_based_fallback';
  answer: string;
  recommendedAction: string;
  evidence: CopilotEvidence[];
  readinessSummary: {
    score: number;
    status: 'READY' | 'AT_RISK' | 'BLOCKED';
  };
}

export class CopilotService {
  /**
   * Generates a grounded AI or rules-based explanation for employee onboarding questions.
   */
  public static async answerQuestion(
    employeeId: string,
    question: string,
    userRole: string = 'EMPLOYEE'
  ): Promise<CopilotResponse> {
    const employee = store.employees.find((e) => e.id === employeeId) || {
      id: 'emp-rahul',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@onboardos.internal',
      roleId: 'role-dev-backend',
      roleTitle: 'Junior Backend Developer',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      teamId: 'team-payments',
      teamName: 'Payments Core',
      seniority: 'JUNIOR' as const,
      location: 'Bengaluru, India (Hybrid)',
      employmentType: 'FULL_TIME' as const,
      managerName: 'Marcus Vance',
      status: 'ACTIVE' as const,
      startDate: '2026-09-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tasks = store.tasks.filter((t) => t.employeeId === employee.id);
    const approvals = store.approvals.filter((a) => a.employeeId === employee.id);
    const plan = store.plans.find((p) => p.employeeId === employee.id);
    const risk = store.risks.find((r) => r.employeeId === employee.id);
    const latestAudit = store.auditLogs.find((a) => a.employeeId === employee.id);
    const settings = store.integrationSettings || {
      slackInviteUrl: 'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
      githubRepoUrl: 'https://github.com/Yash-Jhanwar/demo',
      jiraBoardUrl: 'https://onboardos.atlassian.net',
    };

    // Compute readiness status
    const readinessScore = risk ? (100 - risk.riskScore) : 85;
    const hasFailures = tasks.some((t) => t.status === 'FAILED');
    const hasPendingApprovals = approvals.some((a) => a.status === 'PENDING');
    const readinessStatus: 'READY' | 'AT_RISK' | 'BLOCKED' = hasFailures
      ? 'BLOCKED'
      : hasPendingApprovals
      ? 'AT_RISK'
      : readinessScore >= 90
      ? 'READY'
      : 'AT_RISK';

    // Collect Grounded Evidence
    const evidence: CopilotEvidence[] = [];

    tasks.forEach((t) => {
      if (t.status === 'FAILED') {
        evidence.push({
          type: 'TASK',
          label: `${t.name} (FAILED)`,
          detail: t.failureReason || `Task execution error on ${t.adapterType} adapter`,
        });
      } else if (t.status === 'WAITING_APPROVAL') {
        evidence.push({
          type: 'APPROVAL',
          label: `${t.name} (Gated)`,
          detail: 'Requires manager approval before DAG unblocking',
        });
      }
    });

    approvals.forEach((a) => {
      if (a.status === 'PENDING') {
        evidence.push({
          type: 'APPROVAL',
          label: `Pending Signoff for ${a.taskName || 'Access'}`,
          detail: `Approver: ${a.approverRole || 'Manager'} • Reason: ${a.reason || 'Elevated Access'}`,
        });
      }
    });

    if (plan) {
      evidence.push({
        type: 'POLICY',
        label: `Active Ruleset v${plan.ruleSetVersion || 1}.0.0`,
        detail: `Deterministic access profile synthesized for ${employee.departmentName} - ${employee.roleTitle}`,
      });
    }

    if (latestAudit) {
      evidence.push({
        type: 'AUTOMATION',
        label: `Audit: ${latestAudit.action}`,
        detail: latestAudit.reason || 'Automation event recorded in immutable ledger',
      });
    }

    // Attempt Gemini Flash Call if API Key exists
    if (env.GEMINI_API_KEY) {
      try {
        const geminiResult = await this.queryGeminiFlash({
          employee,
          tasks,
          approvals,
          settings,
          readinessScore,
          readinessStatus,
          question,
          userRole,
          evidence,
        });

        if (geminiResult) {
          return {
            source: 'gemini_grounded',
            answer: geminiResult.answer,
            recommendedAction: geminiResult.recommendedAction,
            evidence: geminiResult.evidence && geminiResult.evidence.length > 0 ? geminiResult.evidence : evidence,
            readinessSummary: {
              score: readinessScore,
              status: readinessStatus,
            },
          };
        }
      } catch (err: any) {
        console.warn('⚠️ [CopilotService] Gemini Flash call failed, falling back to deterministic rules:', err.message);
      }
    }

    // Rules-Based Grounded Fallback
    return this.generateRulesBasedFallback({
      employee,
      tasks,
      approvals,
      settings,
      readinessScore,
      readinessStatus,
      question,
      userRole,
      evidence,
    });
  }

  private static async queryGeminiFlash(context: {
    employee: Employee;
    tasks: Task[];
    approvals: Approval[];
    settings: any;
    readinessScore: number;
    readinessStatus: string;
    question: string;
    userRole: string;
    evidence: CopilotEvidence[];
  }): Promise<{ answer: string; recommendedAction: string; evidence: CopilotEvidence[] } | null> {
    const prompt = `
You are OnboardOS Copilot, the intelligent AI assistant embedded inside the OnboardOS employee onboarding and IAM platform.
Your job is to provide accurate, helpful, clear, and context-grounded answers to the employee or manager.

INSTRUCTIONS:
1. Answer the user's question directly, accurately, and helpfully.
2. If the user asks general questions (e.g. bikes, gadgets, coding, math, career, general knowledge, recommendations), provide a direct, high-quality, comprehensive answer as a versatile AI assistant!
3. If the user asks about onboarding, policies, work tools, tasks, errors, or approvals, ground your answer in the DECISION CONTEXT facts below.
4. If the user asks in Hindi or Hinglish, reply in clear, friendly Hinglish. If in English, reply in crisp English.
5. If the user sends a greeting (e.g. "hi", "hello", "kya haal hai"), respond warmly and introduce your capabilities.
6. Output STRICT JSON ONLY with exactly these keys:
{
  "answer": "string containing direct, helpful answer (supports markdown)",
  "recommendedAction": "string containing specific next step or recommendation",
  "evidence": [ { "type": "TASK" | "POLICY" | "APPROVAL" | "EXCEPTION" | "AUTOMATION", "label": "string", "detail": "string" } ]
}

DECISION CONTEXT:
- Employee Name: ${context.employee.name} (${context.employee.email})
- Role: ${context.employee.roleTitle} | Seniority: ${context.employee.seniority}
- Department: ${context.employee.departmentName} | Team: ${context.employee.teamName}
- Assigned Manager: ${context.employee.managerName || 'Marcus Vance'}
- Technical Mentor: Kavita Rao (Staff Backend Engineer, @kavita.rao)
- Culture Buddy: Alex Rivera (Product Designer, @alex.rivera)
- Start Date: ${context.employee.startDate || '2026-09-01'} | Location: ${context.employee.location}
- Current Readiness Score: ${context.readinessScore}% (Status: ${context.readinessStatus})
- Real Workspace Links:
  * Slack Workspace: ${context.settings?.slackInviteUrl || 'https://join.slack.com/t/onboard-kz86900/...'}
  * GitHub Repo: ${context.settings?.githubRepoUrl || 'https://github.com/Yash-Jhanwar/demo'}
  * Jira Board: ${context.settings?.jiraBoardUrl || 'https://onboardos.atlassian.net'}
- Task Pipeline & DAG Statuses:
${context.tasks.map((t) => `  * [${t.status}] ${t.name} (Adapter: ${t.adapterType}${t.failureReason ? `, Reason: ${t.failureReason}` : ''})`).join('\n')}
- Approval Queue:
${context.approvals.map((a) => `  * [${a.status}] ${a.taskName || 'Access'} (Approver: ${a.approverRole}, Reason: ${a.reason})`).join('\n')}

USER QUESTION: "${context.question}"
`;

    const candidateModels = [
      env.GEMINI_MODEL || 'gemini-3.6-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3-flash-preview',
    ];

    const uniqueModels = Array.from(new Set(candidateModels));

    for (const model of uniqueModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn(`⚠️ [CopilotService] Gemini model ${model} returned ${res.status}:`, errData);
          continue;
        }

        const data: any = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        // Clean JSON markdown code fence if present
        const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleanedJson);
          return {
            answer: parsed.answer || rawText,
            recommendedAction: parsed.recommendedAction || 'Continue your assigned onboarding tasks in My Tasks.',
            evidence: Array.isArray(parsed.evidence) && parsed.evidence.length > 0 ? parsed.evidence : context.evidence,
          };
        } catch {
          // If response is raw text instead of JSON, package it cleanly
          return {
            answer: rawText,
            recommendedAction: 'Review your next priority task in the portal.',
            evidence: context.evidence,
          };
        }
      } catch (err: any) {
        console.warn(`⚠️ [CopilotService] Error querying Gemini model ${model}:`, err.message);
      }
    }

    return null;
  }

  private static generateRulesBasedFallback(context: {
    employee: Employee;
    tasks: Task[];
    approvals: Approval[];
    settings: any;
    readinessScore: number;
    readinessStatus: 'READY' | 'AT_RISK' | 'BLOCKED';
    question: string;
    userRole: string;
    evidence: CopilotEvidence[];
  }): CopilotResponse {
    const q = context.question.toLowerCase();
    let answer = '';
    let recommendedAction = '';

    const failedJira = context.tasks.find((t) => t.adapterType === 'JIRA' && t.status === 'FAILED');
    const awsApproval = context.approvals.find((a) => (a.taskName || '').toLowerCase().includes('aws'));
    const pendingTasks = context.tasks.filter((t) => t.status === 'PENDING' || t.status === 'READY');

    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('haal')) {
      answer = `Hello ${context.employee.name}! 👋 I am your OnboardOS AI Copilot. You are registered as ${context.employee.roleTitle} in ${context.employee.departmentName} reporting to ${context.employee.managerName || 'Marcus Vance'}. Your current Day-1 Readiness is ${context.readinessScore}%.`;
      recommendedAction = 'Ask me about your task blocker, manager approval status, or your team Slack and GitHub tools.';
    } else if (q.includes('manager')) {
      answer = `Your assigned manager is ${context.employee.managerName || 'Marcus Vance'}. They are responsible for your team orientation and signing off on elevated AWS Cloud permissions.`;
      recommendedAction = 'Reach out to your manager on Slack for 1:1 onboarding check-in.';
    } else if (q.includes('slack')) {
      answer = `Your Slack workspace invite is ready. You are assigned to #general, #engineering, and #payments channels. Invite Link: ${context.settings.slackInviteUrl}`;
      recommendedAction = 'Click the link on your Daily Tasks board to join the Slack workspace.';
    } else if (q.includes('github') || q.includes('repo')) {
      answer = `You have been provisioned collaborator access to the ${context.settings.githubRepoUrl} repository for the Payments Core team.`;
      recommendedAction = 'Configure your SSH keys in GitHub to begin reviewing codebase repositories.';
    } else if (q.includes('jira') && (q.includes('blocked') || q.includes('fail') || q.includes('why'))) {
      if (failedJira) {
        answer = `Jira Software provisioning is currently blocked due to: "${failedJira.failureReason || 'HTTP 503 Rate Limit on Atlassian API'}". This failure automatically blocked dependent downstream sprint backlog tasks.`;
        recommendedAction = context.userRole === 'IT' || context.userRole === 'HR'
          ? 'Navigate to Exception Center to trigger an automated exponential backoff retry.'
          : 'Notify your IT Administrator or wait for the system automated recovery cycle to unblock your sprint board.';
      } else {
        answer = 'Jira Software provisioning has completed successfully and is assigned to your active sprint board.';
        recommendedAction = 'Open your team sprint board from your Daily Tasks dashboard.';
      }
    } else if (q.includes('aws') || (q.includes('approval') && q.includes('why'))) {
      answer = `AWS Cloud IAM Access requires Manager Approval because elevated staging/production cloud permissions are classified as HIGH risk under least-privilege engineering security policies.`;
      recommendedAction = context.userRole === 'MANAGER'
        ? 'Review and sign off on this access request in the Manager Approvals Queue.'
        : `Your manager (${context.employee.managerName || 'Marcus Vance'}) has been notified to review and approve your AWS IAM developer role.`;
    } else if (q.includes('day-1') || q.includes('day 1') || q.includes('ready')) {
      if (context.readinessStatus === 'READY') {
        answer = `Yes! ${context.employee.name} has achieved 100% Day-1 Readiness. All core identity, workspace, communication, and repository tools are fully provisioned.`;
        recommendedAction = 'Proceed with First-Week orientation and meet your assigned peer buddy.';
      } else {
        answer = `${context.employee.name} is currently at ${context.readinessScore}% readiness (${context.readinessStatus}). There are ${context.approvals.filter((a) => a.status === 'PENDING').length} pending approvals and ${context.tasks.filter((t) => t.status === 'FAILED').length} blocking issues remaining.`;
        recommendedAction = 'Resolve blocking tasks and complete manager sign-offs to reach 100% Day-1 readiness.';
      }
    } else if (q.includes('mentor') || q.includes('buddy')) {
      answer = 'Your assigned technical mentor is Kavita Rao (Staff Backend Engineer), and your culture buddy is Alex Rivera (Product Designer).';
      recommendedAction = 'Check your First-Week schedule for your 1:1 welcome tour on Day 1.';
    } else if (q.includes('next') || q.includes('what should i do')) {
      if (pendingTasks.length > 0) {
        const nextTask = pendingTasks[0];
        answer = `Your next recommended action is to claim and launch: "${nextTask.name}".`;
        recommendedAction = `Click "Claim & Launch Tool" on your Daily Tasks board to activate ${nextTask.name}.`;
      } else {
        answer = 'All scheduled onboarding tasks are complete. You are ready to participate in active sprint planning!';
        recommendedAction = 'Check your team Slack channel for sprint kick-off details.';
      }
    } else {
      // General summary
      answer = `Onboarding summary for ${context.employee.name} (${context.employee.roleTitle}): Readiness score is ${context.readinessScore}%. Key provisioned tools include Google Workspace, Slack Enterprise, GitHub, and Jira Software.`;
      recommendedAction = 'Review your task checklist and connect with your team lead.';
    }

    return {
      source: 'rules_based_fallback',
      answer,
      recommendedAction,
      evidence: context.evidence,
      readinessSummary: {
        score: context.readinessScore,
        status: context.readinessStatus,
      },
    };
  }
}
