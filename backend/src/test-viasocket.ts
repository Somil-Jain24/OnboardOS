import { dispatchNewEmployeeAutomation } from './services/viasocketAutomation';
import type { Employee } from './types';

async function testViaSocketLive() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ Live automation test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }
  console.log('🧪 Testing Configured ViaSocket Automation Dispatch...');

  const testEmployee: Employee = {
    id: `emp-test-${Date.now().toString(36)}`,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@onboardos.internal',
    roleId: 'role-backend-dev',
    roleTitle: 'Junior Backend Developer',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    teamId: 'team-payments',
    teamName: 'Payments Core',
    seniority: 'JUNIOR',
    location: 'Bengaluru, India',
    employmentType: 'FULL_TIME',
    managerName: 'Marcus Vance',
    status: 'INVITED',
    startDate: '2026-08-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('1️⃣ Sending first dispatch:');
  const result1 = await dispatchNewEmployeeAutomation(testEmployee);
  console.log('Result 1:', {
    success: result1.success,
    statusCode: result1.statusCode,
    response: result1.response,
    idempotencyKey: result1.idempotencyKey,
  });

  console.log('\n2️⃣ Testing Idempotency (Sending same dispatch again):');
  const result2 = await dispatchNewEmployeeAutomation(testEmployee);
  console.log('Result 2 (Should skip duplicate):', {
    success: result2.success,
    duplicateSkipped: result2.duplicateSkipped,
    response: result2.response,
  });

  console.log('\n✅ Live ViaSocket Automation Dispatch Test Completed!');
}

testViaSocketLive().catch(console.error);
