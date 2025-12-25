import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export interface TaxAPI {
  id: number;
  name: string;
  code: string;
  rate: number;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  applicable_on: string[];
  created_at: string;
  updated_at: string;
}

interface CreateTaxData {
  name: string;
  code: string;
  rate: number;
  description?: string;
  is_active?: boolean;
  is_default?: boolean;
  applicable_on?: string[];
}

class TaxesService {
  private endpoint = "/taxes";

  /**
   * Liste des taxes
   */
  async getAll(): Promise<TaxAPI[]> {
    const response = await apiClient.get<ApiResponse<TaxAPI[]>>(this.endpoint);
    return response.data;
  }

  /**
   * Récupérer une taxe par son ID
   */
  async getById(id: number): Promise<TaxAPI> {
    const response = await apiClient.get<ApiResponse<TaxAPI>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer une nouvelle taxe
   */
  async create(data: CreateTaxData): Promise<TaxAPI> {
    const response = await apiClient.post<ApiResponse<TaxAPI>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour une taxe
   */
  async update(id: number, data: Partial<CreateTaxData>): Promise<TaxAPI> {
    const response = await apiClient.put<ApiResponse<TaxAPI>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer une taxe
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Activer/désactiver une taxe
   */
  async toggleActive(id: number): Promise<TaxAPI> {
    const response = await apiClient.patch<ApiResponse<TaxAPI>>(
      `${this.endpoint}/${id}/toggle-active`
    );
    return response.data;
  }

  /**
   * Définir/retirer comme défaut
   */
  async toggleDefault(id: number): Promise<TaxAPI> {
    const response = await apiClient.patch<ApiResponse<TaxAPI>>(
      `${this.endpoint}/${id}/toggle-default`
    );
    return response.data;
  }
}

export const taxesService = new TaxesService();
