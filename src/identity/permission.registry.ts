// Mirrors specs/permissions/core.permissions.yaml and
// specs/permissions/agent.permissions.yaml. Nothing in this codebase parses
// YAML yet, so this is a hand-synced TypeScript copy rather than a loader.
// TODO(spec-gap): replace with a real YAML-backed registry once one exists,
// and keep this in sync with the specs/ files until then.
export type PermissionRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export const PERMISSION_RISK: Readonly<Record<string, PermissionRisk>> = {
  // core.permissions.yaml
  'tenant:create': 'HIGH',
  'tenant:delete': 'CRITICAL',
  'user:admin': 'CRITICAL',
  'role:manage': 'HIGH',
  'policy:publish': 'HIGH',
  'secret:manage': 'CRITICAL',

  // agent.permissions.yaml
  'agent:create': 'MODERATE',
  'agent:read': 'LOW',
  'agent:update': 'MODERATE',
  'agent:publish': 'HIGH',
  'agent:execute': 'HIGH',
};
