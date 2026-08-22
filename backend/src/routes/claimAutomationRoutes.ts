import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { store } from '../db/store';
import { env } from '../config/env';
import {
  dispatchAccessClaimRequested,
  dispatchDayOneReadyAutomation,
  verifyViaSocketCallbackSignature,
  isCallbackEventProcessed,
  markCallbackEventProcessed,
} from '../services/viasocketAutomation';
import { workflowEngine } from '../services/orchestrator/workflowEngine';
import { activationService } from '../services/activationService';
import type { Task, ClaimAttempt, Employee } from '../types';

const router = Router();

// Helper to check and dispatch Day-1 Ready if all conditions are met
async function checkAndDispatchDayOneReady(employeeId: string) {
  const empTasks = store.tasks.filter((t) => t.employeeId === employeeId);
  const pendingApprs = store.approvals.filter((a) => a.employeeId === employeeId && a.status === 'PENDING');
  const failedTasks = empTasks.filter((t) => t.status === 'FAILED');
  const allDone = empTasks.length > 0 && empTasks.every((t) => t.status === 'COMPLETED' || t.status === 'SKIPPED');

  if (allDone && pendingApprs.length === 0 && failedTasks.length === 0) {
    const employee = store.employees.find((e) => e.id === employeeId);
    if (employee) {
      await dispatchDayOneReadyAutomation(employee, 100, empTasks.length).catch((e) =>
        console.warn('[claimAutomationRoutes] day_one_ready automation warning:', e.message)
      );
    }
  }
}

/**
 * Helper to infer system name from task adapter type or name
 */
function inferSystemFromTask(task: Task): string {
  const name = task.name.toLowerCase();
  const adapter = (task.adapterType || '').toLowerCase();

  if (adapter === 'slack' || name.includes('slack')) return 'slack';
  if (adapter === 'github' || name.includes('github') || name.includes('repo')) return 'github';
  if (adapter === 'jira' || name.includes('jira')) return 'jira';
  if (adapter === 'aws' || name.includes('aws') || name.includes('cloud')) return 'aws';
  if (name.includes('figma')) return 'figma';
  if (adapter === 'google' || name.includes('google') || name.includes('mail')) return 'google';
  return 'internal';
}

/**
 * Helper to generate credentials payload when access is accepted
 */
function generateCredentialsForSystem(task: Task, employee: any, system: string): Record<string, any> {
  const safeEmpName = employee.name.toLowerCase().replace(/\s+/g, '.');
  const deptKey = (employee.departmentName || 'engineering').toLowerCase().replace(/\s+/g, '-');
  const teamKey = (employee.teamName || 'payments').toLowerCase().replace(/\s+/g, '-');

  if (system === 'google') {
    return {
      toolType: 'GOOGLE_WORKSPACE',
      email: employee.email || `${safeEmpName}@onboardos.internal`,
      tempPassword: `Pass#${Math.floor(100000 + Math.random() * 900000)}!`,
      ssoEnabled: true,
      webmailUrl: store.integrationSettings?.webmailUrl || 'https://mail.google.com',
      instructions: 'Use your temporary password on your first sign-in and register your 2FA authenticator app.',
    };
  } else if (system === 'slack') {
    return {
      toolType: 'SLACK_ENTERPRISE',
      workspace: 'OnboardOS Enterprise Slack',
      channels: ['#general', '#announcements', `#${deptKey}`, `#${teamKey}`],
      slackInviteUrl: store.integrationSettings?.slackInviteUrl || 'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
      slackDirectUrl: store.integrationSettings?.slackInviteUrl || 'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
      joinedStatus: 'Active & Verified',
      instructions: `You have been added to the team Slack workspace. Click below to join and access #${deptKey} & #${teamKey}.`,
    };
  } else if (system === 'github') {
    return {
      toolType: 'GITHUB_ENTERPRISE',
      org: 'Yash-Jhanwar / Demo',
      repositories: [`${teamKey}-core-repo`, 'demo'],
      role: 'Write / Contributor',
      repoUrl: store.integrationSettings?.githubRepoUrl || 'https://github.com/Yash-Jhanwar/demo',
      sshConfig: `git@github.com:Yash-Jhanwar/demo.git`,
    };
  } else if (system === 'jira') {
    return {
      toolType: 'JIRA_SOFTWARE',
      projectKey: `${teamKey.toUpperCase().slice(0, 4)}-SPRINT-2026`,
      assignedTickets: [
        `${teamKey.toUpperCase().slice(0, 4)}-101: Local Environment & Repositories Setup`,
        `${teamKey.toUpperCase().slice(0, 4)}-102: Review Architecture & Team Playbook`,
      ],
      sprintBoardUrl: store.integrationSettings?.jiraBoardUrl || 'https://onboardos.atlassian.net',
    };
  } else if (system === 'aws') {
    return {
      toolType: 'AWS_IAM',
      iamUser: `${safeEmpName}-staging`,
      accountAlias: 'onboardos-staging-cloud',
      assumedRole: `arn:aws:iam::123456789012:role/${employee.roleTitle.replace(/\s+/g, '')}DevRole`,
      consoleUrl: 'https://signin.aws.amazon.com/console',
    };
  } else if (system === 'figma') {
    return {
      toolType: 'FIGMA',
      team: 'Design Systems & Product UI',
      seatType: 'Full Design Editor',
      workspaceUrl: store.integrationSettings?.figmaWorkspaceUrl || 'https://www.figma.com',
    };
  } else {
    return {
      toolType: 'HANDBOOK',
      title: `${employee.departmentName || 'Company'} Onboarding Playbook`,
      portalUrl: '/knowledge',
      status: 'Ready for Review',
    };
  }
}

