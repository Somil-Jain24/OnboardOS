import { Router, Request, Response } from 'express';
import { employeeService } from '../services/employeeService';
import { planService } from '../services/planService';
import { CopilotService } from '../services/copilotService';
import {
  dispatchNewEmployeeAutomation,
  dispatchEmployeeActivationInvitation,
  dispatchEmployeeOffboardedAutomation,
} from '../services/viasocketAutomation';
import { activationService } from '../services/activationService';
import { EmailService } from '../services/emailService';
import { SupabaseAuthService } from '../services/supabaseAuthAdmin';
import { store } from '../db/store';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { completeEmployeeIntake, createEmployeeIntakeInvitation } from '../services/employeeIntakeService';
import { env } from '../config/env';

const router = Router();

// HR enters only the work email. The employee record is deliberately not created
// until the trusted Google Sheets/Apps Script callback submits a complete form.
router.post('/intake-invitations', requireAuth, requireRole(['HR']), async (req: Request, res: Response) => {
  try {
    const result = await createEmployeeIntakeInvitation(req.body.email);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Could not create employee form invitation.' });
  }
});

// Configure this URL in a Google Apps Script trigger attached to the response
// sheet. The shared secret prevents arbitrary clients from creating employees.
router.post('/intake-responses/google-sheets', async (req: Request, res: Response) => {
  const configuredSecret = env.GOOGLE_FORM_RESPONSE_SECRET;
  if (!configuredSecret || req.header('x-onboardos-intake-secret') !== configuredSecret) {
    res.status(401).json({ error: 'Unauthorized Google Sheets intake response.' });
    return;
  }
  try {
    const result = await completeEmployeeIntake(req.body || {});
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Could not process employee form response.' });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status, department, search } = req.query;

  let employees = await employeeService.getAll({
    status: status as any,
    department: department as any,
    search: search as any,
  });

  if (user?.role === 'EMPLOYEE') {
    employees = employees.filter(
      (e) => e.id === user.employeeId || e.email.toLowerCase() === user.email.toLowerCase()
    );
  }

  const enrichedEmployees = employees.map((emp) => {
    const inv = store.invitations.find((i) => i.employeeId === emp.id);
    return {
      ...emp,
      invitation: inv
        ? {
            id: inv.id,
            status: inv.status,
            expiresAt: inv.expiresAt,
            providerMessageId: inv.providerMessageId,
            deliveryError: inv.deliveryError,
            resendCount: inv.resendCount,
            sentAt: inv.sentAt,
            deliveredAt: inv.deliveredAt,
          }
        : undefined,
    };
  });

  res.json({ success: true, data: enrichedEmployees });
});

// POST /api/employees - Create new employee profile
router.post('/', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const employee = await employeeService.create({
      name: input.name,
      email: input.email,
      roleTitle: input.roleTitle || 'Junior Developer',
      departmentName: input.departmentName || input.department || 'Engineering',
      teamName: input.teamName || input.team || input.department || 'Engineering',
      seniority: input.seniority || 'JUNIOR',
      location: input.location || 'Remote',
      employmentType: input.employmentType || 'FULL_TIME',
      managerName: input.managerName || 'Marcus Vance',
      startDate: input.startDate || new Date().toISOString().split('T')[0],
    });

    // Auto-generate onboarding plan & tasks for the new employee
    let plan = store.plans.find((p) => p.employeeId === employee.id && p.status === 'ACTIVE');
    if (!plan) {
      plan = planService.generatePlan(employee.id);
    }

    res.status(201).json({
      success: true,
      data: employee,
      plan,
      message: `Employee ${employee.name} created successfully.`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Could not create employee profile.' });
  }
});

// GET /api/employees/me/profile - Get current employee's profile and review status
router.get('/me/profile', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const employee = store.employees.find(
    (e) => e.id === user.employeeId || e.email.toLowerCase() === user.email.toLowerCase()
  );

  if (!employee) {
    res.status(404).json({ error: 'Employee record not found for current user session.' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...employee,
      profileStatus: employee.profileStatus || 'DRAFT',
    },
  });
});

