import { env } from './config/env';

async function sendOneTimeTestWebhook() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ Live automation test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }

  const webhookUrl = env.VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️ VIASOCKET_NEW_EMPLOYEE_WEBHOOK_URL is not configured.');
    return;
  }

  const payload = {
    event_id: 'test-aditi-jain-20260822-001',
    event_type: 'employee.created',
    org_id: 'demo-org',
    timestamp: '2026-08-22T12:00:00.000Z',
    idempotency_key: 'test-aditi-jain-20260822-001',
    employee: {
      id: 'demo-aditi-jain-001',
      name: 'Aditi Jain',
      email: 'aditi.jain@example.com',
      department: 'Engineering',
      team: 'Payments Core',
      role: 'Junior Backend Developer',
      manager_name: 'Marcus Vance',
      start_date: '2026-08-25',
    },
    employee_url: 'http://localhost:5173/employees/demo-aditi-jain-001',
  };

  console.log('🚀 Sending test POST request to configured ViaSocket webhook:');
  console.log('Payload Event ID:', payload.event_id);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OnboardOS-Test-Runner/1.0.0',
        'X-OnboardOS-Event': 'employee.created',
        'X-Idempotency-Key': payload.idempotency_key,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { status: response.status };
    }

    console.log('\n📥 Response Received:');
    console.log('HTTP Status:', response.status);
    console.log('Response Keys:', typeof parsed === 'object' ? Object.keys(parsed) : 'text');

    if (response.ok) {
      console.log('\n✅ ViaSocket Webhook executed successfully!');
    } else {
      console.error('\n❌ ViaSocket Webhook returned non-200 status');
    }
  } catch (err: any) {
    console.error('\n❌ Network or execution error:', err.message);
  }
}

sendOneTimeTestWebhook();

