import { generateResourceId, getCurrentISOString } from '../common/utils.js';
import { AgexError } from '../common/errors.js';

export interface AuditEventRecord {
  audit_id: string;
  timestamp: string;
  actor: { type: string; id: string };
  tenant_id: string;
  action: string;
  resource: { type: string; id: string };
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  reason_code?: string;
  request_id: string;
  correlation_id?: string;
  details?: Record<string, unknown>;
}

export class AuditLogger {
  private auditStore: AuditEventRecord[] = [];

  public logEvent(event: Omit<AuditEventRecord, 'audit_id' | 'timestamp'>): AuditEventRecord {
    // Safety Rule: Never store Raw Secret, Raw Token, or Raw CoT in Audit Log (Rule 18 / S-05)
    if (event.details) {
      const sanitized = { ...event.details };
      delete sanitized['secret'];
      delete sanitized['password'];
      delete sanitized['token'];
      delete sanitized['raw_cot'];
      event.details = sanitized;
    }

    const auditRecord: AuditEventRecord = {
      ...event,
      audit_id: generateResourceId('aud'),
      timestamp: getCurrentISOString(),
    };

    this.auditStore.push(auditRecord);
    return auditRecord;
  }

  public getAuditLogs(tenantId: string): AuditEventRecord[] {
    return this.auditStore.filter(log => log.tenant_id === tenantId);
  }

  public getRecentLogs(limit: number): AuditEventRecord[] {
    return this.auditStore.slice(-limit).reverse();
  }
}
