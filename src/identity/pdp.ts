import type { PrincipalReference, TenantContext } from '../common/types.js';

export interface AuthorizationRequest {
  principal: PrincipalReference;
  tenant_context: TenantContext;
  action: string; // 예: agent:execute, plugin:install
  resource_type: string;
  resource_id: string;
  resource_tenant_id?: string | null;
  principal_permissions: string[];
  context?: Record<string, unknown>;
}

export type AuthorizationDecisionResult = 'ALLOW' | 'DENY' | 'CONDITIONAL';

export interface AuthorizationDecision {
  decision: AuthorizationDecisionResult;
  reason_code: string;
  policy_ids?: string[];
  obligations?: string[];
}

export class PolicyDecisionPoint {
  public evaluate(request: AuthorizationRequest): AuthorizationDecision {
    // 1. Cross-Tenant Check (Default Deny)
    if (
      request.resource_tenant_id &&
      request.resource_tenant_id !== request.tenant_context.tenant_id
    ) {
      return {
        decision: 'DENY',
        reason_code: 'CROSS_TENANT_ACCESS_DENIED',
      };
    }

    // 2. Permission Check
    const hasPermission =
      request.principal_permissions.includes(request.action) ||
      request.principal_permissions.includes('*');

    if (!hasPermission) {
      return {
        decision: 'DENY',
        reason_code: 'PERMISSION_MISSING',
      };
    }

    // 3. Risk / Obligation Check (Example L2 Approval Rule)
    if (request.action.endsWith(':delete') || request.action === 'agent:publish') {
      return {
        decision: 'CONDITIONAL',
        reason_code: 'REQUIRE_APPROVAL',
        obligations: ['APPROVAL_REQUIRED'],
      };
    }

    return {
      decision: 'ALLOW',
      reason_code: 'PERMITTED_BY_POLICY',
    };
  }
}
