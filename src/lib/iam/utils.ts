import { formatDistanceToNowStrict } from 'date-fns';

import {
  type IAMAuditEvent,
  type IAMPermissionAction,
  type IAMPermissionKey,
  type IAMPermissionResource,
  type IAMRole,
  type IAMTenant,
  type IAMUser,
} from '@/types/iam';

export function buildPermissionKey(
  resource: IAMPermissionResource,
  action: IAMPermissionAction,
): IAMPermissionKey {
  return `${resource}:${action}`;
}

export function resolveRolePermissions(role: IAMRole): Set<IAMPermissionKey> {
  return new Set(role.permissions);
}

export function resolveUserPermissions(
  user: Pick<IAMUser, 'roles'>,
  roles: IAMRole[],
): Set<IAMPermissionKey> {
  const roleMap = new Map(roles.map((role) => [role.id, role.permissions]));
  return user.roles.reduce((acc, roleId) => {
    const permissions = roleMap.get(roleId);
    if (permissions) {
      permissions.forEach((permission) => acc.add(permission));
    }
    return acc;
  }, new Set<IAMPermissionKey>());
}

export function hasPermission(
  permissions: Iterable<IAMPermissionKey>,
  required: IAMPermissionKey | IAMPermissionKey[],
): boolean {
  const permissionSet = permissions instanceof Set ? permissions : new Set(permissions);
  if (Array.isArray(required)) {
    return required.every((permission) => permissionSet.has(permission));
  }
  return permissionSet.has(required);
}

export function sortUsersByRecentActivity(users: IAMUser[]): IAMUser[] {
  return [...users].sort((a, b) => {
    const aDate = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
    const bDate = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
    return bDate - aDate;
  });
}

export function summarizeTenants(tenants: IAMTenant[]) {
  return tenants.reduce(
    (acc, tenant) => {
      acc.total += 1;
      acc[tenant.status] += 1;
      return acc;
    },
    {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
    },
  );
}

export function groupAuditEventsBySeverity(events: IAMAuditEvent[]) {
  return events.reduce(
    (acc, event) => {
      acc[event.severity] = (acc[event.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<IAMAuditEvent['severity'], number>,
  );
}

export function formatRelativeTime(timestamp: string | null) {
  if (!timestamp) {
    return 'Never';
  }
  return formatDistanceToNowStrict(new Date(timestamp), {
    addSuffix: true,
  });
}
