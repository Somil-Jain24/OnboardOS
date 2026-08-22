import {
  dispatchNewEmployeeAutomation,
  dispatchApprovalRequestedAutomation,
  dispatchTaskFailedAutomation,
  dispatchTaskRecoveryAutomation,
  dispatchDayOneReadyAutomation,
} from './services/viasocketAutomation';
import { store } from './db/store';

async function runTests() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ Live automation test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }
  console.log('🧪 Starting ViaSocket Multi-Event Automation Tests...\n');

  const demoEmployee = store.employees[0] || {
    id: 'emp-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@onboardos.internal',
    roleId: 'role-dev',
    roleTitle: 'Junior Backend Developer',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    teamId: 'team-core',
    teamName: 'Payments Core',
    seniority: 'JUNIOR' as const,
    location: 'Bengaluru, India',
    employmentType: 'FULL_TIME' as const,
    managerName: 'Marcus Vance',
    status: 'INVITED' as const,
    startDate: '2026-09-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Test 1: employee.created
  console.log('1️⃣ Testing employee.created event...');
  const res1 = await dispatchNewEmployeeAutomation(demoEmployee, undefined, { forceDispatch: true });
  console.log('Result 1:', { success: res1.success, status: res1.status, eventId: res1.eventId, statusCode: res1.statusCode });

  // Test 2: approval.requested
  console.log('\n2️⃣ Testing approval.requested event...');
  const demoApproval: any = {
    id: 'appr-test-aws',
    employeeId: demoEmployee.id,
    employeeName: demoEmployee.name,
    taskId: 'task-aws',
    taskName: 'AWS Production IAM Privileges',
    stage: 1,
    approverRole: 'MANAGER' as const,
    approverUserName: 'Marcus Vance',
    reason: 'Junior engineer requires manager authorization before production cloud access is granted.',
    riskLevel: 'HIGH',
    status: 'PENDING' as const,
    requestedAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  const res2 = await dispatchApprovalRequestedAutomation(demoApproval, demoEmployee, { forceDispatch: true });
  console.log('Result 2:', { success: res2.success, status: res2.status, eventId: res2.eventId, statusCode: res2.statusCode });

  // Test 3: task.failed
  console.log('\n3️⃣ Testing task.failed event...');
  const demoFailedTask: any = {
    id: 'task-jira-err',
    employeeId: demoEmployee.id,
    name: 'Jira Software Provisioning',
    category: 'Development',
    adapterType: 'JIRA' as const,
    status: 'FAILED' as const,
    attempt: 2,
    failureCode: 'HTTP_503_SERVICE_UNAVAILABLE',
    failureReason: 'Rate limit exceeded on Jira Cloud API. Retries throttled.',
    createdAt: new Date().toISOString(),
  };
  const res3 = await dispatchTaskFailedAutomation(demoFailedTask, demoEmployee, 2, { forceDispatch: true });
  console.log('Result 3:', { success: res3.success, status: res3.status, eventId: res3.eventId, statusCode: res3.statusCode });

  // Test 4: task.retry_succeeded
  console.log('\n4️⃣ Testing task.retry_succeeded event...');
  const demoRecoveredTask: any = {
    id: 'task-jira-err',
    employeeId: demoEmployee.id,
    name: 'Jira Software Provisioning',
    category: 'Development',
    adapterType: 'JIRA' as const,
    status: 'COMPLETED' as const,
    attempt: 3,
    failureReason: 'Previously failed with HTTP 503 Rate Limit',
    createdAt: new Date().toISOString(),
  };
  const unblocked = [{ id: 'task-aws', name: 'AWS Production IAM Privileges', status: 'READY' }];
  const res4 = await dispatchTaskRecoveryAutomation(demoRecoveredTask, demoEmployee, unblocked, { forceDispatch: true });
  console.log('Result 4:', { success: res4.success, status: res4.status, eventId: res4.eventId, statusCode: res4.statusCode });

  // Test 5: onboarding.day_one_ready
  console.log('\n5️⃣ Testing onboarding.day_one_ready event...');
  const res5 = await dispatchDayOneReadyAutomation(demoEmployee, 100, 6, { forceDispatch: true });
  console.log('Result 5:', { success: res5.success, status: res5.status, eventId: res5.eventId, statusCode: res5.statusCode });

  // Test 6: Idempotency Protection
  console.log('\n6️⃣ Testing Idempotency Deduplication Protection...');
  const resDuplicate = await dispatchNewEmployeeAutomation(demoEmployee, undefined, { forceDispatch: false });
  console.log('Result Duplicate:', {
    success: resDuplicate.success,
    status: resDuplicate.status,
    duplicateSkipped: resDuplicate.status === 'skipped_duplicate' || resDuplicate.duplicateSkipped,
  });

  console.log('\n✨ All ViaSocket multi-event automation tests finished successfully!');
}

runTests().catch(console.error);
