import crypto from 'crypto';
import { env } from '../config/env';
import { store } from '../db/store';
import { employeeService } from './employeeService';
import { planService } from './planService';
import { dispatchNewEmployeeAutomation, dispatchEmployeeActivationInvitation } from './viasocketAutomation';
import { activationService } from './activationService';
import { SupabaseAuthService } from './supabaseAuthAdmin';

export type IntakeStatus = 'PENDING_FORM' | 'COMPLETED' | 'EXPIRED';

export interface EmployeeIntakeInvitation {
  id: string;
  email: string;
  status: IntakeStatus;
  formUrl: string;
  createdAt: string;
  completedAt?: string;
  employeeId?: string;
}

// The project currently runs on the local in-memory store. Keeping invitations
// separate avoids creating a partial Employee before the employee submits their form.
const invitations = new Map<string, EmployeeIntakeInvitation>();

const clean = (value: unknown) => String(value ?? '').trim();
const emailKey = (email: string) => email.toLowerCase();

function formUrlFor(email: string): string {
  if (!env.GOOGLE_FORM_URL) return '';
  const separator = env.GOOGLE_FORM_URL.includes('?') ? '&' : '?';
  // The form must include an Email question. Apps Script should use that email
  // for matching; this hint is convenient even when no prefill entry id is known.
  return `${env.GOOGLE_FORM_URL}${separator}onboardos_email=${encodeURIComponent(email)}`;
}

export async function createEmployeeIntakeInvitation(email: string) {
  const normalizedEmail = clean(email).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error('Enter a valid work email address.');
  if (store.employees.some((employee) => employee.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An employee with this work email already exists in OnboardOS.');
  }

  const existing = invitations.get(emailKey(normalizedEmail));
  if (existing?.status === 'PENDING_FORM') return { invitation: existing, delivery: 'already_pending' as const };

  const now = new Date().toISOString();
  const invitation: EmployeeIntakeInvitation = {
    id: crypto.randomUUID(), email: normalizedEmail, status: 'PENDING_FORM',
    formUrl: formUrlFor(normalizedEmail), createdAt: now,
  };
  invitations.set(emailKey(normalizedEmail), invitation);
  store.auditLogs.unshift({
    id: `aud-intake-${Date.now()}`, employeeId: 'pending', actorRole: 'HR',
    action: 'EMPLOYEE_SELF_SERVICE_FORM_INVITED', entityType: 'EmployeeIntake', entityId: invitation.id,
    reason: `Employee self-service form invited for ${normalizedEmail}.`, result: 'SUCCESS', createdAt: now,
  });

  // A ViaSocket flow can send the email. No email is falsely reported as sent when
  // that automation is not configured; HR can still copy/open the returned form link.
  let delivery: 'dispatched' | 'ready_to_send' | 'failed' = 'ready_to_send';
  if (env.VIASOCKET_EMPLOYEE_INTAKE_WEBHOOK_URL) {
    try {
      const response = await fetch(env.VIASOCKET_EMPLOYEE_INTAKE_WEBHOOK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-OnboardOS-Event': 'employee.intake_invited' },
        body: JSON.stringify({ event_type: 'employee.intake_invited', email: normalizedEmail, form_url: invitation.formUrl, invitation_id: invitation.id }),
      });
      delivery = response.ok ? 'dispatched' : 'failed';
    } catch { delivery = 'failed'; }
  }
  return { invitation, delivery };
}

export async function completeEmployeeIntake(payload: Record<string, unknown>) {
  const email = clean(payload.workEmail || payload.work_email || payload.email).toLowerCase();
  const invitation = invitations.get(emailKey(email));
  if (!invitation || invitation.status !== 'PENDING_FORM') throw new Error('No pending employee form invitation was found for this email.');

  const name = clean(payload.name || payload.fullName || payload.full_name);
  const roleTitle = clean(payload.roleTitle || payload.role || payload.jobTitle || payload.job_title);
  const departmentName = clean(payload.department);
  const managerName = clean(payload.manager || payload.managerName || payload.manager_name);
  const startDate = clean(payload.startDate || payload.start_date);
  if (!name || !roleTitle || !departmentName || !managerName || !startDate) {
    throw new Error('Form response is incomplete. Required: name, role, department, manager, and start date.');
  }
  if (store.employees.some((employee) => employee.email.toLowerCase() === email)) throw new Error('An employee with this email already exists.');

  const employee = await employeeService.create({
    name, email, roleTitle, departmentName, managerName, startDate,
    teamName: clean(payload.team) || departmentName,
    seniority: (['JUNIOR', 'MID', 'SENIOR', 'LEAD'].includes(clean(payload.seniority).toUpperCase()) ? clean(payload.seniority).toUpperCase() : 'JUNIOR') as any,
    employmentType: (['FULL_TIME', 'CONTRACT', 'INTERN'].includes(clean(payload.employmentType || payload.employment_type).toUpperCase()) ? clean(payload.employmentType || payload.employment_type).toUpperCase() : 'FULL_TIME') as any,
    location: clean(payload.location) || 'Remote',
  });
  const plan = planService.generatePlan(employee.id);
  invitation.status = 'COMPLETED'; invitation.completedAt = new Date().toISOString(); invitation.employeeId = employee.id;
  const context = store.contexts.find((item) => item.employeeId === employee.id);
  const automation = await dispatchNewEmployeeAutomation(employee, context);

  // Generate activation invitation and send welcome email via Supabase Auth + Brevo + ViaSocket
  const { rawToken, invitation: actInv } = activationService.createInvitation(employee.id, employee.email);
  SupabaseAuthService.inviteEmployee(employee, rawToken, actInv.expiresAt).catch((err) =>
    console.warn(`[intake] Supabase Auth invite warning for ${employee.name}:`, err.message)
  );
  dispatchEmployeeActivationInvitation(employee, rawToken, actInv.expiresAt).catch((err) =>
    console.warn(`[intake] Failed to dispatch activation invite for ${employee.name}:`, err.message)
  );

  return { employee, plan, automation, invitation, activation: { expiresAt: actInv.expiresAt, status: actInv.status } };
}
