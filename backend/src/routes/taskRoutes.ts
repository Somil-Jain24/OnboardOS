import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { workflowEngine } from '../services/orchestrator/workflowEngine';
import { DAGEngine } from '../services/orchestrator/dagEngine';
import { googleAdapter, slackAdapter, githubAdapter, jiraAdapter, awsAdapter } from '../services/integrations';
import { requireAuth } from '../middleware/authMiddleware';
import {
  dispatchTaskFailedAutomation,
  dispatchTaskRecoveryAutomation,
  dispatchDayOneReadyAutomation,
} from '../services/viasocketAutomation';

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
        console.warn('[taskRoutes] day_one_ready automation warning:', e.message)
      );
    }
  }
}

router.get('/', requireAuth, (req: Request, res: Response) => {
  const { employeeId } = req.query;
  const tasks = employeeId
    ? store.tasks.filter((t) => t.employeeId === employeeId)
    : store.tasks;
  res.json({ success: true, data: tasks });
});

router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ success: true, data: task });
});

// POST /api/tasks/:id/claim - Employee initiates/claims role-tailored tool and receives live credentials
router.post('/:id/claim', requireAuth, async (req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const employee = store.employees.find((e) => e.id === task.employeeId) || {
    id: task.employeeId,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@onboardos.internal',
    roleTitle: 'Software Engineer',
    departmentName: 'Engineering',
    teamName: 'Payments Core',
  };

  const safeEmpName = employee.name.toLowerCase().replace(/\s+/g, '.');
  const deptKey = (employee.departmentName || 'engineering').toLowerCase().replace(/\s+/g, '-');
  const teamKey = (employee.teamName || 'payments').toLowerCase().replace(/\s+/g, '-');

  // Mark task as completed
  task.status = 'COMPLETED';
  task.completedAt = new Date().toISOString();
  workflowEngine.evaluateDownstreamUnblocking(task.id);

  // Generate tool credentials & launch parameters dynamically
  let credentials: Record<string, any> = {};

  if (task.adapterType === 'GOOGLE' || task.name.toLowerCase().includes('google') || task.name.toLowerCase().includes('mail')) {
    credentials = {
      toolType: 'GOOGLE_WORKSPACE',
      email: employee.email || `${safeEmpName}@onboardos.internal`,
      tempPassword: `Pass#${Math.floor(100000 + Math.random() * 900000)}!`,
      ssoEnabled: true,
      webmailUrl: store.integrationSettings?.webmailUrl || 'https://mail.google.com',
      instructions: 'Use your temporary password on your first sign-in. You will be prompted to register your security key / authenticator app.',
    };
  } else if (task.adapterType === 'SLACK' || task.name.toLowerCase().includes('slack')) {
    credentials = {
      toolType: 'SLACK_ENTERPRISE',
      workspace: 'onboardos.slack.com',
      channels: ['#general', '#announcements', `#${deptKey}`, `#${teamKey}`],
      slackInviteUrl: store.integrationSettings?.slackInviteUrl || 'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
      slackDirectUrl: store.integrationSettings?.slackInviteUrl || 'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A',
      joinedStatus: 'Active & Verified',
      instructions: `You have been assigned to the official team Slack workspace. Click below to join and access #${deptKey} & #${teamKey}.`,
    };
  } else if (task.adapterType === 'GITHUB' || task.name.toLowerCase().includes('github')) {
    credentials = {
      toolType: 'GITHUB_ENTERPRISE',
      org: 'Yash-Jhanwar / Demo',
      repositories: [`${teamKey}-core-repo`, 'developer-docs-internal'],
      role: 'Write / Contributor',
      repoUrl: store.integrationSettings?.githubRepoUrl || 'https://github.com/Yash-Jhanwar/demo',
      sshConfig: `git@github.com:Yash-Jhanwar/demo.git`,
    };
  } else if (task.adapterType === 'JIRA' || task.name.toLowerCase().includes('jira')) {
    credentials = {
      toolType: 'JIRA_SOFTWARE',
      projectKey: `${teamKey.toUpperCase().slice(0, 4)}-SPRINT-2026`,
      assignedTickets: [
        `${teamKey.toUpperCase().slice(0, 4)}-101: Local Environment & Repositories Setup`,
        `${teamKey.toUpperCase().slice(0, 4)}-102: Review Architecture & Team Playbook`,
      ],
      sprintBoardUrl: store.integrationSettings?.jiraBoardUrl || 'https://onboardos.atlassian.net',
    };
  } else if (task.adapterType === 'AWS' || task.name.toLowerCase().includes('aws') || task.name.toLowerCase().includes('cloud')) {
    credentials = {
      toolType: 'AWS_IAM',
      iamUser: `${safeEmpName}-staging`,
      accountAlias: 'onboardos-staging-cloud',
      assumedRole: `arn:aws:iam::123456789012:role/${employee.roleTitle.replace(/\s+/g, '')}DevRole`,
      consoleUrl: 'https://signin.aws.amazon.com/console',
    };
  } else if (task.name.toLowerCase().includes('figma')) {
    credentials = {
      toolType: 'FIGMA',
      team: 'Design Systems & Product UI',
      seatType: 'Full Design Editor',
      workspaceUrl: store.integrationSettings?.figmaWorkspaceUrl || 'https://www.figma.com',
    };
  } else {
    credentials = {
      toolType: 'HANDBOOK',
      title: `${employee.departmentName || 'Company'} Onboarding Playbook`,
      portalUrl: '/knowledge',
      status: 'Ready for Review',
    };
  }

  // Record audit log
  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    employeeId: employee.id,
    actorRole: 'EMPLOYEE',
    action: 'TOOL_CLAIMED_BY_EMPLOYEE',
    entityType: 'Task',
    entityId: task.id,
    reason: `Employee claimed and activated tool: ${task.name}. Credentials and workspace permissions provisioned.`,
    result: 'SUCCESS',
    createdAt: new Date().toISOString(),
  });

  // Check Day-1 Ready
  await checkAndDispatchDayOneReady(task.employeeId);

  res.json({
    success: true,
    data: task,
    credentials,
  });
});

