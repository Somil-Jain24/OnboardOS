import { store } from '../../db/store';
import type { AdapterType, IntegrationAdapterAction } from '../../types';

export interface AdapterExecutionResult {
  success: boolean;
  externalId?: string;
  errorCode?: string;
  reason?: string;
  payload?: Record<string, any>;
}

export interface IntegrationAdapter {
  readonly adapterType: AdapterType;
  execute(taskId: string, payload: Record<string, any>, idempotencyKey: string): Promise<AdapterExecutionResult>;
  testConnection(): Promise<{ healthy: boolean; latencyMs: number }>;
}

export class IdempotencyLedger {
  public static getAction(idempotencyKey: string): IntegrationAdapterAction | undefined {
    return store.adapterActions.find((a) => a.idempotencyKey === idempotencyKey);
  }

  public static recordAction(action: IntegrationAdapterAction): void {
    const existingIdx = store.adapterActions.findIndex((a) => a.idempotencyKey === action.idempotencyKey);
    if (existingIdx !== -1) {
      store.adapterActions[existingIdx] = action;
    } else {
      store.adapterActions.unshift(action);
    }
  }
}
