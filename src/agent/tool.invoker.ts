import { AgexError } from '../common/errors.js';

export type SideEffectClass = 'READ_ONLY' | 'REVERSIBLE_WRITE' | 'IRREVERSIBLE_WRITE' | 'PRIVILEGED_ACTION';

export interface ToolDefinition {
  id: string;
  name: string;
  side_effect: SideEffectClass;
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface ToolInvocationResult {
  tool_id: string;
  side_effect: SideEffectClass;
  status: 'SUCCESS' | 'FAILED';
  output?: unknown;
  error?: string;
  execution_time_ms: number;
}

export class ToolInvoker {
  private registry: Map<string, ToolDefinition> = new Map();

  public registerTool(tool: ToolDefinition): void {
    this.registry.set(tool.id, tool);
  }

  public async invokeTool(
    toolId: string,
    params: Record<string, unknown>,
    autonomyLevel: string
  ): Promise<ToolInvocationResult> {
    const tool = this.registry.get(toolId);
    if (!tool) {
      throw new AgexError({
        code: 'TOOL_NOT_FOUND',
        category: 'NOT_FOUND',
        message: `Tool ID ${toolId} not registered in tool invoker.`,
        request_id: 'tool_req',
      });
    }

    // Safety Gate: L0/L1 Agents cannot perform IRREVERSIBLE_WRITE or PRIVILEGED_ACTION without approval
    if (
      (autonomyLevel === 'L0' || autonomyLevel === 'L1') &&
      (tool.side_effect === 'IRREVERSIBLE_WRITE' || tool.side_effect === 'PRIVILEGED_ACTION')
    ) {
      throw new AgexError({
        code: 'AUTONOMY_LEVEL_EXCEEDED',
        category: 'POLICY',
        message: `Autonomy level ${autonomyLevel} cannot execute ${tool.side_effect} tool without explicit approval.`,
        request_id: 'tool_req',
      });
    }

    const startMs = Date.now();
    try {
      const output = await tool.handler(params);
      const durationMs = Date.now() - startMs;

      return {
        tool_id: toolId,
        side_effect: tool.side_effect,
        status: 'SUCCESS',
        output,
        execution_time_ms: durationMs,
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startMs;
      const errorMsg = err instanceof Error ? err.message : String(err);

      return {
        tool_id: toolId,
        side_effect: tool.side_effect,
        status: 'FAILED',
        error: errorMsg,
        execution_time_ms: durationMs,
      };
    }
  }
}
