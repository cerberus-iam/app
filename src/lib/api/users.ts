import type { Result } from '@/lib/result';
import type { User } from '@/types/iam';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface ListUsersParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: 'active' | 'blocked' | '';
  sort?: 'createdAt' | 'email' | 'name';
  order?: 'asc' | 'desc';
}

export interface ListUsersResponse {
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional - API can generate temporary password
  roleIds?: string[];
  teamIds?: string[]; // Optional - assign user to teams on creation
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  blockedAt?: string | null; // ISO 8601 datetime when user was blocked
  blockedReason?: string | null; // Reason for blocking
  mfaEnabled?: boolean; // Enable/disable MFA for user
}

// API expects singular roleId for individual operations
export interface AssignRoleRequest {
  roleId: string; // Single role ID
}

export interface RemoveRoleRequest {
  roleId: string; // Single role ID
}

// API expects roleIds array for bulk sync operation
export interface SyncRolesRequest {
  roleIds: string[]; // Array of role IDs to sync
}

export class UsersApi {
  constructor(private readonly client: IamApiClient) {}

  async list(
    params: ListUsersParams = {}
  ): Promise<Result<ListUsersResponse, ApiError>> {
    return this.client.request<ListUsersResponse>('/v1/admin/users', {
      method: 'GET',
      query: params as Record<string, string | number | undefined>,
    });
  }

  async get(userId: string): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}`, {
      method: 'GET',
    });
  }

  async create(data: CreateUserRequest): Promise<Result<User, ApiError>> {
    return this.client.request<User>('/v1/admin/users', {
      method: 'POST',
      body: data,
    });
  }

  async update(
    userId: string,
    data: UpdateUserRequest
  ): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete(userId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async assignRole(
    userId: string,
    data: AssignRoleRequest
  ): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}/roles`, {
      method: 'POST',
      body: data,
    });
  }

  async removeRole(
    userId: string,
    data: RemoveRoleRequest
  ): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/users/${userId}/roles`, {
      method: 'DELETE',
      body: data,
    });
  }

  async syncRoles(
    userId: string,
    data: SyncRolesRequest
  ): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}/roles`, {
      method: 'PUT',
      body: data,
    });
  }
}