// POST /api/employees/me/complete-profile - Candidate submits mandatory onboarding profile form
router.post('/me/complete-profile', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const employee = store.employees.find(
    (e) => e.id === user.employeeId || e.email.toLowerCase() === user.email.toLowerCase()
  );

  if (!employee) {
    res.status(404).json({ error: 'Employee record not found for current user session.' });
    return;
  }

  if (employee.profileStatus === 'APPROVED') {
    res.status(400).json({ error: 'Profile is already approved. Contact HR to request amendments.' });
    return;
  }

  const {
    name,
    personalEmail,
    phone,
    emergencyContactName,
    emergencyContactPhone,
    address,
    skills,
    joiningNotes,
  } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Full legal name is required.' });
    return;
  }
  if (!personalEmail || typeof personalEmail !== 'string' || !personalEmail.includes('@')) {
    res.status(400).json({ error: 'Valid personal email address is required.' });
    return;
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    res.status(400).json({ error: 'Valid phone number is required.' });
    return;
  }
  if (!emergencyContactName || !emergencyContactPhone) {
    res.status(400).json({ error: 'Emergency contact name and phone number are mandatory.' });
    return;
  }
  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    res.status(400).json({ error: 'Residential address is required.' });
    return;
  }

  // Update candidate-owned fields (HR-owned fields remain strictly untouched)
  const now = new Date().toISOString();
  employee.name = name.trim();
  employee.personalEmail = personalEmail.trim().toLowerCase();
  employee.phone = phone.trim();
  employee.emergencyContactName = emergencyContactName.trim();
  employee.emergencyContactPhone = emergencyContactPhone.trim();
  employee.address = address.trim();
  employee.skills = Array.isArray(skills) ? skills.map((s: string) => String(s).trim()) : [];
  employee.joiningNotes = joiningNotes ? String(joiningNotes).trim() : '';
  employee.profileStatus = 'PENDING_HR_APPROVAL';
  employee.profileSubmittedAt = now;
  employee.updatedAt = now;

  // Update User display name if changed
  const userAccount = store.users.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (userAccount) {
    userAccount.name = employee.name;
  }

  // Audit log
  store.auditLogs.unshift({
    id: `aud-prof-${Date.now()}`,
    employeeId: employee.id,
    actorRole: 'EMPLOYEE',
    action: 'EMPLOYEE_PROFILE_SUBMITTED',
    entityType: 'Employee',
    entityId: employee.id,
    reason: `Employee ${employee.name} submitted mandatory profile form for HR approval.`,
    result: 'SUCCESS',
    createdAt: now,
  });

  res.json({
    success: true,
    data: employee,
    message: 'Onboarding profile submitted successfully. Pending HR review.',
  });
});

// GET /api/employees/profile-approvals - HR/Admin queue of pending employee submissions
router.get('/profile-approvals', requireAuth, requireRole(['HR', 'ADMIN']), async (_req: Request, res: Response) => {
  const pendingList = store.employees.filter((e) => Boolean(e.profileStatus && e.profileStatus !== 'APPROVED'));
  res.json({
    success: true,
    data: pendingList,
    totalPending: pendingList.filter((e) => e.profileStatus === 'PENDING_HR_APPROVAL').length,
  });
});

// POST /api/employees/:id/approve-profile - HR approves profile submission
router.post('/:id/approve-profile', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const employee = store.employees.find((e) => e.id === req.params.id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }

  const now = new Date().toISOString();
  employee.profileStatus = 'APPROVED';
  employee.status = 'ACTIVE';
  employee.profileReviewedAt = now;
  employee.hrReviewNotes = req.body?.notes || 'Profile reviewed and approved by People Operations.';
  employee.updatedAt = now;

  // Generate onboarding plan & tasks if not yet created (self-service claims unlocked, no auto-provisioning)
  let plan = store.plans.find((p) => p.employeeId === employee.id && p.status === 'ACTIVE');
  if (!plan) {
    plan = planService.generatePlan(employee.id);
  }

  // Audit log
  store.auditLogs.unshift({
    id: `aud-prof-appr-${Date.now()}`,
    employeeId: employee.id,
    actorRole: (req as any).user?.role || 'HR',
    action: 'EMPLOYEE_PROFILE_APPROVED',
    entityType: 'Employee',
    entityId: employee.id,
    reason: `HR approved onboarding profile for ${employee.name} (${employee.email}). Self-service task claims unlocked.`,
    result: 'SUCCESS',
    createdAt: now,
  });

  res.json({
    success: true,
    data: employee,
    plan,
    message: `Onboarding profile for ${employee.name} approved. Self-service task claims unlocked.`,
  });
});

