import { test } from 'node:test';
import assert from 'node:assert';
import { DurableRuntimeEngine } from '../src/runtime/runtime.engine.js';
import { WorkflowEngine, type WorkflowDefinition } from '../src/workflow/workflow.engine.js';
import { KnowledgeEngine } from '../src/context/knowledge.engine.js';
import { MemoryEngine } from '../src/context/memory.engine.js';
import { PluginFramework } from '../src/plugin/plugin.framework.js';

test('1. Workflow Engine Step Execution & Human Approval Pause', async () => {
  const runtime = new DurableRuntimeEngine();
  const wfEngine = new WorkflowEngine(runtime);
  const tenantContext = { tenant_id: 'ten_001', scope_type: 'TENANT' as const };

  const workflow: WorkflowDefinition = {
    id: 'wfl_approval_test',
    steps: [
      { id: 'step_1', type: 'AGENT', name: 'Analyze Task' },
      { id: 'step_2', type: 'APPROVAL', name: 'Human Manager Approval' },
      { id: 'step_3', type: 'END', name: 'Finish' },
    ],
    edges: [
      { from: 'step_1', to: 'step_2' },
      { from: 'step_2', to: 'step_3' },
    ],
  };

  const result = await wfEngine.executeWorkflow(tenantContext, workflow, {});

  assert.strictEqual(result.execution.state, 'WAITING');
  const step2Result = result.step_results['step_2'] as { status: string };
  assert.strictEqual(step2Result.status, 'WAITING_FOR_HUMAN_APPROVAL');
});

test('2. Knowledge Engine Candidate Retrieval ACL Filter', () => {
  const knEngine = new KnowledgeEngine();

  knEngine.addDocument({
    source_id: 'kns_public',
    title: 'Public Architecture Guide',
    classification: 'PUBLIC',
    content: 'General AGEX System Guide',
  });

  knEngine.addDocument({
    source_id: 'kns_secret',
    title: 'Confidential Key Storage Policy',
    classification: 'CONFIDENTIAL',
    content: 'Internal Security Policy for Master Keys',
  });

  // Query with only PUBLIC classification access
  const candidatesPublic = knEngine.retrieveCandidates('Guide', ['PUBLIC']);
  assert.strictEqual(candidatesPublic.length, 1);
  assert.strictEqual(candidatesPublic[0].classification, 'PUBLIC');

  // Query trying to retrieve CONFIDENTIAL document without permission -> Filtered out BEFORE candidate generation
  const candidatesConfidential = knEngine.retrieveCandidates('Policy', ['PUBLIC']);
  assert.strictEqual(candidatesConfidential.length, 0);
});

test('3. Memory Engine Lifecycle & Active Context Query', () => {
  const memEngine = new MemoryEngine();

  const proposed = memEngine.proposeMemory('SESSION', 'usr_100', {
    subject: 'user_preference',
    predicate: 'theme',
    value: 'dark',
  });

  assert.strictEqual(proposed.lifecycle, 'PROPOSED');

  // Proposed memory is not active yet
  const beforeActive = memEngine.getActiveMemories('SESSION', 'usr_100');
  assert.strictEqual(beforeActive.length, 0);

  // Activate Memory
  memEngine.activateMemory(proposed.id);
  const afterActive = memEngine.getActiveMemories('SESSION', 'usr_100');
  assert.strictEqual(afterActive.length, 1);
  assert.strictEqual(afterActive[0].content.value, 'dark');
});

test('4. Plugin Framework Sandbox Egress Control', () => {
  const pluginFw = new PluginFramework();

  pluginFw.registerPlugin({
    package: 'com.agex.slack-plugin',
    version: '1.0.0',
    egress: [
      { host: 'hooks.slack.com', port: 443, protocol: 'HTTPS' },
    ],
  });

  // Allowed Egress
  const allowed = pluginFw.validateEgressAccess('com.agex.slack-plugin', 'hooks.slack.com', 443);
  assert.strictEqual(allowed, true);

  // Denied Egress (Unauthorized Host)
  assert.throws(
    () => {
      pluginFw.validateEgressAccess('com.agex.slack-plugin', 'malicious.external.com', 443);
    },
    (err: any) => err.code === 'PLUGIN_EGRESS_DENIED'
  );
});
