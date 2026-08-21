import type { ResourceMetadata, TenantContext } from '../common/types.js';
import { generateResourceId, getCurrentISOString } from '../common/utils.js';
import { AgexError } from '../common/errors.js';

export type ExecutionState =
  | 'CREATED'
  | 'VALIDATING'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING'
  | 'RETRYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMED_OUT'
  | 'TERMINATED';

export interface ExecutionRecord {
  id: string;
  tenant_id: string;
  target_resource_id: string;
  state: ExecutionState;
  attempt: number;
  created_at: string;
  updated_at: string;
  checkpoint_id?: string | null;
  result?: unknown;
}

export class DurableRuntimeEngine {
  private executionStore: Map<string, ExecutionRecord> = new Map();

  public createExecution(tenantContext: TenantContext, targetResourceId: string): ExecutionRecord {
    const id = generateResourceId('exe');
    const now = getCurrentISOString();

    const record: ExecutionRecord = {
      id,
      tenant_id: tenantContext.tenant_id,
      target_resource_id: targetResourceId,
      state: 'CREATED',
      attempt: 1,
      created_at: now,
      updated_at: now,
    };

    this.executionStore.set(id, record);
    return record;
  }

  public transitionState(id: string, newState: ExecutionState, result?: unknown): ExecutionRecord {
    const record = this.executionStore.get(id);
    if (!record) {
      throw new AgexError({
        code: 'EXECUTION_NOT_FOUND',
        category: 'NOT_FOUND',
        message: `Execution ID ${id} not found in Durable Store.`,
        request_id: 'rt_req',
      });
    }

    record.state = newState;
    record.updated_at = getCurrentISOString();
    if (result !== undefined) {
      record.result = result;
    }

    this.executionStore.set(id, record);
    return record;
  }

  public restoreCheckpoint(id: string, checkpointId: string): ExecutionRecord {
    const record = this.executionStore.get(id);
    if (!record) {
      throw new AgexError({
        code: 'EXECUTION_NOT_FOUND',
        category: 'NOT_FOUND',
        message: `Execution ID ${id} not found for checkpoint restore.`,
        request_id: 'rt_req',
      });
    }

    record.checkpoint_id = checkpointId;
    record.state = 'RUNNING';
    record.attempt += 1;
    record.updated_at = getCurrentISOString();

    this.executionStore.set(id, record);
    return record;
  }
}
