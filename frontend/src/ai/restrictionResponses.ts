/**
 * Exact deterministic responses for cross-role and privacy access restrictions.
 * DO NOT change these strings. They ensure strict RBAC guardrails without fallback to Gemini.
 */

export const RESTRICTION_RESPONSES = {
  // HR asking employee personal questions
  HR_ASKING_EMPLOYEE: `I can help you with HR-level onboarding management, but this is an employee-specific request. Please use the Employee account or Employee AI workspace to access personal onboarding information.`,

  // HR asking manager specific questions
  HR_ASKING_MANAGER: `This information is available in the Manager AI workspace because it is based on manager-specific team responsibilities and insights. Please use a Manager account to access this view.`,

  // Manager asking HR specific questions
  MANAGER_ASKING_HR: `This is an HR-specific operation. HR AI has access to organization-level onboarding management and HR action workflows. Please use the HR workspace for this request.`,

  // Manager asking employee personal questions
  MANAGER_ASKING_EMPLOYEE: `This request is specific to an employee's personal onboarding workspace. Please use the Employee AI workspace to access personal onboarding information.`,

  // Employee asking HR or Manager questions (org level)
  EMPLOYEE_ASKING_ORG_OR_MANAGER: `I can help you with your own onboarding, resources, access, and support needs. Organization-level HR and team management information is restricted to authorized HR or Manager roles.`,

  // Employee asking about another employee's status
  EMPLOYEE_ASKING_OTHER_EMPLOYEE: `I can only provide onboarding information for your own employee account. Other employees' onboarding information is restricted for privacy and security.`,
};
