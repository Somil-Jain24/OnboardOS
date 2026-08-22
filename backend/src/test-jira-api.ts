import { env } from './config/env';

async function testJiraApi() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ Jira API test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }

  const host = 'https://onboardos.atlassian.net';
  const email = 'yashjhanwar@gmail.com';
  const token = env.JIRA_API_TOKEN;

  if (!token) {
    console.log('⚠️ JIRA_API_TOKEN is not configured.');
    return;
  }

  console.log('🧪 Testing Live Jira Cloud API for https://onboardos.atlassian.net...\n');

  const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');

  try {
    const res = await fetch(`${host}/rest/api/3/myself`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    const data: any = await res.json();
    console.log('📡 Jira API /myself response:');
    if (data && data.accountId) {
      console.log('✅ Real Jira Cloud API Connection Verified!');
      console.log(`👤 Display Name: ${data.displayName}`);
      console.log(`📧 Email: ${data.emailAddress || email}`);
      console.log(`🆔 Account ID: ${data.accountId}`);
      console.log(`🌍 Time Zone: ${data.timeZone}`);
      console.log(`⚡ Active: ${data.active}`);

      // List projects
      const projRes = await fetch(`${host}/rest/api/3/project`, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });
      const projects: any = await projRes.json();
      if (Array.isArray(projects)) {
        console.log(`\n📋 Found ${projects.length} Jira Projects:`);
        projects.forEach((p: any) => {
          console.log(` - [${p.key}] ${p.name} (ID: ${p.id})`);
        });
      }
    } else {
      console.warn('⚠️ Jira API responded with:', data);
    }
  } catch (err: any) {
    console.error('❌ Jira API Connection Error:', err.message);
  }
}

testJiraApi();
