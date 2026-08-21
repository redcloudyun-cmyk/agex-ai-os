import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// ─── AGEX Core Engine Imports ───
import { PolicyDecisionPoint } from './identity/pdp.js';
import { DurableRuntimeEngine } from './runtime/runtime.engine.js';
import { AuditLogger } from './governance/audit.logger.js';
import { BillingLedgerEngine } from './billing/billing.ledger.js';
import type { TenantContext, PrincipalReference } from './common/types.js';

const PORT = 8085;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// ─── MIME Types ───
const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

// ─── Boot AGEX Core Engine ───
const pdp = new PolicyDecisionPoint();
const runtime = new DurableRuntimeEngine();
const auditLogger = new AuditLogger();
const billing = new BillingLedgerEngine();

// In-memory Agent Registry (Seed Data)
const agentRegistry = [
  {
    id: 'agt_market_analyst',
    name: 'Market Analyst Agent',
    description: '금융 시장 데이터를 분석하고 구조화된 인사이트 리포트를 생성합니다.',
    autonomy_level: 'L2',
    status: 'ACTIVE',
    bound_skills: ['financial-market-analysis', 'report-generation'],
    bound_model: 'gpt-4o',
    executions_total: 127,
  },
  {
    id: 'agt_code_reviewer',
    name: 'Code Review Agent',
    description: '코드베이스의 품질, 보안 취약점, 아키텍처 패턴 준수를 자동 점검합니다.',
    autonomy_level: 'L1',
    status: 'ACTIVE',
    bound_skills: ['code-review', 'security-scan'],
    bound_model: 'claude-3.5-sonnet',
    executions_total: 89,
  },
  {
    id: 'agt_content_writer',
    name: 'Content Writer Agent',
    description: '마케팅 콘텐츠, 블로그 포스트, 프레젠테이션을 생성합니다.',
    autonomy_level: 'L1',
    status: 'ACTIVE',
    bound_skills: ['content-generation', 'seo-optimization'],
    bound_model: 'gpt-4o-mini',
    executions_total: 204,
  },
  {
    id: 'agt_data_pipeline',
    name: 'Data Pipeline Agent',
    description: 'ETL 파이프라인을 자동으로 구성하고 데이터 품질을 모니터링합니다.',
    autonomy_level: 'L3',
    status: 'PAUSED',
    bound_skills: ['data-etl', 'quality-check'],
    bound_model: 'gemini-2.5-pro',
    executions_total: 56,
  },
];

// In-memory Knowledge Base (Seed Data)
const knowledgeBase = [
  {
    id: 'kb_001',
    name: '2026_사업계획서_최종.pdf',
    classification: 'CONFIDENTIAL',
    size_bytes: 2516582,
    status: 'INDEXED',
    indexed_at: '2026-08-20T14:30:00Z',
    chunk_count: 142,
  },
  {
    id: 'kb_002',
    name: '제품_아키텍처_명세.docx',
    classification: 'INTERNAL',
    size_bytes: 1153433,
    status: 'INDEXED',
    indexed_at: '2026-08-19T09:15:00Z',
    chunk_count: 87,
  },
  {
    id: 'kb_003',
    name: 'AGEX_API_스펙_v3.json',
    classification: 'PUBLIC',
    size_bytes: 425891,
    status: 'INDEXED',
    indexed_at: '2026-08-18T16:45:00Z',
    chunk_count: 34,
  },
];

// In-memory Plugin Registry (Seed Data)
const pluginRegistry = [
  {
    id: 'plg_slack',
    package_id: 'com.agex.slack-plugin',
    name: 'Slack Notification Integration',
    status: 'ENABLED',
    egress_rules: ['hooks.slack.com:443'],
    credential_ref: 'SecretReference(sec_slack_webhook)',
    version: '2.1.0',
  },
  {
    id: 'plg_github',
    package_id: 'com.agex.github-plugin',
    name: 'GitHub Automated PR Reviewer',
    status: 'ENABLED',
    egress_rules: ['api.github.com:443'],
    credential_ref: 'SecretReference(sec_github_token)',
    version: '1.4.2',
  },
  {
    id: 'plg_google_workspace',
    package_id: 'com.agex.gworkspace-plugin',
    name: 'Google Workspace Integration',
    status: 'DISABLED',
    egress_rules: ['www.googleapis.com:443', 'oauth2.googleapis.com:443'],
    credential_ref: 'SecretReference(sec_gworkspace_sa)',
    version: '1.0.0',
  },
];

// Execution history (will grow dynamically)
const executionHistory: Array<Record<string, unknown>> = [];

// Billing state
const billingState = {
  plan: 'Business Pro',
  monthly_price: 120.0,
  total_credits: 10000,
  used_credits: 1550,
  next_renewal: '2026-09-01',
};

