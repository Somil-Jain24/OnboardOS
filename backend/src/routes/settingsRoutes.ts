import { Router, Request, Response } from 'express';
import { store } from '../db/store';

const router = Router();

// GET /api/settings/integrations
router.get('/integrations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store.integrationSettings,
  });
});

// POST /api/settings/integrations
router.post('/integrations', (req: Request, res: Response) => {
  const { slackInviteUrl, githubRepoUrl, jiraBoardUrl, webmailUrl, figmaWorkspaceUrl, companyWikiUrl } = req.body;

  if (slackInviteUrl !== undefined) store.integrationSettings.slackInviteUrl = slackInviteUrl;
  if (githubRepoUrl !== undefined) store.integrationSettings.githubRepoUrl = githubRepoUrl;
  if (jiraBoardUrl !== undefined) store.integrationSettings.jiraBoardUrl = jiraBoardUrl;
  if (webmailUrl !== undefined) store.integrationSettings.webmailUrl = webmailUrl;
  if (figmaWorkspaceUrl !== undefined) store.integrationSettings.figmaWorkspaceUrl = figmaWorkspaceUrl;
  if (companyWikiUrl !== undefined) store.integrationSettings.companyWikiUrl = companyWikiUrl;

  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorRole: 'HR',
    action: 'INTEGRATION_SETTINGS_UPDATED',
    entityType: 'SystemSettings',
    entityId: 'global-integrations',
    reason: 'HR Administrator updated enterprise tool workspace links.',
    result: 'SUCCESS',
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Integration workspace links updated successfully.',
    data: store.integrationSettings,
  });
});

export default router;
