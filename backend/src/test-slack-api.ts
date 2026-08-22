import { env } from './config/env';

async function testSlackApi() {
  console.log('🧪 Testing Live Slack API with provided access token...\n');

  const token = env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error('❌ No SLACK_BOT_TOKEN configured');
    return;
  }

  try {
    const authRes = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const authData: any = await authRes.json();
    console.log('📡 Slack auth.test response:', authData);

    if (authData.ok) {
      console.log('✅ Real Slack API Connection Verified!');
      console.log(`🏢 Workspace: ${authData.team} (${authData.team_id})`);
      console.log(`👤 User: ${authData.user} (${authData.user_id})`);
      console.log(`🔗 URL: ${authData.url}`);

      // List public channels
      const channelsRes = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const channelsData: any = await channelsRes.json();
      if (channelsData.ok && channelsData.channels) {
        console.log(`\n📋 Found ${channelsData.channels.length} channels:`);
        channelsData.channels.forEach((ch: any) => {
          console.log(` - #${ch.name} (ID: ${ch.id})`);
        });
      } else {
        console.log('ℹ️ Channel list response:', channelsData);
      }
    } else {
      console.warn('⚠️ Slack API responded with error:', authData.error);
    }
  } catch (err: any) {
    console.error('❌ Failed to connect to Slack API:', err.message);
  }
}

testSlackApi();
