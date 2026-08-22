import crypto from 'crypto';
import argon2 from 'argon2';
import { env } from '../config/env';
import { store } from '../db/store';
import { authService } from './authService';
import { dispatchEmployeeActivationInvitation } from './viasocketAutomation';
import { EmailService } from './emailService';
import type { ActivationInvitation, Employee, User, InvitationDeliveryStatus } from '../types';

export class ActivationService {
  /**
   * Hashes raw base64url token with SHA-256 for secure database lookup.
   */
  public hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Creates a fresh, cryptographically secure 72h one-time activation token.
   * Atomically invalidates/revokes any prior pending tokens for the same employee.
   */
  public createInvitation(
    employeeId: string,
    email: string
  ): { rawToken: string; invitation: ActivationInvitation; activationUrl: string } {
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(rawToken);
    const now = new Date();
    const ttlHours = env.ACTIVATION_TOKEN_TTL_HOURS || 72;
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000).toISOString();

    let priorResendCount = 0;

    // Revoke previous unused invitations for this employee
    for (const inv of store.invitations) {
      if (inv.employeeId === employeeId && inv.status !== 'ACTIVATED') {
        inv.status = 'REVOKED';
        inv.updatedAt = now.toISOString();
        priorResendCount = Math.max(priorResendCount, (inv.resendCount || 0) + 1);
      }
    }

    const hasAutomationConfigured = Boolean(
      env.VIASOCKET_EMPLOYEE_ACTIVATION_WEBHOOK_URL || env.BREVO_API_KEY
    );

