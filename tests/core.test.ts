import { test } from 'node:test';
import assert from 'node:assert';
import { generateResourceId } from '../src/common/utils.js';
import { PolicyDecisionPoint } from '../src/identity/pdp.js';
import { ModelRouter, type ModelCandidate } from '../src/model-gateway/model-router.js';
import { DurableRuntimeEngine } from '../src/runtime/runtime.engine.js';

test('1. Resource ID Generation & Prefix Validation', () => {
  const agentId = generateResourceId('agt');
  assert.ok(agentId.startsWith('agt_'));

  const tenantId = generateResourceId('ten');
  assert.ok(tenantId.startsWith('ten_'));
});

test('2. Policy Decision Point (PDP) Authorization Evaluation', () => {
  const pdp = new PolicyDecisionPoint();

  // Test 2a. Allowed Action
  const allowDecision = pdp.evaluate({
    principal: { type: 'user', id: 'usr_123' },
    tenant_context: { tenant_id: 'ten_001', scope_type: 'TENANT' },
    action: 'agent:execute',
    resource_type: 'Agent',
    resource_id: 'agt_999',
    resource_tenant_id: 'ten_001',
    principal_permissions: ['agent:execute'],
  });
  assert.strictEqual(allowDecision.decision, 'ALLOW');

  // Test 2b. Cross-Tenant Default Deny
  const crossTenantDecision = pdp.evaluate({
    principal: { type: 'user', id: 'usr_123' },
    tenant_context: { tenant_id: 'ten_001', scope_type: 'TENANT' },
    action: 'agent:read',
    resource_type: 'Agent',
    resource_id: 'agt_999',
    resource_tenant_id: 'ten_002', // Different Tenant!
    principal_permissions: ['agent:read'],
  });
  assert.strictEqual(crossTenantDecision.decision, 'DENY');
  assert.strictEqual(crossTenantDecision.reason_code, 'CROSS_TENANT_ACCESS_DENIED');

  // Test 2c. High-Risk Action Approval Requirement
  const conditionalDecision = pdp.evaluate({
    principal: { type: 'user', id: 'usr_123' },
    tenant_context: { tenant_id: 'ten_001', scope_type: 'TENANT' },
    action: 'agent:publish',
    resource_type: 'Agent',
    resource_id: 'agt_999',
    resource_tenant_id: 'ten_001',
    principal_permissions: ['agent:publish'],
  });
  assert.strictEqual(conditionalDecision.decision, 'CONDITIONAL');
  assert.strictEqual(conditionalDecision.reason_code, 'REQUIRE_APPROVAL');

  // Test 2d. CRITICAL-risk actions (per specs/permissions/core.permissions.yaml)
  // require approval even though they don't match either hardcoded verb.
  const criticalDecision = pdp.evaluate({
    principal: { type: 'user', id: 'usr_123' },
    tenant_context: { tenant_id: 'ten_001', scope_type: 'TENANT' },
    action: 'secret:manage',
    resource_type: 'Secret',
    resource_id: 'sec_999',
    principal_permissions: ['secret:manage'],
  });
  assert.strictEqual(criticalDecision.decision, 'CONDITIONAL');
  assert.strictEqual(criticalDecision.reason_code, 'REQUIRE_APPROVAL');

  // Test 2e. HIGH-risk (but not CRITICAL) actions stay ALLOW — the console's
  // core task-execution flow depends on agent:execute never being gated.
  const highRiskDecision = pdp.evaluate({
    principal: { type: 'user', id: 'usr_123' },
    tenant_context: { tenant_id: 'ten_001', scope_type: 'TENANT' },
    action: 'tenant:create',
    resource_type: 'Tenant',
    resource_id: 'ten_new',
    principal_permissions: ['tenant:create'],
  });
  assert.strictEqual(highRiskDecision.decision, 'ALLOW');
});

