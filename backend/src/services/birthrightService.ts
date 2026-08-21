import { policyService } from './policyService';
import type { EmployeeContext, RequirementRule } from '../types';

export interface BirthrightEvaluationResult {
  matchedPolicies: Array<{
    policyId: string;
    policyName: string;
    policyType: string;
    matchedConditions: string[];
  }>;
  evaluatedEntitlements: Array<{
    id: string;
    name: string;
    app: string;
    riskLevel: string;
    isBirthright: boolean;
    requiresApproval: boolean;
    reason: string;
  }>;
  summary: {
    totalBirthright: number;
    totalApprovalGated: number;
    totalEvaluated: number;
  };
}

export class BirthrightService {
  public evaluate(context: EmployeeContext): BirthrightEvaluationResult {
    const matchedRules = policyService.matchRulesForContext(context);

    const matchedPolicies = matchedRules.map((r) => {
      const conditions: string[] = [];
      if (r.scope.department) conditions.push(`department == "${r.scope.department}"`);
      if (r.scope.roleTitle) conditions.push(`roleTitle == "${r.scope.roleTitle}"`);
      if (r.scope.seniority) conditions.push(`seniority == "${r.scope.seniority}"`);
      if (conditions.length === 0) conditions.push('universal organization baseline');

      return {
        policyId: r.id,
        policyName: r.requirementName,
        policyType: r.decision === 'REQUIRED' ? 'BIRTHRIGHT' : 'APPROVAL_REQUIRED',
        matchedConditions: conditions,
      };
    });

    const evaluatedEntitlements = matchedRules.map((r, idx) => {
      const isBirthright = r.decision === 'REQUIRED';
      const appName = r.requirementName.includes('Google')
        ? 'Google Workspace'
        : r.requirementName.includes('Slack')
        ? 'Slack'
        : r.requirementName.includes('GitHub')
        ? 'GitHub'
        : r.requirementName.includes('Jira')
        ? 'Jira'
        : r.requirementName.includes('AWS')
        ? 'AWS'
        : 'SaaS App';

      return {
        id: `eval-ent-${idx + 1}`,
        name: r.requirementName,
        app: appName,
        riskLevel: r.riskLevel,
        isBirthright,
        requiresApproval: !isBirthright,
        reason: r.reasonTemplate,
      };
    });

    const totalBirthright = evaluatedEntitlements.filter((e) => e.isBirthright).length;
    const totalApprovalGated = evaluatedEntitlements.filter((e) => !e.isBirthright).length;

    return {
      matchedPolicies,
      evaluatedEntitlements,
      summary: {
        totalBirthright,
        totalApprovalGated,
        totalEvaluated: evaluatedEntitlements.length,
      },
    };
  }
}

export const birthrightService = new BirthrightService();
