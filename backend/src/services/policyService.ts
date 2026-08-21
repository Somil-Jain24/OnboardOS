import { store } from '../db/store';
import type { RequirementRule, EmployeeContext, RuleCategory, RequirementDecision, RiskLevel } from '../types';

export class PolicyService {
  public getAllRules(): RequirementRule[] {
    return store.rules;
  }

  public getRuleById(id: string): RequirementRule | undefined {
    return store.rules.find((r) => r.id === id);
  }

  public createRule(ruleData: Omit<RequirementRule, 'id' | 'createdAt'>): RequirementRule {
    const newRule: RequirementRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.rules.unshift(newRule);
    return newRule;
  }

  public updateRule(id: string, updates: Partial<RequirementRule>): RequirementRule | undefined {
    const idx = store.rules.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;

    store.rules[idx] = {
      ...store.rules[idx],
      ...updates,
    };
    return store.rules[idx];
  }

  public deleteRule(id: string): boolean {
    const idx = store.rules.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    store.rules.splice(idx, 1);
    return true;
  }

  /**
   * Matches rules against an employee context vector.
   */
  public matchRulesForContext(context: EmployeeContext): RequirementRule[] {
    return store.rules.filter((rule) => {
      const scope = rule.scope;
      if (!scope || Object.keys(scope).length === 0) return true; // Global universal rule

      if (scope.department && scope.department.toLowerCase() !== context.department.toLowerCase()) {
        return false;
      }
      if (scope.roleTitle && scope.roleTitle.toLowerCase() !== context.roleTitle.toLowerCase()) {
        return false;
      }
      if (scope.seniority && scope.seniority !== context.seniority) {
        return false;
      }
      if (scope.employmentType && scope.employmentType !== context.employmentType) {
        return false;
      }

      return true;
    });
  }
}

export const policyService = new PolicyService();
