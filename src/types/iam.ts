export type IAMPermissionResource =
  | 'users'
  | 'roles'
  | 'policies'
  | 'tenants'
  | 'api-tokens'
  | 'audit';

export type IAMPermissionAction = 'read' | 'create' | 'update' | 'delete' | 'assign' | 'review';

export type IAMPermissionKey = `${IAMPermissionResource}:${IAMPermissionAction}`;

export type IAMPermission = {
  key: IAMPermissionKey;
  description: string;
  critical?: boolean;
};

export type IAMRole = {
  id: string;
  name: string;
  description: string;
  level: number;
  system: boolean;
  permissions: IAMPermissionKey[];
};

export type IAMUserStatus = 'active' | 'invited' | 'suspended' | 'disabled';

export type IAMUser = {
  id: string;
  fullName: string;
  email: string;
  status: IAMUserStatus;
  roles: string[];
  lastSeenAt: string | null;
  mfaEnabled: boolean;
  tenantId: string;
};

export type IAMTenantStatus = 'active' | 'pending' | 'suspended';

export type IAMTenantPlan = 'free' | 'team' | 'enterprise';

export type IAMTenant = {
  id: string;
  name: string;
  status: IAMTenantStatus;
  plan: IAMTenantPlan;
  createdAt: string;
};

export type IAMAuditSeverity = 'low' | 'medium' | 'high';

export type IAMAuditActorType = 'user' | 'service' | 'system';

export type IAMAuditEvent = {
  id: string;
  action: string;
  target: string;
  createdAt: string;
  severity: IAMAuditSeverity;
  actor: {
    id: string;
    name: string;
    type: IAMAuditActorType;
  };
  metadata?: Record<string, unknown>;
};