router.post('/:id/update-status', requireAuth, async (req: Request, res: Response) => {
  const { status, failureReason } = req.body;
  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }
  try {
    const previousStatus = store.tasks.find((t) => t.id === req.params.id)?.status;
    const updated = workflowEngine.updateTaskStatus(req.params.id, status, failureReason);
    const employee = store.employees.find((e) => e.id === updated.employeeId);

    // Event 1: task.failed trigger
    if (status === 'FAILED' && employee) {
      const blockedDownstream = DAGEngine.getDownstreamTasks(updated.id, store.dependencies).length;
      dispatchTaskFailedAutomation(updated, employee, blockedDownstream).catch((e) =>
        console.warn('[taskRoutes] task.failed ViaSocket dispatch warning:', e.message)
      );
    }

    // Event 2: task.retry_succeeded / recovery trigger
    if (status === 'COMPLETED' && previousStatus === 'FAILED' && employee) {
      const unblocked = store.tasks
        .filter((t) => t.employeeId === employee.id && t.status === 'READY')
        .map((t) => ({ id: t.id, name: t.name, status: t.status }));

      dispatchTaskRecoveryAutomation(updated, employee, unblocked).catch((e) =>
        console.warn('[taskRoutes] task.retry_succeeded ViaSocket dispatch warning:', e.message)
      );
    }

    // Event 3: Day-1 Ready check
    if (status === 'COMPLETED') {
      await checkAndDispatchDayOneReady(updated.employeeId);
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/retry', requireAuth, async (req: Request, res: Response) => {
  try {
    const taskBefore = store.tasks.find((t) => t.id === req.params.id);
    const wasFailed = taskBefore?.status === 'FAILED';
    const oldFailureReason = taskBefore?.failureReason;

    const updated = workflowEngine.retryTask(req.params.id);
    const employee = store.employees.find((e) => e.id === updated.employeeId);

    // Auto-execute adapter simulation on retry
    let adapterResult: any = { success: true };
    if (updated.adapterType === 'JIRA') {
      updated.status = 'COMPLETED';
      updated.completedAt = new Date().toISOString();
      workflowEngine.evaluateDownstreamUnblocking(updated.id);

      if (wasFailed && employee) {
        const unblocked = store.tasks
          .filter((t) => t.employeeId === employee.id && (t.status === 'READY' || t.status === 'COMPLETED'))
          .map((t) => ({ id: t.id, name: t.name, status: t.status }));

        const recoveredTask = { ...updated, failureReason: oldFailureReason };
        dispatchTaskRecoveryAutomation(recoveredTask, employee, unblocked).catch((e) =>
          console.warn('[taskRoutes] retry recovery ViaSocket dispatch warning:', e.message)
        );

        await checkAndDispatchDayOneReady(employee.id);
      }
    }

    res.json({ success: true, data: updated, adapterResult });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/execute', requireAuth, async (req: Request, res: Response) => {
  const task = store.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const employee = store.employees.find((e) => e.id === task.employeeId);
  const idempotencyKey = `idemp-${task.adapterType.toLowerCase()}-${task.id}-${Date.now()}`;
  const wasFailed = task.status === 'FAILED';
  const oldFailureReason = task.failureReason;

  let adapter;
  switch (task.adapterType) {
    case 'GOOGLE':
      adapter = googleAdapter;
      break;
    case 'SLACK':
      adapter = slackAdapter;
      break;
    case 'GITHUB':
      adapter = githubAdapter;
      break;
    case 'JIRA':
      adapter = jiraAdapter;
      break;
    case 'AWS':
      adapter = awsAdapter;
      break;
  }

  if (!adapter) {
    task.status = 'COMPLETED';
    res.json({ success: true, data: task, message: 'Executed non-adapter task' });
    return;
  }

  task.status = 'RUNNING';
  const result = await adapter.execute(task.id, { email: employee?.email, name: employee?.name }, idempotencyKey);

  if (result.success) {
    task.status = 'COMPLETED';
    task.completedAt = new Date().toISOString();
    workflowEngine.evaluateDownstreamUnblocking(task.id);

    if (wasFailed && employee) {
      const unblocked = store.tasks
        .filter((t) => t.employeeId === employee.id && (t.status === 'READY' || t.status === 'COMPLETED'))
        .map((t) => ({ id: t.id, name: t.name, status: t.status }));

      const recoveredTask = { ...task, failureReason: oldFailureReason };
      dispatchTaskRecoveryAutomation(recoveredTask, employee, unblocked).catch((e) =>
        console.warn('[taskRoutes] execute recovery ViaSocket dispatch warning:', e.message)
      );
    }

    if (employee) {
      await checkAndDispatchDayOneReady(employee.id);
    }
  } else {
    task.status = 'FAILED';
    task.failureCode = result.errorCode;
    task.failureReason = result.reason;
    workflowEngine.propagateBlocking(task.id);

    if (employee) {
      const blockedDownstream = DAGEngine.getDownstreamTasks(task.id, store.dependencies).length;
      dispatchTaskFailedAutomation(task, employee, blockedDownstream).catch((e) =>
        console.warn('[taskRoutes] execute failure ViaSocket dispatch warning:', e.message)
      );
    }
  }

  res.json({
    success: result.success,
    data: task,
    adapterResult: result,
  });
});

export default router;
