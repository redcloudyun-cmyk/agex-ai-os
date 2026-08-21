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