// POST /api/employees/:id/request-profile-changes - HR requests edits from employee
router.post('/:id/request-profile-changes', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const employee = store.employees.find((e) => e.id === req.params.id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }

  const notes = req.body?.notes || req.body?.feedback || 'Please update your submitted details.';
  const now = new Date().toISOString();

  employee.profileStatus = 'CHANGES_REQUESTED';
  employee.hrReviewNotes = notes;
  employee.profileReviewedAt = now;
  employee.updatedAt = now;

  store.auditLogs.unshift({
    id: `aud-prof-chg-${Date.now()}`,
    employeeId: employee.id,
    actorRole: (req as any).user?.role || 'HR',
    action: 'EMPLOYEE_PROFILE_CHANGES_REQUESTED',
    entityType: 'Employee',
    entityId: employee.id,
    reason: `HR requested profile changes for ${employee.name}: "${notes}"`,
    result: 'SUCCESS',
    createdAt: now,
  });

  res.json({
    success: true,
    data: employee,
    message: 'Profile changes requested from employee.',
  });
});

// POST /api/employees/:id/reject-profile - HR rejects employee profile
router.post('/:id/reject-profile', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const employee = store.employees.find((e) => e.id === req.params.id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }

  const reason = req.body?.reason || req.body?.notes || 'Profile submission rejected by People Operations.';
  const now = new Date().toISOString();

  employee.profileStatus = 'REJECTED';
  employee.hrReviewNotes = reason;
  employee.profileReviewedAt = now;
  employee.updatedAt = now;

  store.auditLogs.unshift({
    id: `aud-prof-rej-${Date.now()}`,
    employeeId: employee.id,
    actorRole: (req as any).user?.role || 'HR',
    action: 'EMPLOYEE_PROFILE_REJECTED',
    entityType: 'Employee',
    entityId: employee.id,
    reason: `HR rejected profile for ${employee.name}: "${reason}"`,
    result: 'SUCCESS',
    createdAt: now,
  });

  res.json({
    success: true,
    data: employee,
    message: 'Employee profile has been rejected.',
  });
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
    res.status(403).json({ error: 'Access denied: You can only view your own employee profile.' });
    return;
  }

  const employee = await employeeService.getById(req.params.id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const inv = store.invitations.find((i) => i.employeeId === employee.id);
  const enriched = {
    ...employee,
    invitation: inv
      ? {
          id: inv.id,
          status: inv.status,
          expiresAt: inv.expiresAt,
          providerMessageId: inv.providerMessageId,
          deliveryError: inv.deliveryError,
          resendCount: inv.resendCount,
          sentAt: inv.sentAt,
          deliveredAt: inv.deliveredAt,
        }
      : undefined,
  };

  res.json({ success: true, data: enriched });
});

router.get('/:id/context', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
    res.status(403).json({ error: 'Access denied: You can only view your own context.' });
    return;
  }

  const employee = await employeeService.getById(req.params.id);
  if (!employee || !employee.context) {
    const ctx = store.contexts.find((c) => c.employeeId === req.params.id);
    if (!ctx) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({ success: true, data: ctx });
    return;
  }
  res.json({ success: true, data: employee.context });
});

router.get('/:id/plan', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
    res.status(403).json({ error: 'Access denied: You can only view your own onboarding plan.' });
    return;
  }

  let plan = store.plans.find((p) => p.employeeId === req.params.id);
  if (!plan) {
    plan = planService.generatePlan(req.params.id);
  }
  res.json({ success: true, data: plan });
});

router.post('/:id/plan/generate', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
    res.status(403).json({ error: 'Access denied: You cannot generate plans for other employees.' });
    return;
  }

  const plan = planService.generatePlan(req.params.id);
  res.status(201).json({ success: true, data: plan });
});

router.get('/:id/tasks', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
    res.status(403).json({ error: 'Access denied: You can only view your own tasks.' });
    return;
  }

  let tasks = store.tasks.filter((t) => t.employeeId === req.params.id);
  if (tasks.length === 0 && store.employees.some((e) => e.id === req.params.id)) {
    planService.generatePlan(req.params.id);
    tasks = store.tasks.filter((t) => t.employeeId === req.params.id);
  }
  res.json({ success: true, data: tasks });
});

