import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  requireMfa: boolean; // Match API field name
  sessionLifetime: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganisationData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  allowedCallbackUrls?: string[];
  allowedLogoutUrls?: string[];
  allowedOrigins?: string[];
  sessionLifetime?: number;
  sessionIdleTimeout?: number;
  requireMfa?: boolean; // Match API field name (not mfaRequired)
  allowedMfaMethods?: string[];
  passwordPolicy?: Record<string, unknown>;
  tokenLifetimePolicy?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class OrganisationApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * Get organisation settings
   */
  async get(): Promise<Result<Organisation, ApiError>> {
    return this.client.request<Organisation>('/v1/admin/organisation', {
      method: 'GET',
    });
  }

  /**
   * Update organisation settings
   */
  async update(
    data: UpdateOrganisationData
  ): Promise<Result<Organisation, ApiError>> {
    return this.client.request<Organisation>('/v1/admin/organisation', {
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * Delete organisation (DESTRUCTIVE - soft delete)
   * This is irreversible and will delete all users, data, and configuration
   */
  async delete(): Promise<Result<void, ApiError>> {
    return this.client.request<void>('/v1/admin/organisation', {
      method: 'DELETE',
    });
  }
}
