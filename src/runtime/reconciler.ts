import type { TaskDispatcher, TaskRecord } from './task.dispatcher.js';
import type { DurableRuntimeEngine } from './runtime.engine.js';

export class RuntimeReconciler {
  private dispatcher: TaskDispatcher;
  private engine: DurableRuntimeEngine;

  constructor(dispatcher: TaskDispatcher, engine: DurableRuntimeEngine) {
    this.dispatcher = dispatcher;
    this.engine = engine;
  }

  public reconcileExpiredTasks(): TaskRecord[] {
    const expiredTasks = this.dispatcher.getExpiredLeases();
    const redispatched: TaskRecord[] = [];

    for (const task of expiredTasks) {
      // 1. Reset Task status to QUEUED for redispatch
      task.status = 'QUEUED';
      task.lease_owner = null;
      task.lease_expires_at = null;
      task.updated_at = new Date().toISOString();

      // 2. Restore Execution state and increment attempt
      this.engine.restoreCheckpoint(task.execution_id, `chk_recovery_${Date.now()}`);

      redispatched.push(task);
    }

    return redispatched;
  }
}
