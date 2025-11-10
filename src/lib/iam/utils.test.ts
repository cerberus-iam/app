import {
  buildPermissionKey,
  resolveRolePermissions,
  resolveUserPermissions,
  hasPermission,
  sortUsersByRecentActivity,
  summarizeTenants,
  groupAuditEventsBySeverity,
  formatRelativeTime,
} from './utils';
import type { IAMAuditEvent, IAMPermissionKey, IAMRole, IAMTenant, IAMUser } from '@/types/iam';

describe('IAM Utils - Unit Tests', () => {
  describe('buildPermissionKey', () => {
    it('should build a permission key from resource and action', () => {
      const key = buildPermissionKey('users', 'read');
      expect(key).toBe('users:read');
    });

    it('should handle different resources and actions', () => {
      expect(buildPermissionKey('roles', 'create')).toBe('roles:create');
      expect(buildPermissionKey('tenants', 'delete')).toBe('tenants:delete');
      expect(buildPermissionKey('audit', 'review')).toBe('audit:review');
    });
  });

  describe('resolveRolePermissions', () => {
    it('should return a set of permissions from a role', () => {
      const role: IAMRole = {
        id: 'role-1',
        name: 'Admin',
        description: 'Admin role',
        level: 10,
        system: true,
        permissions: ['users:read', 'users:create', 'roles:read'],
      };

      const permissions = resolveRolePermissions(role);
      expect(permissions).toBeInstanceOf(Set);
      expect(permissions.size).toBe(3);
      expect(permissions.has('users:read')).toBe(true);
      expect(permissions.has('users:create')).toBe(true);
      expect(permissions.has('roles:read')).toBe(true);
    });

    it('should handle roles with no permissions', () => {
      const role: IAMRole = {
        id: 'role-2',
        name: 'Viewer',
        description: 'View only',
        level: 1,
        system: false,
        permissions: [],
      };

      const permissions = resolveRolePermissions(role);
      expect(permissions.size).toBe(0);
    });
  });

  describe('resolveUserPermissions', () => {
    const roles: IAMRole[] = [
      {
        id: 'role-1',
        name: 'Admin',
        description: 'Admin role',
        level: 10,
        system: true,
        permissions: ['users:read', 'users:create', 'users:update'],
      },
      {
        id: 'role-2',
        name: 'Editor',
        description: 'Editor role',
        level: 5,
        system: false,
        permissions: ['roles:read', 'policies:read'],
      },
    ];

    it('should resolve all permissions from user roles', () => {
      const user: Pick<IAMUser, 'roles'> = {
        roles: ['role-1', 'role-2'],
      };

      const permissions = resolveUserPermissions(user, roles);
      expect(permissions.size).toBe(5);
      expect(permissions.has('users:read')).toBe(true);
      expect(permissions.has('users:create')).toBe(true);
      expect(permissions.has('users:update')).toBe(true);
      expect(permissions.has('roles:read')).toBe(true);
      expect(permissions.has('policies:read')).toBe(true);
    });

    it('should handle user with no roles', () => {
      const user: Pick<IAMUser, 'roles'> = {
        roles: [],
      };

      const permissions = resolveUserPermissions(user, roles);
      expect(permissions.size).toBe(0);
    });

    it('should ignore invalid role IDs', () => {
      const user: Pick<IAMUser, 'roles'> = {
        roles: ['role-1', 'invalid-role-id'],
      };

      const permissions = resolveUserPermissions(user, roles);
      expect(permissions.size).toBe(3);
      expect(permissions.has('users:read')).toBe(true);
    });

    it('should deduplicate permissions from multiple roles', () => {
      const rolesWithDupes: IAMRole[] = [
        {
          id: 'role-1',
          name: 'Role 1',
          description: 'First role',
          level: 5,
          system: false,
          permissions: ['users:read', 'roles:read'],
        },
        {
          id: 'role-2',
          name: 'Role 2',
          description: 'Second role',
          level: 5,
          system: false,
          permissions: ['users:read', 'policies:read'],
        },
      ];

      const user: Pick<IAMUser, 'roles'> = {
        roles: ['role-1', 'role-2'],
      };

      const permissions = resolveUserPermissions(user, rolesWithDupes);
      expect(permissions.size).toBe(3); // users:read should only appear once
    });
  });

  describe('hasPermission', () => {
    const permissions = new Set<IAMPermissionKey>(['users:read', 'users:create', 'roles:read']);

    it('should return true if user has the required permission', () => {
      expect(hasPermission(permissions, 'users:read')).toBe(true);
    });

    it('should return false if user does not have the required permission', () => {
      expect(hasPermission(permissions, 'users:delete')).toBe(false);
    });

    it('should check multiple required permissions (all must be present)', () => {
      expect(hasPermission(permissions, ['users:read', 'roles:read'])).toBe(true);
      expect(hasPermission(permissions, ['users:read', 'users:delete'])).toBe(false);
    });

    it('should handle empty permission set', () => {
      const emptyPerms = new Set<IAMPermissionKey>();
      expect(hasPermission(emptyPerms, 'users:read')).toBe(false);
      expect(hasPermission(emptyPerms, [])).toBe(true); // empty requirements = true
    });

    it('should handle permissions as iterable array', () => {
      const permsArray: IAMPermissionKey[] = ['users:read', 'users:create'];
      expect(hasPermission(permsArray, 'users:read')).toBe(true);
      expect(hasPermission(permsArray, 'users:delete')).toBe(false);
    });
  });

  describe('sortUsersByRecentActivity', () => {
    const users: IAMUser[] = [
      {
        id: '1',
        fullName: 'Alice',
        email: 'alice@example.com',
        status: 'active',
        roles: [],
        lastSeenAt: '2025-10-20T10:00:00Z',
        mfaEnabled: true,
        tenantId: 'tenant-1',
      },
      {
        id: '2',
        fullName: 'Bob',
        email: 'bob@example.com',
        status: 'active',
        roles: [],
        lastSeenAt: '2025-10-22T10:00:00Z',
        mfaEnabled: false,
        tenantId: 'tenant-1',
      },
      {
        id: '3',
        fullName: 'Charlie',
        email: 'charlie@example.com',
        status: 'active',
        roles: [],
        lastSeenAt: null,
        mfaEnabled: true,
        tenantId: 'tenant-1',
      },
    ];

    it('should sort users by most recent activity first', () => {
      const sorted = sortUsersByRecentActivity(users);
      expect(sorted[0].fullName).toBe('Bob'); // Most recent
      expect(sorted[1].fullName).toBe('Alice');
      expect(sorted[2].fullName).toBe('Charlie'); // Never seen
    });

    it('should not mutate the original array', () => {
      const originalOrder = users.map((u) => u.fullName);
      sortUsersByRecentActivity(users);
      expect(users.map((u) => u.fullName)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = sortUsersByRecentActivity([]);
      expect(sorted).toEqual([]);
    });
  });

  describe('summarizeTenants', () => {
    const tenants: IAMTenant[] = [
      {
        id: '1',
        name: 'Tenant 1',
        status: 'active',
        plan: 'enterprise',
        createdAt: '2025-01-01',
      },
      {
        id: '2',
        name: 'Tenant 2',
        status: 'active',
        plan: 'team',
        createdAt: '2025-01-02',
      },
      {
        id: '3',
        name: 'Tenant 3',
        status: 'pending',
        plan: 'free',
        createdAt: '2025-01-03',
      },
      {
        id: '4',
        name: 'Tenant 4',
        status: 'suspended',
        plan: 'team',
        createdAt: '2025-01-04',
      },
    ];

    it('should summarize tenant counts by status', () => {
      const summary = summarizeTenants(tenants);
      expect(summary.total).toBe(4);
      expect(summary.active).toBe(2);
      expect(summary.pending).toBe(1);
      expect(summary.suspended).toBe(1);
    });

    it('should handle empty tenant array', () => {
      const summary = summarizeTenants([]);
      expect(summary.total).toBe(0);
      expect(summary.active).toBe(0);
      expect(summary.pending).toBe(0);
      expect(summary.suspended).toBe(0);
    });

    it('should handle all tenants with same status', () => {
      const allActive: IAMTenant[] = [
        {
          id: '1',
          name: 'Tenant 1',
          status: 'active',
          plan: 'team',
          createdAt: '2025-01-01',
        },
        {
          id: '2',
          name: 'Tenant 2',
          status: 'active',
          plan: 'team',
          createdAt: '2025-01-02',
        },
      ];
      const summary = summarizeTenants(allActive);
      expect(summary.total).toBe(2);
      expect(summary.active).toBe(2);
      expect(summary.pending).toBe(0);
      expect(summary.suspended).toBe(0);
    });
  });

  describe('groupAuditEventsBySeverity', () => {
    const events: IAMAuditEvent[] = [
      {
        id: '1',
        action: 'login',
        target: 'user-1',
        createdAt: '2025-10-22',
        severity: 'low',
        actor: { id: 'user-1', name: 'Alice', type: 'user' },
      },
      {
        id: '2',
        action: 'delete',
        target: 'user-2',
        createdAt: '2025-10-22',
        severity: 'high',
        actor: { id: 'admin-1', name: 'Admin', type: 'user' },
      },
      {
        id: '3',
        action: 'update',
        target: 'role-1',
        createdAt: '2025-10-22',
        severity: 'medium',
        actor: { id: 'user-3', name: 'Bob', type: 'user' },
      },
      {
        id: '4',
        action: 'login',
        target: 'user-4',
        createdAt: '2025-10-22',
        severity: 'low',
        actor: { id: 'user-4', name: 'Charlie', type: 'user' },
      },
    ];

    it('should group events by severity and count them', () => {
      const grouped = groupAuditEventsBySeverity(events);
      expect(grouped.low).toBe(2);
      expect(grouped.medium).toBe(1);
      expect(grouped.high).toBe(1);
    });

    it('should handle empty events array', () => {
      const grouped = groupAuditEventsBySeverity([]);
      expect(grouped).toEqual({});
    });

    it('should handle events with only one severity', () => {
      const highSeverityEvents = events.filter((e) => e.severity === 'high');
      const grouped = groupAuditEventsBySeverity(highSeverityEvents);
      expect(grouped.high).toBe(1);
      expect(grouped.low).toBeUndefined();
      expect(grouped.medium).toBeUndefined();
    });
  });

  describe('formatRelativeTime', () => {
    beforeAll(() => {
      // Mock the current date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-22T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should format null timestamp as 'Never'", () => {
      expect(formatRelativeTime(null)).toBe('Never');
    });

    it('should format recent timestamp relatively', () => {
      const oneHourAgo = '2025-10-22T11:00:00Z';
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should format timestamp from days ago', () => {
      const twoDaysAgo = '2025-10-20T12:00:00Z';
      expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
    });

    it('should format timestamp from minutes ago', () => {
      const thirtyMinsAgo = '2025-10-22T11:30:00Z';
      expect(formatRelativeTime(thirtyMinsAgo)).toBe('30 minutes ago');
    });
  });
});
