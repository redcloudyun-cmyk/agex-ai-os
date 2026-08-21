import { test } from 'node:test';
import assert from 'node:assert';
import { AuditLogger } from '../src/governance/audit.logger.js';
import { BillingLedgerEngine } from '../src/billing/billing.ledger.js';
import { AgexPlatformApiServer } from '../src/server.js';
import { PolicyDecisionPoint } from '../src/identity/pdp.js';
import { DurableRuntimeEngine } from '../src/runtime/runtime.engine.js';

test('1. Audit Logger Sensitive Data Masking Rule', () => {
  const logger = new AuditLogger();

  logger.logEvent({
    actor: { type: 'user', id: 'usr_admin' },
    tenant_id: 'ten_001',
    action: 'secret:bind',
    resource: { type: 'Secret', id: 'sec_123' },
    result: 'SUCCESS',
    request_id: 'req_audit_test',
    details: {
      secret: 'super_secret_raw_key', // Should be deleted/sanitized
      password: 'my_password',       // Should be deleted/sanitized
      raw_cot: 'thinking_steps...',   // Should be deleted/sanitized
      safe_meta: 'bind_successful',
    },
  });

  const logs = logger.getAuditLogs('ten_001');
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].details?.['secret'], undefined);
  assert.strictEqual(logs[0].details?.['password'], undefined);
  assert.strictEqual(logs[0].details?.['raw_cot'], undefined);
  assert.strictEqual(logs[0].details?.['safe_meta'], 'bind_successful');
});

test('2. Billing Ledger Engine Idempotency & Adjustment', () => {
  const billing = new BillingLedgerEngine();

  // 2a. Record Usage with Idempotency Key
  const usage = billing.recordUsage({
    tenant_id: 'ten_001',
    execution_id: 'exe_001',
    usage_type: 'MODEL_INPUT_TOKEN',
    quantity: 1000,
    unit: 'TOKENS',
    idempotency_key: 'idem_unique_123',
  });

  assert.ok(usage.usage_id.startsWith('aud_'));

  // 2b. Duplicate Usage Record attempt -> Should throw Conflict Error
  assert.throws(
    () => {
      billing.recordUsage({
        tenant_id: 'ten_001',
        execution_id: 'exe_001',
        usage_type: 'MODEL_INPUT_TOKEN',
        quantity: 1000,
        unit: 'TOKENS',
        idempotency_key: 'idem_unique_123', // Duplicate!
      });
    },
    (err: any) => err.code === 'DUPLICATE_USAGE_RECORD'
  );

  // 2c. Immutable Posted Entry & Adjustment
  billing.postLedgerEntry('acc_001', 'CHARGE', '15.5000', 'USD', 'Invoice #1');
  billing.adjustLedger('acc_001', '-2.0000', 'USD', 'Correction for credit');

  const entries = billing.getLedgerEntries('acc_001');
  assert.strictEqual(entries.length, 2);
  assert.strictEqual(entries[0].entry_type, 'CHARGE');
  assert.strictEqual(entries[1].entry_type, 'ADJUSTMENT');
});

test('3. AGEX Platform API Server Endpoints & Security Interception', async () => {
  const pdp = new PolicyDecisionPoint();
  const runtime = new DurableRuntimeEngine();
  const logger = new AuditLogger();
  const billing = new BillingLedgerEngine();

  const server = new AgexPlatformApiServer(pdp, runtime, logger, billing);

  // 3a. Missing Tenant Header -> Should return 401 TENANT_CONTEXT_MISSING
  const resNoTenant = await server.handleRequest({
    path: '/api/v1/executions',
    method: 'POST',
    headers: {},
  });
  assert.strictEqual(resNoTenant.status, 401);

  // 3b. Successful Execution Request with Tenant Header
  const resSuccess = await server.handleRequest({
    path: '/api/v1/executions',
    method: 'POST',
    headers: {
      'x-agex-tenant': 'ten_001',
      'x-principal-id': 'usr_001',
      'x-request-id': 'req_exec_test',
    },
    body: { target_resource_id: 'agt_search' },
  });

  assert.strictEqual(resSuccess.status, 201);
  const data = (resSuccess.body as any).data;
  assert.strictEqual(data.tenant_id, 'ten_001');

  // Verify Audit Logged for API request
  const logs = logger.getAuditLogs('ten_001');
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].action, 'agent:execute');
});
