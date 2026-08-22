import { store } from '../db/store';
import { policyService } from './policyService';
import type { OnboardingPlan, PlanItem, EmployeeContext, Task, AdapterType } from '../types';

export class PlanService {
  /**
   * Generates a personalized OnboardingPlan and corresponding executable tasks
   * dynamically tailored to the employee's role, department, and team.
   */
  public generatePlan(employeeId: string): OnboardingPlan {
    const employee = store.employees.find((e) => e.id === employeeId);
    const context = store.contexts.find((c) => c.employeeId === employeeId) || {
      id: `ctx-${employeeId}-gen`,
      employeeId,
      capturedAt: new Date().toISOString(),
      roleTitle: employee?.roleTitle || 'Software Engineer',
      department: employee?.departmentName || 'Engineering',
      team: employee?.teamName || 'Platform',
      seniority: employee?.seniority || ('JUNIOR' as const),
      location: employee?.location || 'Bengaluru, India',
      employmentType: employee?.employmentType || ('FULL_TIME' as const),
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

    const isEng = context.department.toLowerCase().includes('eng') || context.roleTitle.toLowerCase().includes('dev') || context.roleTitle.toLowerCase().includes('engineer');
    const isDesign = context.department.toLowerCase().includes('design') || context.roleTitle.toLowerCase().includes('design') || context.roleTitle.toLowerCase().includes('frontend');

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
          description: `Matched ${matchedRules.length} requirement rules from authoritative v1.0.0 policy catalogue for ${context.roleTitle}.`,
          status: 'completed',
        },
        {
          step: 3,
          title: 'DAG Task Graph Assembly',
          description: 'Constructed role-tailored dependency sequences and assigned provisioning adapters.',
          status: 'completed',
        },
      ],
    };

    // Mark previous plans for this employee as superseded
    store.plans.forEach((p) => {
      if (p.employeeId === employeeId) p.status = 'SUPERSEDED';
    });
    store.plans.unshift(newPlan);

    // Generate matching executable tasks if not present
    const existingTasks = store.tasks.filter((t) => t.employeeId === employeeId);
    if (existingTasks.length === 0) {
      const now = new Date().toISOString();
      const generatedTasks: Task[] = [
        {
          id: `task-${employeeId}-google`,
          employeeId,
          name: `Corporate Google Workspace Account (${employee?.email || 'name@onboardos.internal'})`,
          category: 'Identity',
          status: 'READY',
          adapterType: 'GOOGLE',
          attempt: 0,
          createdAt: now,
        },
        {
          id: `task-${employeeId}-slack`,
          employeeId,
          name: `Slack Workspace (#general, #${context.department.toLowerCase().replace(/\s+/g, '-')}, #${context.team.toLowerCase().replace(/\s+/g, '-')})`,
          category: 'Communication',
          status: 'READY',
          adapterType: 'SLACK',
          attempt: 0,
          createdAt: now,
        },
      ];

      if (isEng) {
        generatedTasks.push(
          {
            id: `task-${employeeId}-github`,
            employeeId,
            name: `GitHub Enterprise Repository Access (repo: ${context.team.toLowerCase().replace(/\s+/g, '-')}-core)`,
            category: 'Development',
            status: 'READY',
            adapterType: 'GITHUB',
            attempt: 0,
            createdAt: now,
          },
          {
            id: `task-${employeeId}-jira`,
            employeeId,
            name: `Jira Software Agile Board (${context.team.toUpperCase().slice(0, 4)}-SPRINT-2026)`,
            category: 'Project',
            status: 'READY',
            adapterType: 'JIRA',
            attempt: 0,
            createdAt: now,
          },
          {
            id: `task-${employeeId}-aws`,
            employeeId,
            name: `AWS Cloud Staging IAM Role (${context.roleTitle.replace(/\s+/g, '')}DevRole)`,
            category: 'Cloud',
            status: 'WAITING_APPROVAL',
            adapterType: 'AWS',
            attempt: 0,
            createdAt: now,
          }
        );
      }

      if (isDesign) {
        generatedTasks.push({
          id: `task-${employeeId}-figma`,
          employeeId,
          name: 'Figma Design System Workspace & Organization Seat',
          category: 'Development',
          status: 'READY',
          adapterType: 'NONE',
          attempt: 0,
          createdAt: now,
        });
      }

      generatedTasks.push({
        id: `task-${employeeId}-training`,
        employeeId,
        name: `${context.department} Onboarding Playbook & Compliance Training`,
        category: 'Training',
        status: 'READY',
        adapterType: 'NONE',
        attempt: 0,
        createdAt: now,
      });

      store.tasks.unshift(...generatedTasks);
    }

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
