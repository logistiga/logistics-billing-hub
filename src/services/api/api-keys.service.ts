import { apiClient } from "./client";

export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  display_key: string;
  permissions: string[] | null;
  rate_limit: number;
  expires_at: string | null;
  last_used_at: string | null;
  last_used_ip: string | null;
  is_active: boolean;
  created_by: string;
  description: string | null;
  created_at: string;
}

export interface CreateApiKeyData {
  name: string;
  permissions?: string[];
  rate_limit?: number;
  expires_at?: string;
  description?: string;
}

export interface CreateApiKeyResponse {
  id: number;
  name: string;
  key: string; // Only returned once at creation
  prefix: string;
  permissions: string[];
  rate_limit: number;
  expires_at: string | null;
  created_at: string;
}

export interface AvailablePermissions {
  [key: string]: string;
}

class ApiKeysService {
  private basePath = "/api-keys";

  async getAll(): Promise<ApiKey[]> {
    const response = await apiClient.get<{ success: boolean; data: ApiKey[] }>(this.basePath);
    return response.data;
  }

  async create(data: CreateApiKeyData): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post<{
      success: boolean;
      data: CreateApiKeyResponse;
      warning: string;
    }>(this.basePath, data);
    return response.data;
  }

  async getById(id: number): Promise<ApiKey> {
    const response = await apiClient.get<{ success: boolean; data: ApiKey }>(`${this.basePath}/${id}`);
    return response.data;
  }

  async update(id: number, data: Partial<CreateApiKeyData> & { is_active?: boolean }): Promise<ApiKey> {
    const response = await apiClient.put<{ success: boolean; data: ApiKey }>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async regenerate(id: number): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post<{
      success: boolean;
      data: CreateApiKeyResponse;
      warning: string;
    }>(`${this.basePath}/${id}/regenerate`);
    return response.data;
  }

  async getPermissions(): Promise<AvailablePermissions> {
    const response = await apiClient.get<{ success: boolean; data: AvailablePermissions }>(
      `${this.basePath}/permissions`
    );
    return response.data;
  }
}

export const apiKeysService = new ApiKeysService();
