import { IntegrationAdapter, AdapterExecutionResult, IdempotencyLedger } from './adapterInterface';
import type { AdapterType } from '../../types';

export class GoogleWorkspaceAdapter implements IntegrationAdapter {
  public readonly adapterType: AdapterType = 'GOOGLE';

  public async execute(
    taskId: string,
    payload: Record<string, any>,
    idempotencyKey: string
  ): Promise<AdapterExecutionResult> {
    const existing = IdempotencyLedger.getAction(idempotencyKey);
    if (existing) {
      return {
        success: existing.success,
        externalId: existing.externalId,
        errorCode: existing.errorCode,
        reason: existing.reason,
      };
    }

    const email = payload.email || 'user@onboardos.internal';
    const externalId = `gw-usr-${Math.random().toString(36).substring(2, 9)}`;

    const result: AdapterExecutionResult = {
      success: true,
      externalId,
      reason: `Provisioned Google Workspace account ${email} with 2FA requirement.`,
      payload: { email, externalId, groups: ['all-company@onboardos.internal'] },
    };

    IdempotencyLedger.recordAction({
      id: `act-${Date.now()}`,
      taskId,
      adapterType: this.adapterType,
      operation: 'CREATE_USER',
      idempotencyKey,
      success: result.success,
      externalId: result.externalId,
      reason: result.reason,
      requestedAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
      payload: result.payload,
    });

    return result;
  }

  public async testConnection(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: true, latencyMs: 42 };
  }
}

export class SlackAdapter implements IntegrationAdapter {
  public readonly adapterType: AdapterType = 'SLACK';

  public async execute(
    taskId: string,
    payload: Record<string, any>,
    idempotencyKey: string
  ): Promise<AdapterExecutionResult> {
    const existing = IdempotencyLedger.getAction(idempotencyKey);
    if (existing) {
      return {
        success: existing.success,
        externalId: existing.externalId,
        errorCode: existing.errorCode,
        reason: existing.reason,
      };
    }

    const externalId = `U${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const result: AdapterExecutionResult = {
      success: true,
      externalId,
      reason: 'Enrolled employee in default channels: #announcements, #general, and department channel.',
      payload: { externalId, channels: ['C01GENERAL', 'C02ANNOUNCE', 'C03DEPT'] },
    };

    IdempotencyLedger.recordAction({
      id: `act-${Date.now()}`,
      taskId,
      adapterType: this.adapterType,
      operation: 'JOIN_WORKSPACE',
      idempotencyKey,
      success: result.success,
      externalId: result.externalId,
      reason: result.reason,
      requestedAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
      payload: result.payload,
    });

    return result;
  }

  public async testConnection(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: true, latencyMs: 65 };
  }
}

export class GitHubAdapter implements IntegrationAdapter {
  public readonly adapterType: AdapterType = 'GITHUB';

  public async execute(
    taskId: string,
    payload: Record<string, any>,
    idempotencyKey: string
  ): Promise<AdapterExecutionResult> {
    const existing = IdempotencyLedger.getAction(idempotencyKey);
    if (existing) {
      return {
        success: existing.success,
        externalId: existing.externalId,
        errorCode: existing.errorCode,
        reason: existing.reason,
      };
    }

    const externalId = `gh-inv-${Math.random().toString(36).substring(2, 9)}`;

    const result: AdapterExecutionResult = {
      success: true,
      externalId,
      reason: 'Sent organization invitation and added user to core engineering repository team.',
      payload: { externalId, role: 'contributor', team: 'engineering' },
    };

    IdempotencyLedger.recordAction({
      id: `act-${Date.now()}`,
      taskId,
      adapterType: this.adapterType,
      operation: 'ORG_INVITE',
      idempotencyKey,
      success: result.success,
      externalId: result.externalId,
      reason: result.reason,
      requestedAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
      payload: result.payload,
    });

    return result;
  }

  public async testConnection(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: true, latencyMs: 88 };
  }
}

export class JiraAdapter implements IntegrationAdapter {
  public readonly adapterType: AdapterType = 'JIRA';
  private shouldFail = false;

  public setFailureState(fail: boolean): void {
    this.shouldFail = fail;
  }

  public async execute(
    taskId: string,
    payload: Record<string, any>,
    idempotencyKey: string
  ): Promise<AdapterExecutionResult> {
    const existing = IdempotencyLedger.getAction(idempotencyKey);
    if (existing && !this.shouldFail) {
      return {
        success: existing.success,
        externalId: existing.externalId,
        errorCode: existing.errorCode,
        reason: existing.reason,
      };
    }

    if (this.shouldFail) {
      const result: AdapterExecutionResult = {
        success: false,
        errorCode: 'HTTP_503_RATE_LIMIT',
        reason: 'Jira Software API rate limit exceeded (HTTP 503 Service Unavailable).',
      };

      IdempotencyLedger.recordAction({
        id: `act-${Date.now()}`,
        taskId,
        adapterType: this.adapterType,
        operation: 'ASSIGN_PROJECT_ROLE',
        idempotencyKey,
        success: false,
        errorCode: result.errorCode,
        reason: result.reason,
        requestedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      });

      return result;
    }

    const externalId = `jira-usr-${Math.random().toString(36).substring(2, 9)}`;
    const result: AdapterExecutionResult = {
      success: true,
      externalId,
      reason: 'Assigned Jira Software project permissions for active sprint board.',
      payload: { externalId, projectRole: 'Developer' },
    };

    IdempotencyLedger.recordAction({
      id: `act-${Date.now()}`,
      taskId,
      adapterType: this.adapterType,
      operation: 'ASSIGN_PROJECT_ROLE',
      idempotencyKey,
      success: true,
      externalId,
      reason: result.reason,
      requestedAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
      payload: result.payload,
    });

    return result;
  }

  public async testConnection(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: !this.shouldFail, latencyMs: this.shouldFail ? 999 : 54 };
  }
}

export class AwsAdapter implements IntegrationAdapter {
  public readonly adapterType: AdapterType = 'AWS';

  public async execute(
    taskId: string,
    payload: Record<string, any>,
    idempotencyKey: string
  ): Promise<AdapterExecutionResult> {
    const externalId = `arn:aws:iam::123456789012:role/PaymentsDevRole`;

    const result: AdapterExecutionResult = {
      success: true,
      externalId,
      reason: 'Assigned AWS Staging IAM Role after verified Manager approval.',
      payload: { roleArn: externalId, sessionDuration: 3600 },
    };

    IdempotencyLedger.recordAction({
      id: `act-${Date.now()}`,
      taskId,
      adapterType: this.adapterType,
      operation: 'ASSUME_ROLE_POLICY',
      idempotencyKey,
      success: true,
      externalId,
      reason: result.reason,
      requestedAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
      payload: result.payload,
    });

    return result;
  }

  public async testConnection(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: true, latencyMs: 72 };
  }
}

export const googleAdapter = new GoogleWorkspaceAdapter();
export const slackAdapter = new SlackAdapter();
export const githubAdapter = new GitHubAdapter();
export const jiraAdapter = new JiraAdapter();
export const awsAdapter = new AwsAdapter();
