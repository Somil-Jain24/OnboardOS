async function testSuite() {
  console.log('🧪 Starting OnboardOS Phase 2-5 Backend Verification Test Suite...\n');

  let passed = 0;
  let failed = 0;

  async function assertReq(name, url, options = {}) {
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      if (res.ok && (json.success || json.status === 'healthy')) {
        console.log(`✅ [PASS] ${name}`);
        passed++;
        return json;
      } else {
        console.error(`❌ [FAIL] ${name}:`, json);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${name}:`, err.message);
      failed++;
    }
  }

  // Phase 2: Auth, RBAC & Employee CRUD
  await assertReq('Phase 2.1: Health Check', 'http://localhost:3001/health');
  
  const authRes = await assertReq('Phase 2.2: Login as HR', 'http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'HR' }),
  });
  const token = authRes?.token;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  await assertReq('Phase 2.3: Get Current User (/me)', 'http://localhost:3001/api/auth/me', {
    headers: authHeaders,
  });

  await assertReq('Phase 2.4: List Canonical Employees', 'http://localhost:3001/api/employees', {
    headers: authHeaders,
  });

  const newEmpRes = await assertReq('Phase 2.5: Create New Employee (CRUD)', 'http://localhost:3001/api/employees', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Vikram Sethi',
      email: 'vikram.sethi@onboardos.internal',
      roleTitle: 'Senior Cloud Architect',
      departmentName: 'Engineering',
      teamName: 'Infrastructure Platform',
      seniority: 'SENIOR',
      location: 'Bengaluru, India',
      employmentType: 'FULL_TIME',
      startDate: '2026-09-15T09:00:00Z',
    }),
  });

  // Phase 3: Intelligence & Policy Engine
  await assertReq('Phase 3.1: List Requirement Rules Catalog', 'http://localhost:3001/api/policies/rules', {
    headers: authHeaders,
  });

  await assertReq('Phase 3.2: Evaluate Birthright Policies', 'http://localhost:3001/api/policies/evaluate-birthright', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      roleTitle: 'Junior Backend Developer',
      department: 'Engineering',
      seniority: 'JUNIOR',
      employmentType: 'FULL_TIME',
    }),
  });

  await assertReq('Phase 3.3: Separation of Duties (SoD) Conflict Check', 'http://localhost:3001/api/policies/check-sod', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      entitlements: ['Banking Gateway: Create Batch', 'Banking Gateway: Release Funds'],
    }),
  });

  await assertReq('Phase 3.4: Explainability Why Service (FR-WHY-01)', 'http://localhost:3001/api/plans/why/task-1', {
    headers: authHeaders,
  });

  // Phase 4: Orchestration & DAG
  await assertReq('Phase 4.1: List Task Execution DAG', 'http://localhost:3001/api/tasks', {
    headers: authHeaders,
  });

  await assertReq('Phase 4.2: Retry Failed Task (task-4 Jira rate limit)', 'http://localhost:3001/api/tasks/task-4/retry', {
    method: 'POST',
    headers: authHeaders,
  });

  // Phase 5: Integrations & Adapters
  await assertReq('Phase 5.1: Adapter Health & Latency Telemetry', 'http://localhost:3001/api/integrations/health');

  await assertReq('Phase 5.2: Idempotency Ledger Actions', 'http://localhost:3001/api/integrations/ledger', {
    headers: authHeaders,
  });

  await assertReq('Phase 5.3: Scriptable Failure Injection (Jira)', 'http://localhost:3001/api/integrations/inject-failure', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ adapterType: 'JIRA', enable: false }),
  });

  await assertReq('Phase 5.4: Execute Task Provisioning via Adapter (task-1 Google)', 'http://localhost:3001/api/tasks/task-1/execute', {
    method: 'POST',
    headers: authHeaders,
  });

  console.log(`\n========================================`);
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

testSuite();