    const invitation: ActivationInvitation = {
      id: `inv-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      employeeId,
      email,
      tokenHash,
      expiresAt,
      status: hasAutomationConfigured ? 'QUEUED' : 'NOT_SENT',
      resendCount: priorResendCount,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    store.invitations.unshift(invitation);

    // Record audit log
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId,
      actorRole: 'HR',
      action: 'ACTIVATION_INVITATION_CREATED',
      entityType: 'ActivationInvitation',
      entityId: invitation.id,
      reason: `One-time activation invitation generated (Expires in ${ttlHours}h). Status: ${invitation.status}`,
      result: 'SUCCESS',
      createdAt: now.toISOString(),
    });

    const activationUrl = `${env.APP_BASE_URL.replace(/\/+$/, '')}/activate/${rawToken}`;

    return {
      rawToken,
      invitation,
      activationUrl,
    };
  }

  /**
   * Updates delivery status of an invitation from provider callbacks (SENT_TO_PROVIDER, DELIVERED, BOUNCED, FAILED).
   */
  public updateDeliveryStatus(
    invitationId: string,
    status: InvitationDeliveryStatus,
    providerMessageId?: string,
    deliveryError?: string
  ): { success: boolean; invitation?: ActivationInvitation; error?: string } {
    const invitation = store.invitations.find((i) => i.id === invitationId);
    if (!invitation) {
      return { success: false, error: `Invitation ${invitationId} not found.` };
    }

    const now = new Date().toISOString();
    invitation.status = status;
    invitation.updatedAt = now;

    if (providerMessageId) {
      invitation.providerMessageId = providerMessageId;
    }
    if (deliveryError) {
      invitation.deliveryError = deliveryError;
    }
    if (status === 'SENT_TO_PROVIDER') {
      invitation.sentAt = now;
    }
    if (status === 'DELIVERED') {
      invitation.deliveredAt = now;
      invitation.deliveryError = undefined;
    }

    // Append-only audit logging
    const actionName =
      status === 'DELIVERED'
        ? 'EMAIL_DELIVERY_CONFIRMED'
        : status === 'SENT_TO_PROVIDER'
        ? 'EMAIL_SENT_TO_PROVIDER'
        : status === 'BOUNCED'
        ? 'EMAIL_DELIVERY_BOUNCED'
        : status === 'FAILED'
        ? 'EMAIL_DELIVERY_FAILED'
        : 'INVITATION_STATUS_UPDATED';

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: invitation.employeeId,
      actorRole: 'IT',
      action: actionName,
      entityType: 'ActivationInvitation',
      entityId: invitation.id,
      reason: `Invitation delivery status transitioned to ${status}. ${deliveryError ? `Error: ${deliveryError}` : ''}`,
      result: status === 'FAILED' || status === 'BOUNCED' ? 'FAILURE' : 'SUCCESS',
      createdAt: now,
    });

    return { success: true, invitation };
  }

  /**
   * Validates an activation token without consuming it (for frontend page load).
   */
  public validateToken(rawToken: string): {
    valid: boolean;
    employee?: Partial<Employee>;
    invitation?: ActivationInvitation;
    error?: string;
  } {
    if (!rawToken || typeof rawToken !== 'string') {
      return { valid: false, error: 'Activation token is missing or invalid.' };
    }

    const tokenHash = this.hashToken(rawToken);
    const invitation = store.invitations.find((inv) => inv.tokenHash === tokenHash);

    if (!invitation) {
      return { valid: false, error: 'Activation link was not found or has been replaced.' };
    }

    if (invitation.status === 'ACTIVATED') {
      return { valid: false, error: 'This invitation has already been used to activate an account.' };
    }

    if (invitation.status === 'REVOKED') {
      return { valid: false, error: 'This invitation link has been superseded by a newer invitation.' };
    }

    if (new Date(invitation.expiresAt) <= new Date()) {
      invitation.status = 'EXPIRED';
      invitation.updatedAt = new Date().toISOString();
      return { valid: false, error: 'This activation link has expired. Please ask HR to resend an invite.' };
    }

    const employee = store.employees.find((e) => e.id === invitation.employeeId);
    if (!employee) {
      return { valid: false, error: 'Associated employee record could not be found.' };
    }

    return {
      valid: true,
      invitation,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        roleTitle: employee.roleTitle,
        departmentName: employee.departmentName,
        teamName: employee.teamName,
        managerName: employee.managerName,
        startDate: employee.startDate,
      },
    };
  }

  /**
   * Atomically activates an employee account, hashes password with Argon2id,
   * updates status to ACTIVE, and issues an authenticated session.
   * Enforces 12+ character password complexity policy.
   */
  public async activateAccount(
    rawToken: string,
    password: string
  ): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    // 1. Strict Password Policy: >= 12 chars, uppercase, lowercase, number, special character
    if (!password || password.length < 12) {
      return { success: false, error: 'Password must be at least 12 characters in length.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { success: false, error: 'Password must contain at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { success: false, error: 'Password must contain at least one special character or symbol.' };
    }

    const validation = this.validateToken(rawToken);
    if (!validation.valid || !validation.invitation || !validation.employee) {
      return { success: false, error: validation.error || 'Invalid activation token.' };
    }

    const invitation = validation.invitation;
    const employee = store.employees.find((e) => e.id === invitation.employeeId);
    if (!employee) {
      return { success: false, error: 'Employee record not found.' };
    }

    // Atomic token consumption check
    if (invitation.status === 'ACTIVATED') {
      return { success: false, error: 'This invitation was already consumed in another session.' };
    }

    const now = new Date().toISOString();

    // 2. Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    // 3. Mark invitation as ACTIVATED atomically
    invitation.status = 'ACTIVATED';
    invitation.activatedAt = now;
    invitation.updatedAt = now;

    // 4. Promote employee status to ACTIVE
    employee.status = 'ACTIVE';
    employee.updatedAt = now;

    // 5. Create or update User account with Argon2id hash and assigned role
    const assignedRole = (employee as any).role || 'EMPLOYEE';
    let user = store.users.find((u) => u.email.toLowerCase() === employee.email.toLowerCase());
    if (!user) {
      user = {
        id: `usr-${employee.id}`,
        name: employee.name,
        email: employee.email,
        role: assignedRole,
        employeeId: employee.id,
        department: employee.departmentName,
        passwordHash,
        activatedAt: now,
        createdAt: now,
      };
      store.users.push(user);
    } else {
      user.passwordHash = passwordHash;
      user.role = assignedRole;
      user.activatedAt = now;
      user.employeeId = employee.id;
      user.department = employee.departmentName;
    }

    // 6. Log audit trail
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: employee.id,
      actorRole: 'EMPLOYEE',
      action: 'EMPLOYEE_ACCOUNT_ACTIVATED',
      entityType: 'User',
      entityId: user.id,
      reason: `Employee ${employee.name} created secure credentials with Argon2id and activated account.`,
      result: 'SUCCESS',
      createdAt: now,
    });

    // 7. Generate authenticated JWT token
    const token = authService.generateToken(user);

    return {
      success: true,
      user,
      token,
    };
  }

  /**
   * Resends an activation email for an invited employee, invalidating prior tokens.
   */
  public async resendActivation(employeeId: string): Promise<{
    success: boolean;
    invitation?: ActivationInvitation;
    dispatched?: boolean;
    error?: string;
  }> {
    const employee = store.employees.find((e) => e.id === employeeId);
    if (!employee) {
      return { success: false, error: 'Employee not found.' };
    }

    // Create fresh invitation (automatically revokes prior unused tokens)
    const { rawToken, invitation, activationUrl } = this.createInvitation(employee.id, employee.email);

    // Record audit log
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: employee.id,
      actorRole: 'HR',
      action: 'EMPLOYEE_ACTIVATION_RESENT',
      entityType: 'ActivationInvitation',
      entityId: invitation.id,
      reason: `HR requested resend of activation invitation. Previous token revoked. Resend count: ${invitation.resendCount}`,
      result: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });

    // 1. Direct Brevo Email Sending
    const emailResult = await EmailService.sendActivationEmail(
      employee,
      rawToken,
      invitation.expiresAt,
      invitation.id
    );

    // 2. Also dispatch ViaSocket workflow (non-blocking)
    dispatchEmployeeActivationInvitation(
      employee,
      rawToken,
      invitation.expiresAt,
      invitation.id
    ).catch((err) => console.warn('[resendActivation] ViaSocket dispatch warning:', err.message));

    return {
      success: true,
      invitation,
      dispatched: emailResult.success,
    };
  }
}

export const activationService = new ActivationService();
