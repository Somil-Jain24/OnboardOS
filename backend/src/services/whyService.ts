import { store } from '../db/store';

export interface WhyExplanation {
  taskName: string;
  category: string;
  decision: string;
  confidenceScore: number;
  policyCitation: {
    ruleId: string;
    version: number;
    ruleName: string;
    reason: string;
  };
  contextFactors: Array<{
    attribute: string;
    value: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  riskAssessment: {
    level: string;
    requiresApproval: boolean;
    approvalRoles?: string[];
  };
}

export class WhyService {
  public explainTask(taskId: string): WhyExplanation | undefined {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    const planItem = store.plans
      .flatMap((p) => p.planItems)
      .find((pi) => pi.taskId === taskId || pi.id === task.planItemId);

    const employee = store.employees.find((e) => e.id === task.employeeId);
    const rule = planItem?.requirementRuleId
      ? store.rules.find((r) => r.id === planItem.requirementRuleId)
      : undefined;

    return {
      taskName: task.name,
      category: task.category,
      decision: planItem?.finalDecision || 'REQUIRED',
      confidenceScore: planItem?.aiConfidence || 0.98,
      policyCitation: {
        ruleId: rule?.id || 'rule-auto-baseline',
        version: rule?.version || 1,
        ruleName: rule?.requirementName || task.name,
        reason: rule?.reasonTemplate || planItem?.reason || 'Baseline standard requirement.',
      },
      contextFactors: [
        {
          attribute: 'Department',
          value: employee?.departmentName || 'Engineering',
          impact: 'HIGH',
        },
        {
          attribute: 'Role Title',
          value: employee?.roleTitle || 'Developer',
          impact: 'HIGH',
        },
        {
          attribute: 'Seniority Level',
          value: employee?.seniority || 'JUNIOR',
          impact: 'MEDIUM',
        },
      ],
      riskAssessment: {
        level: planItem?.riskLevel || 'LOW',
        requiresApproval: planItem?.finalDecision === 'APPROVAL_REQUIRED',
        approvalRoles: rule?.approvalChain || ['MANAGER'],
      },
    };
  }
}

export const whyService = new WhyService();