/**
 * POST /api/tasks/:id/claim-access
 * Authenticated endpoint for an employee to initiate 1-click self-service access claim.
 * Enforces strict resource ownership: Only the assigned employee (or ADMIN) can claim the task.
 */
router.post('/:id/claim-access', requireAuth, async (req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  const user = (req as any).user!;

  // 1. Strict Resource Ownership Enforcement
  const isOwner = user.role === 'EMPLOYEE' && user.employeeId === task.employeeId;
  const isAdmin = user.role === 'ADMIN' || user.role === 'HR';

  if (!isOwner && !isAdmin) {
    res.status(403).json({
      error: 'Forbidden: You can only claim onboarding tasks assigned directly to your employee profile.',
    });
    return;
  }

  const employee: Employee = store.employees.find((e) => e.id === task.employeeId) || {
    id: task.employeeId,
    name: user.name || 'Employee',
    email: user.email || 'employee@onboardos.internal',
    roleId: 'role-dev',
    roleTitle: 'Software Engineer',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    teamId: 'team-payments',
    teamName: 'Payments Core',
    seniority: 'MID',
    location: 'Bengaluru, India',
    employmentType: 'FULL_TIME',
    managerName: 'Marcus Vance',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const system = inferSystemFromTask(task);

  // 2. Transition state machine: Task becomes RUNNING, claimStatus becomes INVITE_SENT
  task.status = 'RUNNING';
  task.claimStatus = 'INVITE_SENT';
  task.startedAt = task.startedAt || new Date().toISOString();

  // 3. Record claim attempt ledger
  const claimAttempt: ClaimAttempt = {
    id: `clm-${Date.now()}`,
    taskId: task.id,
    employeeId: employee.id,
    system: system.toUpperCase(),
    claimStatus: 'INVITE_SENT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.claimAttempts.unshift(claimAttempt);

  // 4. Record audit log
  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    employeeId: employee.id,
    actorRole: user.role,
    action: 'EMPLOYEE_ACCESS_CLAIM_REQUESTED',
    entityType: 'Task',
    entityId: task.id,
    reason: `Employee ${employee.name} requested self-service access for ${system.toUpperCase()}.`,
    result: 'SUCCESS',
    createdAt: new Date().toISOString(),
  });

  // 5. Dispatch ViaSocket webhook event (non-blocking)
  const dispatchResult = await dispatchAccessClaimRequested(employee, system, task.id);

  res.json({
    success: true,
    message: `Access claim initiated for ${system.toUpperCase()}. An invite has been dispatched via ViaSocket.`,
    task,
    claimStatus: task.claimStatus,
    automationStatus: dispatchResult.status,
  });
});

/**
 * POST /api/automation/callback/claim
 * Public webhook callback endpoint called by ViaSocket once invite / provisioning succeeds or fails.
 * Verified with HMAC-SHA256 signature / Bearer secret and anti-replay protection.
 */
