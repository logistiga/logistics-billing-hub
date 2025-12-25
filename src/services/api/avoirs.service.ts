import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Avoir,
  ListParams,
} from "./types";

interface CreateAvoirData {
  invoice_id: number;
  amount: number;
  reason: string;
}

class AvoirsService {
  private endpoint = "/avoirs";

  /**
   * Liste des avoirs avec pagination
   */
  async getAll(params?: ListParams & { status?: string }): Promise<PaginatedResponse<Avoir>> {
    return apiClient.get<PaginatedResponse<Avoir>>(this.endpoint, params);
  }

  /**
   * Récupérer un avoir par son ID
   */
  async getById(id: number): Promise<Avoir> {
    const response = await apiClient.get<ApiResponse<Avoir>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer un nouvel avoir
   */
  async create(data: CreateAvoirData): Promise<Avoir> {
    const response = await apiClient.post<ApiResponse<Avoir>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Appliquer un avoir (compensation)
   */
  async apply(
    avoirId: number,
    data: { invoice_id: number; amount: number }
  ): Promise<Avoir> {
    const response = await apiClient.post<ApiResponse<Avoir>>(
      `${this.endpoint}/${avoirId}/apply`,
      data
    );
    return response.data;
  }

  /**
   * Annuler un avoir
   */
  async cancel(id: number): Promise<Avoir> {
    const response = await apiClient.post<ApiResponse<Avoir>>(
      `${this.endpoint}/${id}/cancel`
    );
    return response.data;
  }

  /**
   * Avoirs par client
   */
  async getByClient(clientId: number): Promise<Avoir[]> {
    const response = await apiClient.get<ApiResponse<Avoir[]>>(
      `${this.endpoint}/client/${clientId}`
    );
    return response.data;
  }

  /**
   * Historique des compensations d'un avoir
   */
  async getCompensations(avoirId: number): Promise<{
    avoir_id: number;
    invoice_id: number;
    invoice_number: string;
    amount: number;
    date: string;
  }[]> {
    const response = await apiClient.get<ApiResponse<{
      avoir_id: number;
      invoice_id: number;
      invoice_number: string;
      amount: number;
      date: string;
    }[]>>(`${this.endpoint}/${avoirId}/compensations`);
    return response.data;
  }

  /**
   * Statistiques des avoirs
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    applied: number;
    total_amount: number;
    pending_amount: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      pending: number;
      applied: number;
      total_amount: number;
      pending_amount: number;
    }>>(`${this.endpoint}/stats`);
    return response.data;
  }
}

export const avoirsService = new AvoirsService();