test('3. Model Router Security-First Selection Order', () => {
  const candidates: ModelCandidate[] = [
    {
      model_id: 'gpt-4o',
      provider_id: 'prv_openai',
      provider_class: 'DIRECT_APPROVED',
      capabilities: ['TOOL_CALLING', 'STRUCTURED_OUTPUT'],
      supported_classifications: ['PUBLIC', 'INTERNAL'],
      region: ['us-central1'],
      latency_ms: 300,
      healthy: true,
      cost_per_1k_tokens: 0.015,
    },
    {
      model_id: 'claude-3-5-sonnet',
      provider_id: 'prv_anthropic',
      provider_class: 'ENTERPRISE_APPROVED',
      capabilities: ['TOOL_CALLING', 'STRUCTURED_OUTPUT'],
      supported_classifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
      region: ['us-east1'],
      latency_ms: 250,
      healthy: true,
      cost_per_1k_tokens: 0.02,
    },
  ];

  const router = new ModelRouter(candidates);

  // Request requiring CONFIDENTIAL classification
  const selected = router.selectModel({
    required_capabilities: ['TOOL_CALLING'],
    data_classification: 'CONFIDENTIAL',
  });

  assert.strictEqual(selected.model_id, 'claude-3-5-sonnet');

  // Region/Residency must be a hard constraint (S-04 §2 step 5), not a soft
  // preference that silently falls back to ignoring it.
  assert.throws(
    () => router.selectModel({
      required_capabilities: ['TOOL_CALLING'],
      data_classification: 'PUBLIC',
      target_region: 'eu-west1',
    }),
    (err: any) => err.code === 'REGION_CONSTRAINT_VIOLATED'
  );

  // Provider Trust Class (S-04 §2 step 6) must outrank latency/cost among
  // otherwise-tied candidates.
  const trustCandidates: ModelCandidate[] = [
    {
      model_id: 'aggregator-fast-cheap',
      provider_id: 'prv_aggregator',
      provider_class: 'AGGREGATOR',
      capabilities: ['TOOL_CALLING'],
      supported_classifications: ['PUBLIC'],
      region: ['us-central1'],
      latency_ms: 50,
      healthy: true,
      cost_per_1k_tokens: 0.001,
    },
    {
      model_id: 'private-slower-pricier',
      provider_id: 'prv_private',
      provider_class: 'PRIVATE',
      capabilities: ['TOOL_CALLING'],
      supported_classifications: ['PUBLIC'],
      region: ['us-central1'],
      latency_ms: 500,
      healthy: true,
      cost_per_1k_tokens: 0.05,
    },
  ];
  const trustRouter = new ModelRouter(trustCandidates);
  const trustSelected = trustRouter.selectModel({
    required_capabilities: ['TOOL_CALLING'],
    data_classification: 'PUBLIC',
  });
  assert.strictEqual(trustSelected.model_id, 'private-slower-pricier');
});

test('4. Durable Runtime Engine Execution & Checkpoint Restore', () => {
  const engine = new DurableRuntimeEngine();
  const tenantContext = { tenant_id: 'ten_001', scope_type: 'TENANT' as const };

  const exe = engine.createExecution(tenantContext, 'agt_123');
  assert.strictEqual(exe.state, 'CREATED');

  const running = engine.transitionState(exe.id, 'RUNNING');
  assert.strictEqual(running.state, 'RUNNING');

  const restored = engine.restoreCheckpoint(exe.id, 'chk_001');
  assert.strictEqual(restored.checkpoint_id, 'chk_001');
  assert.strictEqual(restored.attempt, 2);
});

test('5. Durable Runtime: Bounded Retry, Terminal State Guard & Tenant Ownership', () => {
  const engine = new DurableRuntimeEngine();
  const tenantContext = { tenant_id: 'ten_001', scope_type: 'TENANT' as const };

  // 5a. Bounded retry: restoreCheckpoint must eventually refuse and fail the execution
  const exe = engine.createExecution(tenantContext, 'agt_retry_test');
  for (let i = 0; i < 4; i++) {
    engine.restoreCheckpoint(exe.id, `chk_${i}`);
  }
  assert.throws(
    () => engine.restoreCheckpoint(exe.id, 'chk_final'),
    (err: any) => err.code === 'MAX_RETRY_ATTEMPTS_EXCEEDED'
  );

  // 5b. Terminal state guard: a FAILED execution cannot be mutated further
  assert.throws(
    () => engine.transitionState(exe.id, 'RUNNING'),
    (err: any) => err.code === 'EXECUTION_ALREADY_TERMINAL'
  );

  // 5c. Cross-tenant ownership check on state mutation
  const exe2 = engine.createExecution(tenantContext, 'agt_owner_test');
  assert.throws(
    () => engine.transitionState(exe2.id, 'RUNNING', undefined, 'ten_other'),
    (err: any) => err.code === 'CROSS_TENANT_ACCESS_DENIED'
  );

  // Same-tenant caller is still permitted
  const running = engine.transitionState(exe2.id, 'RUNNING', undefined, tenantContext.tenant_id);
  assert.strictEqual(running.state, 'RUNNING');
});