router.post('/callback/claim', async (req: Request, res: Response) => {
  const signatureHeader = req.headers['x-viasocket-signature'] as string | undefined;
  const timestampHeader = req.headers['x-viasocket-timestamp'] as string | undefined;
  const authHeader = req.headers['authorization'] as string | undefined;
  const secret = env.VIASOCKET_CALLBACK_SECRET;

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // 1. Signature & Secret Verification
  const verification = verifyViaSocketCallbackSignature(
    rawBody,
    signatureHeader,
    timestampHeader,
    authHeader,
    secret
  );

  if (!verification.valid) {
    res.status(401).json({
      error: 'Unauthorized: Callback signature verification failed.',
      reason: verification.reason,
    });
    return;
  }

  const { eventId, taskId, employeeId, system, result, externalId, error } = req.body;

  // 2. Anti-Replay Ledger Check
  if (eventId && isCallbackEventProcessed(eventId)) {
    res.json({
      received: true,
      status: 'ignored_duplicate',
      message: 'Event was already processed.',
    });
    return;
  }

  if (eventId) {
    markCallbackEventProcessed(eventId);
  }

  // 3. Find and update the task
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: `Task ${taskId} not found.` });
    return;
  }

  const employee = store.employees.find((e) => e.id === (employeeId || task.employeeId)) || {
    id: task.employeeId,
    name: 'Employee',
    email: 'employee@onboardos.internal',
    roleTitle: 'Software Engineer',
    departmentName: 'Engineering',
    teamName: 'Payments Core',
  };

  const sysName = (system || inferSystemFromTask(task)).toLowerCase();
  const isAccepted = result === 'ACCEPTED' || result === 'SUCCESS' || result === 'COMPLETED';
  const isInviteSent = result === 'INVITE_SENT';

  if (isAccepted) {
    // Platform confirmed access acceptance -> Advance to COMPLETED
    task.status = 'COMPLETED';
    task.claimStatus = 'ACCEPTED';
    task.completedAt = new Date().toISOString();

    const credentials = generateCredentialsForSystem(task, employee, sysName);

    // Unblock downstream tasks in DAG
    workflowEngine.evaluateDownstreamUnblocking(task.id);

    // Record audit trail
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: employee.id,
      actorRole: 'ADMIN',
      action: 'ACCESS_CLAIM_ACCEPTED',
      entityType: 'Task',
      entityId: task.id,
      reason: `ViaSocket confirmed access granted for ${sysName.toUpperCase()} (ID: ${externalId || 'auto'}). Task completed.`,
      result: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });

    // Check Day-1 readiness
    await checkAndDispatchDayOneReady(task.employeeId);

    res.json({
      received: true,
      status: 'completed',
      taskId: task.id,
      claimStatus: 'ACCEPTED',
      credentials,
    });
  } else if (isInviteSent) {
    task.status = 'RUNNING';
    task.claimStatus = 'INVITE_SENT';

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: employee.id,
      actorRole: 'ADMIN',
      action: 'ACCESS_CLAIM_INVITE_SENT',
      entityType: 'Task',
      entityId: task.id,
      reason: `ViaSocket confirmed invite dispatched for ${sysName.toUpperCase()}. Awaiting employee acceptance.`,
      result: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });

    res.json({
      received: true,
      status: 'running',
      taskId: task.id,
      claimStatus: 'INVITE_SENT',
    });
  } else {
    // FAILED
    task.status = 'FAILED';
    task.claimStatus = 'FAILED';
    task.failureReason = error || 'ViaSocket automation provisioning returned failure.';

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      employeeId: employee.id,
      actorRole: 'ADMIN',
      action: 'ACCESS_CLAIM_FAILED',
      entityType: 'Task',
      entityId: task.id,
      reason: `ViaSocket access claim for ${sysName.toUpperCase()} failed: ${task.failureReason}`,
      result: 'FAILURE',
      createdAt: new Date().toISOString(),
    });

    res.json({
      received: true,
      status: 'failed',
      taskId: task.id,
      claimStatus: 'FAILED',
      error: task.failureReason,
    });
  }
});

/**
 * POST /api/automation/callback/activation-email
 * Delivery result webhook callback from ViaSocket / Brevo.
 * Updates invitation delivery status (SENT_TO_PROVIDER, DELIVERED, BOUNCED, FAILED).
 */
