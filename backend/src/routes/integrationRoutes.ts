import { Router, Request, Response } from 'express';
import { store } from '../db/store';
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
