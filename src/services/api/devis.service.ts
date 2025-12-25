import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, ListParams, Client } from "./types";

export interface Devis {
  id: number;
  number: string;
  client_id: number;
  client?: Client;
  date: string;
  validity_date: string;
  amount: number;
  type: "Transport" | "Manutention" | "Stockage" | "Location";
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  description: string;
  items?: DevisItem[];
  created_at: string;
  updated_at: string;
}

export interface DevisItem {
  id: number;
  devis_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface CreateDevisData {
  client_id: number;
  date: string;
  validity_date: string;
  type: Devis["type"];
  description: string;
  items?: Omit<DevisItem, "id" | "devis_id">[];
}

class DevisService {
  private endpoint = "/devis";

  /**
   * Liste des devis avec pagination
   */
  async getAll(
    params?: ListParams & { status?: string; client_id?: number; type?: string }
  ): Promise<PaginatedResponse<Devis>> {
    return apiClient.get<PaginatedResponse<Devis>>(this.endpoint, params);
  }

  /**
   * Récupérer un devis par son ID
   */
  async getById(id: number): Promise<Devis> {
    const response = await apiClient.get<ApiResponse<Devis> | Devis>(
      `${this.endpoint}/${id}`
    );
    if (response && typeof response === "object" && "data" in response) {
      return (response as ApiResponse<Devis>).data;
    }
    return response as Devis;
  }

  /**
   * Créer un nouveau devis
   */
  async create(data: CreateDevisData): Promise<Devis> {
    const response = await apiClient.post<ApiResponse<Devis>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour un devis
   */
  async update(id: number, data: Partial<CreateDevisData>): Promise<Devis> {
    const response = await apiClient.put<ApiResponse<Devis>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer un devis
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Convertir un devis en ordre de travail
   */
  async convertToOrdre(id: number): Promise<{ ordre_id: number; ordre_number: string }> {
    const response = await apiClient.post<
      ApiResponse<{ ordre_id: number; ordre_number: string }>
    >(`${this.endpoint}/${id}/convert-to-invoice`);
    return response.data;
  }

  /**
   * Envoyer un devis par email
   */
  async send(id: number, email?: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${this.endpoint}/${id}/send`,
      email ? { email } : {}
    );
    return response.data;
  }

  /**
   * Accepter un devis
   */
  async accept(id: number): Promise<Devis> {
    const response = await apiClient.post<ApiResponse<Devis>>(
      `${this.endpoint}/${id}/accept`
    );
    return response.data;
  }

  /**
   * Rejeter un devis
   */
  async reject(id: number, reason?: string): Promise<Devis> {
    const response = await apiClient.post<ApiResponse<Devis>>(
      `${this.endpoint}/${id}/reject`,
      reason ? { reason } : {}
    );
    return response.data;
  }

  /**
   * Statistiques des devis
   */
  async getStats(): Promise<{
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    total_amount: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        total: number;
        draft: number;
        sent: number;
        accepted: number;
        rejected: number;
        expired: number;
        total_amount: number;
      }>
    >(`${this.endpoint}/stats`);
    return response.data;
  }
}

export const devisService = new DevisService();
