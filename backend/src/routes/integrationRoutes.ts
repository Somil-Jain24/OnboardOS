import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { jiraAdapter, googleAdapter, slackAdapter, githubAdapter, awsAdapter } from '../services/integrations';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

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

router.get('/ledger', requireAuth, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.adapterActions,
  });
});

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

router.post('/reset-demo', requireAuth, (_req: Request, res: Response) => {
  store.seed();
  jiraAdapter.setFailureState(false);
  res.json({
    success: true,
    message: 'Demo state successfully reset to clean canonical seed data.',
  });
});

export default router;
