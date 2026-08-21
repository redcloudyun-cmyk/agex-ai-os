import type { TenantContext, PrincipalReference } from '../common/types.js';
import type { PolicyDecisionPoint } from '../identity/pdp.js';
import type { ToolInvoker, ToolInvocationResult } from './tool.invoker.js';
import { AgexError } from '../common/errors.js';

export interface AgentExecutionConfig {
  agent_id: string;
  autonomy_level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  permissions: string[];
}

export class AgentExecutor {
  private pdp: PolicyDecisionPoint;
  private invoker: ToolInvoker;

  constructor(pdp: PolicyDecisionPoint, invoker: ToolInvoker) {
    this.pdp = pdp;
    this.invoker = invoker;
  }

  public async executeToolAction(
    principal: PrincipalReference,
    tenantContext: TenantContext,
    agentConfig: AgentExecutionConfig,
    toolId: string,
    toolParams: Record<string, unknown>
  ): Promise<ToolInvocationResult> {
    // 1. Authorize Execution Request via PDP
    const authDecision = this.pdp.evaluate({
      principal,
      tenant_context: tenantContext,
      action: 'agent:execute',
      resource_type: 'Agent',
      resource_id: agentConfig.agent_id,
      resource_tenant_id: tenantContext.tenant_id,
      principal_permissions: agentConfig.permissions,
    });

    if (authDecision.decision === 'DENY') {
      throw new AgexError({
        code: 'EXECUTION_DENIED',
        category: 'AUTHORIZATION',
        message: `Agent execution denied by PDP: ${authDecision.reason_code}`,
        request_id: 'exe_req',
      });
    }

    // 2. Execute Tool via ToolInvoker with Autonomy Check
    return await this.invoker.invokeTool(toolId, toolParams, agentConfig.autonomy_level);
  }
}
