import type { DurableRuntimeEngine, ExecutionRecord } from '../runtime/runtime.engine.js';
import type { TenantContext } from '../common/types.js';
import { AgexError } from '../common/errors.js';

export type StepType =
  | 'AGENT'
  | 'MODEL'
  | 'PLUGIN'
  | 'FUNCTION'
  | 'CONDITION'
  | 'SWITCH'
  | 'PARALLEL'
  | 'JOIN'
  | 'LOOP'
  | 'WAIT'
  | 'APPROVAL'
  | 'END';

export interface WorkflowStepDefinition {
  id: string;
  type: StepType;
  name: string;
  input?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

export interface WorkflowEdgeDefinition {
  from: string;
  to: string;
  condition?: string | null;
}

export interface WorkflowDefinition {
  id: string;
  steps: WorkflowStepDefinition[];
  edges: WorkflowEdgeDefinition[];
}

export class WorkflowEngine {
  private runtimeEngine: DurableRuntimeEngine;

  constructor(runtimeEngine: DurableRuntimeEngine) {
    this.runtimeEngine = runtimeEngine;
  }

  public async executeWorkflow(
    tenantContext: TenantContext,
    workflow: WorkflowDefinition,
    initialInput: Record<string, unknown>
  ): Promise<{ execution: ExecutionRecord; step_results: Record<string, unknown> }> {
    const execution = this.runtimeEngine.createExecution(tenantContext, workflow.id);
    this.runtimeEngine.transitionState(execution.id, 'RUNNING', undefined, tenantContext.tenant_id);

    const stepResults: Record<string, unknown> = {};
    let currentStepId: string | null = workflow.steps[0]?.id || null;

    while (currentStepId) {
      const step = workflow.steps.find(s => s.id === currentStepId);
      if (!step) break;

      if (step.type === 'END') {
        stepResults[step.id] = { status: 'COMPLETED' };
        break;
      }

      if (step.type === 'APPROVAL') {
        // Pause execution and set state to WAITING with reason APPROVAL
        this.runtimeEngine.transitionState(execution.id, 'WAITING', undefined, tenantContext.tenant_id);
        stepResults[step.id] = { status: 'WAITING_FOR_HUMAN_APPROVAL' };
        return { execution, step_results: stepResults };
      }

      // Simulate Step Execution
      stepResults[step.id] = { status: 'SUCCEEDED', output: `Processed ${step.name}` };

      // Find next step via edges
      const edge = workflow.edges.find(e => e.from === currentStepId);
      currentStepId = edge ? edge.to : null;
    }

    this.runtimeEngine.transitionState(execution.id, 'COMPLETED', stepResults, tenantContext.tenant_id);
    return { execution, step_results: stepResults };
  }
}
