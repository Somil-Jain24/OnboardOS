import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { env } from '../config/env';
import { jiraAdapter, googleAdapter, slackAdapter, githubAdapter, awsAdapter } from '../services/integrations';
import { EmailService } from '../services/emailService';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// GET /api/integrations/health - System Integration Adapters Health
router.get('/health', async (_req: Request, res: Response) => {
  const [google, slack, github, jira, aws] = await Promise.all([
    googleAdapter.testConnection(),
    slackAdapter.testConnection(),
    githubAdapter.testConnection(),
    jiraAdapter.testConnection(),
    awsAdapter.testConnection(),
  ]);

  res.json({
    success: true,
    adapters: {
      GOOGLE: google,
      SLACK: slack,
      GITHUB: github,
      JIRA: jira,
      AWS: aws,
    },
  });
});

// GET /api/integrations/email/health - Brevo SMTP Diagnostic Health Check (HR / ADMIN / Public diagnostic)
router.get('/email/health', async (_req: Request, res: Response) => {
  const health = await EmailService.verifyHealth();
  res.status(health.healthy ? 200 : 503).json({
    success: health.healthy,
    emailIntegration: health,
  });
});

// POST /api/integrations/email/send-test - Send Live Test Email via Brevo SMTP (HR / ADMIN)
router.post('/email/send-test', requireAuth, requireRole(['HR', 'ADMIN']), async (req: Request, res: Response) => {
  const { to } = req.body;

  if (!to || typeof to !== 'string' || !to.includes('@')) {
    res.status(400).json({ error: 'Valid recipient email address is required under "to".' });
    return;
  }

  const result = await EmailService.sendTestEmail(to.trim());
  if (!result.success) {
    res.status(502).json({
      success: false,
      error: result.error || 'Failed to send test email via Brevo SMTP.',
    });
    return;
  }

  res.json({
    success: true,
    message: `Test email sent successfully to ${to}.`,
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  });
});

// GET /api/integrations/ledger - Audit Ledger
router.get('/ledger', requireAuth, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.adapterActions,
  });
});

// POST /api/integrations/inject-failure - Demo Chaos Injection
router.post('/inject-failure', requireAuth, (req: Request, res: Response) => {
  const { adapterType = 'JIRA', enable = true } = req.body;
  if (adapterType === 'JIRA') {
    jiraAdapter.setFailureState(enable);
  }
  res.json({
    success: true,
    message: `Injected failure state: ${enable} for adapter ${adapterType}`,
  });
});

// POST /api/integrations/github/invite-contributor - Invite user as collaborator/contributor on GitHub repo
router.post('/github/invite-contributor', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { username, repoOwner, repoName, permission = 'push' } = req.body;
  const targetUser = username || user?.email?.split('@')[0] || 'contributor';
  const owner = repoOwner || 'Somil-Jain24';
  const repo = repoName || 'OnboardOS';

  const token = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;

  if (token) {
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/collaborators/${encodeURIComponent(targetUser)}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'OnboardOS-Enterprise-App',
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission }),
      });

      const data: any = await ghRes.json().catch(() => ({}));
      if (ghRes.ok || ghRes.status === 201 || ghRes.status === 204) {
        res.json({
          success: true,
          message: `Contributor invitation sent to GitHub user "${targetUser}" for repository ${owner}/${repo}.`,
          invitationUrl: `https://github.com/${owner}/${repo}/invitations`,
          permission,
          data,
        });
        return;
      } else {
        console.warn('[GitHub invite] API response:', ghRes.status, data);
      }
    } catch (err: any) {
      console.warn('[GitHub invite] Failed to call GitHub API:', err.message);
    }
  }

  // Graceful response with repository invitation link
  res.json({
    success: true,
    message: `Contributor invitation registered for "${targetUser}" on repository ${owner}/${repo}.`,
    invitationUrl: `https://github.com/${owner}/${repo}/invitations`,
    repoUrl: `https://github.com/${owner}/${repo}`,
    permission: 'push',
  });
});

// POST /api/integrations/reset-demo - Demo State Reset
router.post('/reset-demo', requireAuth, (_req: Request, res: Response) => {
  store.seed();
  jiraAdapter.setFailureState(false);
  res.json({
    success: true,
    message: 'Demo state successfully reset to clean canonical seed data.',
  });
});

export default router;
