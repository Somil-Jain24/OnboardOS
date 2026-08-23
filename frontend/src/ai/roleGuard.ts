import type { UserRole, User } from '../types';
import type { AIIntentType, AIIntentResult } from './intentDefinitions';
import { RESTRICTION_RESPONSES } from './restrictionResponses';

export interface RoleGuardDecision {
  allowed: boolean;
  denialResult?: AIIntentResult;
}

/**
 * Checks if a specific intent is permitted for the active role.
 * Enforces strict enterprise RBAC boundaries and privacy constraints.
 * Disallowed cross-role and privacy requests are intercepted and denied with exact pre-defined responses.
 */
export function checkRoleAuthorization(
  intent: AIIntentType | null,
  activeRole: UserRole,
  currentUser: User | null,
  rawQuery: string
): RoleGuardDecision {
  if (!intent) {
    return { allowed: true };
  }

  const q = rawQuery.toLowerCase().trim();

  // 1. Check if an Employee is asking about another employee's private onboarding status
  if (activeRole === 'EMPLOYEE') {
    const isOtherEmployeeStatusQuery =
      intent === 'EMP_QUERY_ANOTHER_EMPLOYEE_STATUS' ||
      (q.includes('onboarding status') && (q.includes('rahul') || q.includes('priya') || q.includes('arjun') || q.includes('neha'))) ||
      ((q.includes('status of') || q.includes('progress of') || q.includes('show')) &&
        (q.includes('priya') || q.includes('arjun') || q.includes('neha') || q.includes('marcus') || q.includes('david')));

    if (isOtherEmployeeStatusQuery) {
      return {
        allowed: false,
        denialResult: {
          intent: 'EMP_QUERY_ANOTHER_EMPLOYEE_STATUS',
          ownerRole: 'EMPLOYEE',
          badge: '🛡️ Security Policy',
          isRestricted: true,
          content: RESTRICTION_RESPONSES.EMPLOYEE_ASKING_OTHER_EMPLOYEE,
          evidence: {
            sourceType: 'SECURITY_GUARD',
            tags: ['Privacy Guardrail', 'RBAC Boundary', 'Access Denied'],
            deepLink: '/me',
            deepLinkLabel: 'Return to Personal Workspace',
          },
          actions: [
            { label: 'View My Workspace', actionKey: 'VIEW_MY_WORKSPACE', deepLink: '/me', primary: true },
          ],
        },
      };
    }
  }

  // 2. HR Role boundaries
  if (activeRole === 'HR') {
    if (intent.startsWith('EMP_')) {
      return {
        allowed: false,
        denialResult: {
          intent,
          ownerRole: 'HR',
          badge: '🛡️ Security Policy',
          isRestricted: true,
          content: RESTRICTION_RESPONSES.HR_ASKING_EMPLOYEE,
          evidence: {
            sourceType: 'SECURITY_GUARD',
            tags: ['Cross-Role Boundary', 'HR Restricted', 'Employee Scope'],
            deepLink: '/hr',
            deepLinkLabel: 'Return to HR Command Center',
          },
          actions: [
            { label: 'Return to HR Workspace', actionKey: 'VIEW_HR_WORKSPACE', deepLink: '/hr', primary: true },
          ],
        },
      };
    }

    if (intent.startsWith('MGR_')) {
      return {
        allowed: false,
        denialResult: {
          intent,
          ownerRole: 'HR',
          badge: '🛡️ Security Policy',
          isRestricted: true,
          content: RESTRICTION_RESPONSES.HR_ASKING_MANAGER,
          evidence: {
            sourceType: 'SECURITY_GUARD',
            tags: ['Cross-Role Boundary', 'HR Restricted', 'Manager Scope'],
            deepLink: '/hr',
            deepLinkLabel: 'Return to HR Command Center',
          },
          actions: [
            { label: 'Return to HR Workspace', actionKey: 'VIEW_HR_WORKSPACE', deepLink: '/hr', primary: true },
          ],
        },
      };
    }
  }

  // 3. Manager Role boundaries
  if (activeRole === 'MANAGER') {
    if (intent.startsWith('HR_')) {
      return {
        allowed: false,
        denialResult: {
          intent,
          ownerRole: 'MANAGER',
          badge: '🛡️ Security Policy',
          isRestricted: true,
          content: RESTRICTION_RESPONSES.MANAGER_ASKING_HR,
          evidence: {
            sourceType: 'SECURITY_GUARD',
            tags: ['Cross-Role Boundary', 'Manager Restricted', 'HR Scope'],
            deepLink: '/manager',
            deepLinkLabel: 'Return to Manager Command Center',
          },
          actions: [
            { label: 'Return to Manager Workspace', actionKey: 'VIEW_MGR_WORKSPACE', deepLink: '/manager', primary: true },
          ],
        },
      };
    }

    if (intent.startsWith('EMP_')) {
      return {
        allowed: false,
        denialResult: {
          intent,
          ownerRole: 'MANAGER',
          badge: '🛡️ Security Policy',
          isRestricted: true,
          content: RESTRICTION_RESPONSES.MANAGER_ASKING_EMPLOYEE,
          evidence: {
            sourceType: 'SECURITY_GUARD',
            tags: ['Cross-Role Boundary', 'Manager Restricted', 'Employee Scope'],
            deepLink: '/manager',
            deepLinkLabel: 'Return to Manager Command Center',
          },
          actions: [
            { label: 'Return to Manager Workspace', actionKey: 'VIEW_MGR_WORKSPACE', deepLink: '/manager', primary: true },
          ],
        },
      };
    }
  }

  // 4. Employee Role boundaries
  if (activeRole === 'EMPLOYEE') {
    if (intent.startsWith('HR_') || intent.startsWith('MGR_')) {
      return {
        allowed: false,
        denialResult: {
          intent,
          ownerRole: 'EMPLOYEE',
          badge: '🛡️ Security Policy',
          isRestricted: true,
          content: RESTRICTION_RESPONSES.EMPLOYEE_ASKING_ORG_OR_MANAGER,
          evidence: {
            sourceType: 'SECURITY_GUARD',
            tags: ['Cross-Role Boundary', 'Employee Restricted', 'Org Level Guard'],
            deepLink: '/me',
            deepLinkLabel: 'Return to Personal Workspace',
          },
          actions: [
            { label: 'View My Tasks', actionKey: 'VIEW_MY_TASKS', deepLink: '/me/tasks', primary: true },
          ],
        },
      };
    }
  }

  return { allowed: true };
}
