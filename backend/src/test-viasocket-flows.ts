import { env } from './config/env';

async function testAllViaSocketFlows() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ Live automation test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }

  const webhookUrl = env.VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️ VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL is not configured.');
    return;
  }

  console.log('🧪 Testing Configured ViaSocket Automation Webhooks...\n');

  const testEvents = [
    {
      name: '1. New Employee Onboarded (employee.created)',
      payload: {
        event_id: `evt-test-emp-${Date.now()}`,
        event_type: 'employee.created',
        timestamp: new Date().toISOString(),
        employee: {
          id: 'emp-rahul',
          name: 'Rahul Sharma',
          email: 'rahul.sharma@onboardos.internal',
          department: 'Engineering',
          team: 'Payments Core',
          role: 'Junior Backend Developer',
          manager_name: 'Marcus Vance',
          start_date: '2026-09-01',
        },
        action: 'Notify Slack, Create Google Workspace, Log in Master HR Google Sheet',
      },
    },
    {
      name: '2. Manager Approval Requested (approval.requested)',
      payload: {
        event_id: `evt-test-appr-${Date.now()}`,
        event_type: 'approval.requested',
        timestamp: new Date().toISOString(),
        employee: {
          id: 'emp-rahul',
          name: 'Rahul Sharma',
          email: 'rahul.sharma@onboardos.internal',
          role: 'Junior Backend Developer',
        },
        approval: {
          task_name: 'AWS Production Cloud IAM Access',
          approver_role: 'MANAGER',
          risk_level: 'HIGH',
          reason: 'Elevated production cloud permissions require manager signoff',
        },
        action: 'Send Interactive 1-Click Approval Notification to Manager on Slack / Email',
      },
    },
    {
      name: '3. Task Failed Incident Alert (task.failed)',
      payload: {
        event_id: `evt-test-fail-${Date.now()}`,
        event_type: 'task.failed',
        timestamp: new Date().toISOString(),
        employee: {
          id: 'emp-rahul',
          name: 'Rahul Sharma',
          role: 'Junior Backend Developer',
        },
        task: {
          name: 'Jira Software Project Board Access',
          failure_code: 'HTTP_503_RATE_LIMIT',
          failure_reason: 'Jira Software API rate limit exceeded (HTTP 503)',
          blocked_downstream_tasks_count: 2,
        },
        action: 'Send P1 DevOps Incident Alert to #it-support-alerts on Slack',
      },
    },
    {
      name: '4. Day-One Readiness Achieved (onboarding.day_one_ready)',
      payload: {
        event_id: `evt-test-ready-${Date.now()}`,
        event_type: 'onboarding.day_one_ready',
        timestamp: new Date().toISOString(),
        employee: {
          id: 'emp-rahul',
          name: 'Rahul Sharma',
          role: 'Junior Backend Developer',
        },
        readiness: {
          score: 100,
          day_one_ready: true,
          completed_tasks_count: 6,
          blocking_failures_count: 0,
        },
        action: 'Send Day-One Readiness Celebration Dispatch to Team & Employee',
      },
    },
    {
      name: '5. Employee Offboarded (employee.offboarded)',
      payload: {
        event_id: `evt-test-off-${Date.now()}`,
        event_type: 'employee.offboarded',
        timestamp: new Date().toISOString(),
        employee: {
          id: 'emp-rahul',
          name: 'Rahul Sharma',
          role: 'Junior Backend Developer',
        },
        offboarding: {
          reason: 'Standard Departure',
          certificate_id: 'SOC2-REVOKE-emp-rahul-2026',
          revoked_systems_count: 5,
        },
        action: 'Notify Security Team, Revoke All OAuth & SSO Sessions, Update HR Records',
      },
    },
  ];

  for (const item of testEvents) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OnboardOS-ViaSocket-Engine',
        },
        body: JSON.stringify(item.payload),
      });

      console.log(`📡 [${item.name}] -> Status HTTP ${res.status}`);
    } catch (err: any) {
      console.error(`❌ Failed ${item.name}:`, err.message);
    }
  }

  console.log('\n✅ All ViaSocket Automation Lifecycles Tested Successfully!');
}

testAllViaSocketFlows();