// ─── API Router ───
function handleApiRequest(
  method: string,
  pathname: string,
  body: Record<string, unknown> | null
): { status: number; data: unknown } {
  const tenantId = 'ten_production_01';
  const tenantContext: TenantContext = { tenant_id: tenantId, scope_type: 'TENANT' };
  const principal: PrincipalReference = { type: 'user', id: 'usr_admin_001' };

  // ─── GET /api/v1/health ───
  if (pathname === '/api/v1/health' && method === 'GET') {
    return {
      status: 200,
      data: {
        status: 'UP',
        service: 'AGEX AI OS Platform API',
        version: '0.1.0',
        runtime_active: true,
        active_executions: executionHistory.length,
        registered_agents: agentRegistry.length,
        uptime_seconds: Math.floor(process.uptime()),
      },
    };
  }

  // ─── POST /api/v1/executions ───
  if (pathname === '/api/v1/executions' && method === 'POST') {
    const taskObjective = (body?.objective as string) || 'Unnamed task';
    const agentId = (body?.agent_id as string) || 'agt_market_analyst';

    // PDP authorization check. resource_tenant_id is intentionally omitted —
    // see the doc comment on AuthorizationRequest.resource_tenant_id; this
    // demo agentRegistry has no per-agent tenant ownership to resolve yet.
    const decision = pdp.evaluate({
      principal,
      tenant_context: tenantContext,
      action: 'agent:execute',
      resource_type: 'Agent',
      resource_id: agentId,
      principal_permissions: ['agent:execute'],
    });

    if (decision.decision !== 'ALLOW') {
      auditLogger.logEvent({
        actor: principal,
        tenant_id: tenantId,
        action: 'agent:execute',
        resource: { type: 'Agent', id: agentId },
        result: 'DENIED',
        reason_code: decision.reason_code,
        request_id: `req_${Date.now()}`,
      });
      const status = decision.decision === 'CONDITIONAL' ? 202 : 403;
      return { status, data: { error: decision.decision === 'CONDITIONAL' ? 'APPROVAL_REQUIRED' : 'PERMISSION_DENIED', reason: decision.reason_code } };
    }

    // Create execution via Durable Runtime Engine
    const execution = runtime.createExecution(tenantContext, agentId);

    // Audit log
    auditLogger.logEvent({
      actor: principal,
      tenant_id: tenantId,
      action: 'agent:execute',
      resource: { type: 'Execution', id: execution.id },
      result: 'SUCCESS',
      request_id: `req_${Date.now()}`,
    });

    // Record billing usage
    billingState.used_credits += 5;

    const record = {
      execution_id: execution.id,
      agent_id: agentId,
      agent_name: agentRegistry.find((a) => a.id === agentId)?.name || agentId,
      objective: taskObjective,
      status: execution.state,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
      checkpoint: 'INITIAL',
    };
    executionHistory.unshift(record);

    return { status: 201, data: record };
  }

  // ─── GET /api/v1/agents ───
  if (pathname === '/api/v1/agents' && method === 'GET') {
    return { status: 200, data: { agents: agentRegistry, total: agentRegistry.length } };
  }

  // ─── GET /api/v1/knowledge ───
  if (pathname === '/api/v1/knowledge' && method === 'GET') {
    return { status: 200, data: { documents: knowledgeBase, total: knowledgeBase.length } };
  }

  // ─── GET /api/v1/plugins ───
  if (pathname === '/api/v1/plugins' && method === 'GET') {
    return { status: 200, data: { plugins: pluginRegistry, total: pluginRegistry.length } };
  }

  // ─── GET /api/v1/billing/usage ───
  if (pathname === '/api/v1/billing/usage' && method === 'GET') {
    return {
      status: 200,
      data: {
        ...billingState,
        remaining_credits: billingState.total_credits - billingState.used_credits,
      },
    };
  }

  // ─── GET /api/v1/audit/logs ───
  if (pathname === '/api/v1/audit/logs' && method === 'GET') {
    const logs = auditLogger.getRecentLogs ? auditLogger.getRecentLogs(20) : [];
    return { status: 200, data: { logs, total: logs.length } };
  }

  // ─── GET /api/v1/executions ───
  if (pathname === '/api/v1/executions' && method === 'GET') {
    return { status: 200, data: { executions: executionHistory, total: executionHistory.length } };
  }

  return { status: 404, data: { error: 'ENDPOINT_NOT_FOUND', message: `${method} ${pathname}` } };
}

// ─── HTTP Server (Static Files + REST API) ───
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = (req.method || 'GET').toUpperCase();

  // ─── CORS Headers ───
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-AGEX-Tenant, X-Principal-Id');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ─── API Routes (/api/v1/*) ───
  if (pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      let parsedBody: Record<string, unknown> | null = null;
      try {
        if (body) parsedBody = JSON.parse(body);
      } catch {
        /* ignore parse errors */
      }

      const result = handleApiRequest(method, pathname, parsedBody);
      res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.data, null, 2));
    });
    return;
  }

  // ─── Static File Serving ───
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  AGEX AI OS — Unified Platform Server`);
  console.log(`  Console:  http://localhost:${PORT}`);
  console.log(`  API:      http://localhost:${PORT}/api/v1/health`);
  console.log(`  Engine:   Durable Runtime + PDP + Audit + Billing`);
  console.log(`═══════════════════════════════════════════════════════\n`);
});