router.post('/callback/activation-email', async (req: Request, res: Response) => {
  const signatureHeader = req.headers['x-viasocket-signature'] as string | undefined;
  const timestampHeader = req.headers['x-viasocket-timestamp'] as string | undefined;
  const authHeader = req.headers['authorization'] as string | undefined;
  const headerEventId = req.headers['x-viasocket-event-id'] as string | undefined;
  const secret = env.VIASOCKET_CALLBACK_SECRET;

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // 1. HMAC Signature & Timestamp Freshness Verification
  const verification = verifyViaSocketCallbackSignature(
    rawBody,
    signatureHeader,
    timestampHeader,
    authHeader,
    secret
  );

  if (!verification.valid) {
    res.status(401).json({
      error: 'Unauthorized: Callback signature verification failed.',
      reason: verification.reason,
    });
    return;
  }

  const {
    eventId = headerEventId,
    invitationId,
    employeeId,
    email,
    result,
    providerMessageId,
    error,
  } = req.body;

  // 2. Anti-Replay Ledger Check
  if (eventId && isCallbackEventProcessed(eventId)) {
    res.json({
      received: true,
      status: 'ignored_duplicate',
      message: 'Event was already processed.',
    });
    return;
  }

  if (eventId) {
    markCallbackEventProcessed(eventId);
  }

  // 3. Find matching invitation by ID, employeeId, or email
  let targetInv = store.invitations.find((i) => i.id === invitationId);
  if (!targetInv && employeeId) {
    targetInv = store.invitations.find((i) => i.employeeId === employeeId && i.status !== 'ACTIVATED');
  }
  if (!targetInv && email) {
    targetInv = store.invitations.find((i) => i.email.toLowerCase() === email.toLowerCase() && i.status !== 'ACTIVATED');
  }

  if (!targetInv) {
    res.status(404).json({ error: 'Matching activation invitation record not found.' });
    return;
  }

  // 4. Update delivery status
  const normalizedResult = (result || 'DELIVERED').toUpperCase();
  let mappedStatus: any = 'DELIVERED';

  if (normalizedResult === 'SENT_TO_PROVIDER' || normalizedResult === 'QUEUED') {
    mappedStatus = 'SENT_TO_PROVIDER';
  } else if (normalizedResult === 'BOUNCED' || normalizedResult === 'HARD_BOUNCE' || normalizedResult === 'SOFT_BOUNCE') {
    mappedStatus = 'BOUNCED';
  } else if (normalizedResult === 'FAILED' || normalizedResult === 'BLOCKED' || normalizedResult === 'INVALID_EMAIL') {
    mappedStatus = 'FAILED';
  } else if (normalizedResult === 'DELIVERED' || normalizedResult === 'SUCCESS') {
    mappedStatus = 'DELIVERED';
  }

  const updateResult = activationService.updateDeliveryStatus(
    targetInv.id,
    mappedStatus,
    providerMessageId,
    error
  );

  res.json({
    received: true,
    status: 'updated',
    invitationId: targetInv.id,
    deliveryStatus: mappedStatus,
    invitation: updateResult.invitation,
  });
});

/**
 * POST /api/automation/callback/brevo-email
 * Direct Brevo Transactional Webhook endpoint
 * Handles events: 'delivered', 'hard_bounce', 'soft_bounce', 'blocked', 'invalid_email', 'spam', 'error'
 */
router.post('/callback/brevo-email', async (req: Request, res: Response) => {
  const payload = req.body;
  const event = (payload.event || payload.eventType || payload.result || '').toLowerCase();
  const email = (payload.email || payload['recipient'] || '').toLowerCase();
  const messageId = payload['message-id'] || payload.messageId || payload.providerMessageId;
  const eventId = payload.id || payload.ts_event ? `brevo-evt-${payload.id || payload.ts_event}-${email}` : undefined;

  console.log(`📡 [Brevo Webhook] Received event '${event}' for recipient: ${email || 'unknown'} (MessageId: ${messageId || 'none'})`);

  if (eventId && isCallbackEventProcessed(eventId)) {
    res.json({ received: true, status: 'ignored_duplicate' });
    return;
  }
  if (eventId) {
    markCallbackEventProcessed(eventId);
  }

  // Find matching invitation by providerMessageId, email, or invitationId
  let targetInv = store.invitations.find((i) => messageId && i.providerMessageId && i.providerMessageId.includes(messageId));
  if (!targetInv && email) {
    targetInv = store.invitations.find((i) => i.email.toLowerCase() === email && i.status !== 'ACTIVATED');
  }

  if (!targetInv) {
    console.warn(`⚠️ [Brevo Webhook] No matching invitation found for messageId: ${messageId} or email: ${email}`);
    res.json({ received: true, matched: false });
    return;
  }

  let mappedStatus: any = 'DELIVERED';
  if (event === 'delivered') {
    mappedStatus = 'DELIVERED';
  } else if (event === 'hard_bounce' || event === 'soft_bounce' || event === 'invalid_email') {
    mappedStatus = 'BOUNCED';
  } else if (event === 'blocked' || event === 'spam' || event === 'error') {
    mappedStatus = 'FAILED';
  }

  const updateResult = activationService.updateDeliveryStatus(
    targetInv.id,
    mappedStatus,
    messageId,
    payload.reason || payload.error
  );

  // Add audit log
  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    employeeId: targetInv.employeeId,
    actorRole: 'ADMIN',
    action: `BREVO_EMAIL_${mappedStatus}`,
    entityType: 'ActivationInvitation',
    entityId: targetInv.id,
    reason: `Brevo webhook confirmed email status: ${mappedStatus} (Event: ${event})`,
    result: mappedStatus === 'FAILED' || mappedStatus === 'BOUNCED' ? 'FAILURE' : 'SUCCESS',
    createdAt: new Date().toISOString(),
  });

  res.json({
    received: true,
    matched: true,
    invitationId: targetInv.id,
    deliveryStatus: mappedStatus,
    invitation: updateResult.invitation,
  });
});

export default router;


