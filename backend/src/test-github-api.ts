import { env } from './config/env';

async function testGithubApi() {
  if (process.env.ALLOW_LIVE_AUTOMATION_TEST !== 'true') {
    console.log('ℹ️ GitHub API test skipped. Set ALLOW_LIVE_AUTOMATION_TEST=true to execute live tests.');
    return;
  }

  const token = env.GITHUB_TOKEN;
  if (!token) {
    console.log('⚠️ GITHUB_TOKEN is not configured.');
    return;
  }
  console.log('🧪 Testing Live GitHub API with configured token...\n');

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'OnboardOS-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const user: any = await res.json();
    console.log('📡 GitHub User API response:');
    console.log(`👤 Username: ${user.login}`);
    console.log(`📛 Name: ${user.name}`);
    console.log(`🏢 Company: ${user.company || 'N/A'}`);
    console.log(`🔗 Profile URL: ${user.html_url}`);
    console.log(`📦 Public Repos: ${user.public_repos}`);

    // Check user's repositories
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=5', {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'OnboardOS-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const repos: any = await reposRes.json();
    if (Array.isArray(repos)) {
      console.log(`\n📋 Found ${repos.length} repositories in this account:`);
      repos.forEach((r: any) => {
        console.log(` - ${r.full_name} (${r.private ? 'Private' : 'Public'}) -> ${r.html_url}`);
      });
    }
  } catch (err: any) {
    console.error('❌ GitHub API connection error:', err.message);
  }
}

testGithubApi();
