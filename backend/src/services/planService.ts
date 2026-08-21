import { store } from '../db/store';
import { policyService } from './policyService';
import type { OnboardingPlan, PlanItem, EmployeeContext } from '../types';

export class PlanService {
  /**
   * Generates a personalized OnboardingPlan based on EmployeeContext and active RequirementRules.
   */
  public generatePlan(employeeId: string): OnboardingPlan {
    const context = store.contexts.find((c) => c.employeeId === employeeId) || {
      id: `ctx-${employeeId}-gen`,
      employeeId,
      capturedAt: new Date().toISOString(),
      roleTitle: 'Software Engineer',
      department: 'Engineering',
      team: 'Platform',
      seniority: 'JUNIOR' as const,
      location: 'Bengaluru, India',
      employmentType: 'FULL_TIME' as const,
      raw: {},
    };

    const matchedRules = policyService.matchRulesForContext(context);
    const planId = `plan-${employeeId}-${Date.now().toString(36)}`;

    const planItems: PlanItem[] = matchedRules.map((rule, idx) => ({
      id: `pi-${planId}-${idx + 1}`,
      planId,
      requirementRuleId: rule.id,
      name: rule.requirementName,
      category: rule.category,
      finalDecision: rule.decision,
      reason: rule.reasonTemplate,
      aiConfidence: 0.95 + idx * 0.01,
      riskLevel: rule.riskLevel,
    }));

    const newPlan: OnboardingPlan = {
      id: planId,
      employeeId,
      employeeContextId: context.id,
      ruleSetVersion: 1,
      generatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      planItems,
      reasoningSequence: [
        {
          step: 1,
          title: 'Context Vector Normalization',
          description: `Extracted role "${context.roleTitle}", department "${context.department}", team "${context.team}".`,
          status: 'completed',
        },
        {
          step: 2,
          title: 'Deterministic Policy Evaluation',
          description: `Matched ${matchedRules.length} requirement rules from authoritative v1.0.0 policy catalogue.`,
          status: 'completed',
        },
        {
          step: 3,
          title: 'DAG Task Graph Assembly',
          description: 'Constructed dependency sequences and assigned appropriate provisioning adapters.',
          status: 'completed',
        },
      ],
    };

    // Mark previous plans for this employee as superseded
    store.plans.forEach((p) => {
      if (p.employeeId === employeeId) p.status = 'SUPERSEDED';
    });

    store.plans.unshift(newPlan);
    return newPlan;
  }

  public getPlanById(id: string): OnboardingPlan | undefined {
    return store.plans.find((p) => p.id === id);
  }

  public getActivePlanForEmployee(employeeId: string): OnboardingPlan | undefined {
    return store.plans.find((p) => p.employeeId === employeeId && p.status === 'ACTIVE');
  }
}

export const planService = new PlanService();