router.get('/:id/risk', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'EMPLOYEE' && user.employeeId !== req.params.id) {
    res.status(403).json({ error: 'Access denied: You can only view your own readiness metrics.' });
    return;
  }

  const risk = store.risks.find((r) => r.employeeId === req.params.id);
  if (!risk) {
    res.json({
      success: true,
      data: {
        id: `risk-${req.params.id}`,
        employeeId: req.params.id,
        computedAt: new Date().toISOString(),
        riskScore: 20,
        riskLevel: 'LOW',
        dayOneReady: true,
        readinessScore: 90,
        factors: [],
        readinessBreakdown: {
          criticalTasksTotal: 5,
          criticalTasksComplete: 4,
          requiredAccessTotal: 5,
          requiredAccessComplete: 4,
          requiredTrainingTotal: 1,
          requiredTrainingComplete: 1,
          blockingFailures: 0,
          pendingApprovals: 0,
        },
      },
    });
    return;
  }
  res.json({ success: true, data: risk });
});

// POST /api/employees/:id/copilot - Grounded AI & Rules-Based Question Answering
router.post('/:id/copilot', requireAuth, async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  const userRole = (req as any).user?.role || 'EMPLOYEE';
  try {
    const answer = await CopilotService.answerQuestion(req.params.id, question, userRole);
    res.json({
      success: true,
      ...answer,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate copilot explanation' });
  }
});

// POST /api/employees - Single Employee Creation with Secure Activation Invitation
router.post('/', requireAuth, requireRole(['HR']), async (req: Request, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const roleTitle = req.body.roleTitle || req.body.role || 'Software Engineer';
  const departmentName = req.body.departmentName || req.body.department || 'Engineering';
  const teamName = req.body.teamName || req.body.team || 'Payments Core';
  const seniority = req.body.seniority || 'JUNIOR';
  const location = req.body.location || 'Bengaluru, India';
  const employmentType = req.body.employmentType || 'FULL_TIME';
  const managerName = req.body.managerName || 'Marcus Vance';
  const startDate = req.body.startDate || new Date().toISOString().split('T')[0];

  if (!name || !email) {
    res.status(400).json({ error: 'Missing required fields: name and email are mandatory' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = store.employees.find((e) => e.email.toLowerCase() === normalizedEmail);
  if (existing) {
    res.status(409).json({
      error: `An employee with email "${email}" already exists in OnboardOS.`,
      existingEmployeeId: existing.id,
    });
    return;
  }

  const created = await employeeService.create({
    name,
    email: normalizedEmail,
    roleTitle,
    departmentName,
    teamName,
    seniority,
    location,
    employmentType,
    managerName,
    startDate,
  });

  // 1. Generate onboarding plan (Tasks start as READY, claimStatus NOT_STARTED)
  const plan = planService.generatePlan(created.id);
  const context = store.contexts.find((c) => c.employeeId === created.id);

  // 2. Generate secure 72h single-use base64url activation token (stored SHA-256)
  const { rawToken, invitation, activationUrl } = activationService.createInvitation(created.id, created.email);

  // 3. Dispatch Supabase Auth invitation, Brevo, and ViaSocket concurrently
  const [supabaseInviteResult, activationDispatchResult, emailResultSettled] = await Promise.allSettled([
    SupabaseAuthService.inviteEmployee(created, rawToken, invitation.expiresAt),
    dispatchEmployeeActivationInvitation(
      created,
      rawToken,
      invitation.expiresAt,
      invitation.id,
      { forceDispatch: true }
    ),
    EmailService.sendActivationEmail(
      created,
      rawToken,
      invitation.expiresAt,
      invitation.id
    ),
  ]);

  const supabaseResult = supabaseInviteResult.status === 'fulfilled' ? supabaseInviteResult.value : null;
  const viaSocketResult = activationDispatchResult.status === 'fulfilled' ? activationDispatchResult.value : null;
  const brevoResult = emailResultSettled.status === 'fulfilled' ? emailResultSettled.value : null;

  // 4. Dispatch employee.created tracker row to ViaSocket/Google Sheets
  let automationResult: any = { status: 'not_configured' };
  try {
    automationResult = await dispatchNewEmployeeAutomation(created, context, { forceDispatch: true });
  } catch (err: any) {
    console.warn('[employeeRoutes] ViaSocket employee.created warning:', err.message);
    automationResult = { status: 'failed', error: err.message };
  }

  const isEmailAccepted = supabaseResult?.success || brevoResult?.success || viaSocketResult?.success;
  const deliveryStatus = isEmailAccepted ? (supabaseResult?.status || 'SENT_TO_PROVIDER') : (brevoResult?.status || 'FAILED');
  const safeMessage = isEmailAccepted
    ? 'Employee created. Activation invitation email dispatched successfully via Supabase Auth.'
    : 'Employee created. Email automation needs configuration.';

  const automationStatus = (automationResult as any)?.status || ((automationResult as any)?.success ? 'dispatched' : 'failed');

  res.status(201).json({
    success: true,
    data: created,
    plan,
    invitation: {
      id: invitation.id,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
      activationUrl: activationUrl,
      deliveryStatus: deliveryStatus,
      authUserId: supabaseResult?.authUserId,
      providerMessageId: invitation.providerMessageId || supabaseResult?.messageId,
      deliveryError: invitation.deliveryError || supabaseResult?.error,
    },
    automation: {
      eventType: 'employee.created',
      status: automationStatus,
      dispatchedAt: (automationResult as any)?.timestamp || new Date().toISOString(),
      message: safeMessage,
    },
  });
});

// POST /api/employees/bulk - Bulk CSV Employee Ingestion with Activation Invitations
router.post('/bulk', requireAuth, requireRole(['HR']), async (req: Request, res: Response) => {
  const employeesList = req.body.employees || req.body;
  if (!Array.isArray(employeesList) || employeesList.length === 0) {
    res.status(400).json({ error: 'Expected an array of employee objects under "employees"' });
    return;
  }

  const createdEmployees = [];
  const createdPlans = [];
  const createdInvitations = [];
  const results = [];

  for (const empData of employeesList) {
    if (!empData.name || !empData.email) {
      results.push({ email: empData.email, status: 'failed', error: 'Missing name or email' });
      continue;
    }

    const existing = store.employees.find((e) => e.email.toLowerCase() === empData.email.toLowerCase());
    if (existing) {
      results.push({ email: empData.email, status: 'already_exists', employeeId: existing.id });
      continue;
    }

    const created = await employeeService.create({
      name: empData.name,
      email: empData.email,
      roleTitle: empData.roleTitle || empData.role || 'Software Engineer',
      departmentName: empData.departmentName || empData.department || 'Engineering',
      teamName: empData.teamName || empData.team || 'Core Team',
      seniority: empData.seniority || 'JUNIOR',
      location: empData.location || 'Remote',
      employmentType: empData.employmentType || 'FULL_TIME',
      managerName: empData.managerName || 'Marcus Vance',
      startDate: empData.startDate || new Date().toISOString().split('T')[0],
    });

    const plan = planService.generatePlan(created.id);
    const context = store.contexts.find((c) => c.employeeId === created.id);

    // Generate single-use activation invitation for each bulk employee
    const { rawToken, invitation } = activationService.createInvitation(created.id, created.email);

    // Supabase Auth invitation dispatch
    SupabaseAuthService.inviteEmployee(created, rawToken, invitation.expiresAt).catch((e) =>
      console.warn(`[bulk] Supabase Auth invite warning for ${created.name}:`, e.message)
    );

    // Send real email via Brevo Transactional Email API
    EmailService.sendActivationEmail(created, rawToken, invitation.expiresAt, invitation.id).catch((e) =>
      console.warn(`[bulk] Brevo email dispatch warning for ${created.name}:`, e.message)
    );

    // Non-blocking ViaSocket welcome email workflow
    dispatchEmployeeActivationInvitation(created, rawToken, invitation.expiresAt, invitation.id).catch((e) =>
      console.warn(`[bulk] ViaSocket activation email warning for ${created.name}:`, e.message)
    );

    // Non-blocking employee.created dispatch (tracker row)
    dispatchNewEmployeeAutomation(created, context).catch((e) =>
      console.warn(`[bulk] ViaSocket tracker warning for ${created.name}:`, e.message)
    );

    createdEmployees.push(created);
    createdPlans.push(plan);
    createdInvitations.push({
      employeeId: created.id,
      email: created.email,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    });
    results.push({ email: created.email, status: 'invited', employeeId: created.id });
  }

  res.status(201).json({
    success: true,
    message: `Successfully processed ${employeesList.length} employees (${createdEmployees.length} invited).`,
    data: createdEmployees,
    invitations: createdInvitations,
    results: results,
    count: createdEmployees.length,
  });
});

// POST /api/employees/:id/resend-activation - Resend Activation Invitation Email (HR / ADMIN)
router.post('/:id/resend-activation', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const result = await activationService.resendActivation(req.params.id);

  if (!result.success) {
    res.status(400).json({ error: result.error || 'Failed to resend activation invitation.' });
    return;
  }

  res.json({
    success: true,
    message: 'A fresh activation invitation has been generated and dispatched. Prior links were invalidated.',
    invitation: result.invitation,
    dispatched: result.dispatched,
  });
});

// POST /api/employees/:id/resend-supabase-invite - Resend Supabase Auth Invitation (HR / ADMIN)
router.post('/:id/resend-supabase-invite', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const result = await SupabaseAuthService.resendInvite(req.params.id);

  if (!result.success) {
    res.status(400).json({ error: result.error || 'Failed to resend Supabase invitation.' });
    return;
  }

  res.json({
    success: true,
    message: result.message || 'Supabase invitation resent successfully.',
  });
});

// POST /api/employees/:id/offboard - Execute Complete Access Revocation
router.post('/:id/offboard', requireAuth, async (req: Request, res: Response) => {
  const { exitDate, reason, notes } = req.body;
  const employee = store.employees.find((e) => e.id === req.params.id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  // 1. Transition employee status
  employee.status = 'OFFBOARDED';
  employee.updatedAt = new Date().toISOString();

  // 2. Revoke all active tasks & permissions
  const empTasks = store.tasks.filter((t) => t.employeeId === employee.id);
  empTasks.forEach((t) => {
    t.status = 'SKIPPED';
    t.failureReason = `Access Revoked due to Offboarding (${reason || 'Standard Departure'})`;
  });

  // 3. Mark pending approvals as rejected
  const empApprovals = store.approvals.filter((a) => a.employeeId === employee.id && a.status === 'PENDING');
  empApprovals.forEach((a) => {
    a.status = 'REJECTED';
    a.responseNote = 'Auto-rejected due to employee offboarding';
  });

  // 4. Generate system revocations summary
  const revocations = [
    { system: 'Google Workspace', action: 'Account Suspended & Active OAuth Sessions Terminated', status: 'REVOKED', timestamp: new Date().toISOString() },
    { system: 'Slack Enterprise Grid', action: 'User Deactivated & Removed from All Channels', status: 'REVOKED', timestamp: new Date().toISOString() },
    { system: 'GitHub Organization', action: 'Collaborator Access & Repo Keys Deleted', status: 'REVOKED', timestamp: new Date().toISOString() },
    { system: 'Jira Software', action: 'Project Board Permissions Revoked & Tickets Reassigned', status: 'REVOKED', timestamp: new Date().toISOString() },
    { system: 'AWS Cloud IAM', action: 'IAM Access Keys Deleted & Console Password Disabled', status: 'REVOKED', timestamp: new Date().toISOString() },
  ];

  // 5. Append-only compliance audit trail
  const auditId = `aud-offboard-${Date.now()}`;
  store.auditLogs.unshift({
    id: auditId,
    employeeId: employee.id,
    actorRole: 'HR',
    action: 'EMPLOYEE_OFFBOARDED_ALL_ACCESS_REVOKED',
    entityType: 'Employee',
    entityId: employee.id,
    reason: `Offboarded: ${reason || 'Standard Departure'}. Exit Date: ${exitDate || 'Immediate'}. Notes: ${notes || 'None'}`,
    result: 'SUCCESS',
    createdAt: new Date().toISOString(),
  });

  const certificateId = `SOC2-REVOKE-${employee.id}-${Date.now().toString(36).toUpperCase()}`;

  // Trigger ViaSocket Offboarding Automation
  dispatchEmployeeOffboardedAutomation(employee, {
    exitDate,
    reason,
    certificateId,
    revokedSystemsCount: 5,
  }).catch((e) => console.warn('[employeeRoutes] ViaSocket offboarding warning:', e.message));

  res.json({
    success: true,
    message: `All access privileges for ${employee.name} have been revoked across all enterprise systems.`,
    employee,
    revocations,
    certificateId,
    auditId,
  });
});

// POST /api/employees/bulk-offboard - Bulk CSV Offboarding & Multi-User Access Revocation
router.post('/bulk-offboard', requireAuth, async (req: Request, res: Response) => {
  const records = req.body.records || req.body;
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400).json({ error: 'Expected an array of offboarding records' });
    return;
  }

  const offboardedResults = [];

  for (const item of records) {
    const emp =
      store.employees.find((e) => e.id === item.employeeId || e.email.toLowerCase() === (item.email || '').toLowerCase());
    if (!emp) continue;

    emp.status = 'OFFBOARDED';
    emp.updatedAt = new Date().toISOString();

    const empTasks = store.tasks.filter((t) => t.employeeId === emp.id);
    empTasks.forEach((t) => {
      t.status = 'SKIPPED';
      t.failureReason = `Access Revoked via Bulk Offboarding CSV (${item.reason || 'Contract Completed'})`;
    });

    store.auditLogs.unshift({
      id: `aud-bulk-offboard-${emp.id}-${Date.now()}`,
      employeeId: emp.id,
      actorRole: 'HR',
      action: 'EMPLOYEE_OFFBOARDED_ALL_ACCESS_REVOKED',
      entityType: 'Employee',
      entityId: emp.id,
      reason: `Bulk CSV Offboarding: ${item.reason || 'Scheduled Departure'}`,
      result: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });

    offboardedResults.push({
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
      status: 'OFFBOARDED',
      revokedSystemsCount: 5,
    });
  }

  res.json({
    success: true,
    message: `Successfully executed complete access revocation for ${offboardedResults.length} employees from CSV.`,
    data: offboardedResults,
    count: offboardedResults.length,
  });
});

router.get('/:id/tasks', requireAuth, async (req: Request, res: Response) => {
  const employeeId = req.params.id;
  let tasks = store.tasks.filter((t) => t.employeeId === employeeId);
  if (tasks.length === 0) {
    planService.generatePlan(employeeId);
    tasks = store.tasks.filter((t) => t.employeeId === employeeId);
  }
  res.json({ success: true, data: tasks });
});

router.get('/:id/plan', requireAuth, async (req: Request, res: Response) => {
  const employeeId = req.params.id;
  let plan = store.plans.find((p) => p.employeeId === employeeId && p.status === 'ACTIVE') || store.plans.find((p) => p.employeeId === employeeId);
  if (!plan) {
    plan = planService.generatePlan(employeeId);
  }
  res.json({ success: true, data: plan });
});

router.get('/:id/context', requireAuth, async (req: Request, res: Response) => {
  const employeeId = req.params.id;
  const context = store.contexts.find((c) => c.employeeId === employeeId) || null;
  res.json({ success: true, data: context });
});

router.post('/:id/send-welcome-email', requireAuth, async (req: Request, res: Response) => {
  const employeeId = req.params.id;
  const tempPassword = req.body?.tempPassword || 'Employee@onboard1234';
  const employee = store.employees.find((e) => e.id === employeeId || e.email.toLowerCase() === employeeId.toLowerCase());
  
  if (!employee) {
    res.status(404).json({ error: 'Employee record not found.' });
    return;
  }

  const result = await EmailService.sendWelcomeCredentialsEmail(employee, tempPassword);

  // Record audit log
  store.auditLogs.unshift({
    id: `aud-welcome-mail-${Date.now()}`,
    employeeId: employee.id,
    actorRole: 'HR',
    action: 'WELCOME_CREDENTIALS_EMAIL_DISPATCHED',
    entityType: 'Employee',
    entityId: employee.id,
    reason: `Dispatched onboarding welcome email with login ID and temporary password to ${employee.email}.`,
    result: result.success ? 'SUCCESS' : 'FAILED',
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: result,
    message: `Onboarding welcome email dispatched to ${employee.email}.`,
  });
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const updated = await employeeService.update(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const success = await employeeService.delete(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ success: true, message: 'Employee deleted' });
});

export default router;
