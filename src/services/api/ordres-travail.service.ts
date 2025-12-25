import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  OrdreTravail,
  Container,
  ListParams,
} from "./types";

interface CreateOrdreData {
  client_id: number;
  date: string;
  type: OrdreTravail["type"];
  description: string;
  containers?: Omit<Container, "id">[];
}

class OrdresTravailService {
  private endpoint = "/ordres-travail";

  /**
   * Liste des ordres de travail avec pagination
   */
  async getAll(params?: ListParams & { status?: string; client_id?: number; type?: string }): Promise<PaginatedResponse<OrdreTravail>> {
    return apiClient.get<PaginatedResponse<OrdreTravail>>(this.endpoint, params);
  }

  /**
   * Récupérer un ordre de travail par son ID
   */
  async getById(id: number): Promise<OrdreTravail> {
    const response = await apiClient.get<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer un nouvel ordre de travail
   */
  async create(data: CreateOrdreData): Promise<OrdreTravail> {
    const response = await apiClient.post<ApiResponse<OrdreTravail>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour un ordre de travail
   */
  async update(id: number, data: Partial<CreateOrdreData>): Promise<OrdreTravail> {
    const response = await apiClient.put<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer un ordre de travail
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Changer le statut d'un ordre
   */
  async updateStatus(id: number, status: OrdreTravail["status"]): Promise<OrdreTravail> {
    const response = await apiClient.patch<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Ajouter un conteneur à un ordre
   */
  async addContainer(ordreId: number, container: Omit<Container, "id">): Promise<Container> {
    const response = await apiClient.post<ApiResponse<Container>>(
      `${this.endpoint}/${ordreId}/containers`,
      container
    );
    return response.data;
  }

  /**
   * Supprimer un conteneur d'un ordre
   */
  async removeContainer(ordreId: number, containerId: number): Promise<void> {
    await apiClient.delete(
      `${this.endpoint}/${ordreId}/containers/${containerId}`
    );
  }

  /**
   * Générer une facture à partir d'un ordre
   */
  async generateInvoice(id: number): Promise<{ invoice_id: number; invoice_number: string }> {
    const response = await apiClient.post<ApiResponse<{ invoice_id: number; invoice_number: string }>>(
      `${this.endpoint}/${id}/generate-invoice`
    );
    return response.data;
  }

  /**
   * Générer le PDF d'un ordre
   */
  async downloadPdf(id: number): Promise<Blob> {
    const response = await fetch(
      `${apiClient["baseUrl"]}${this.endpoint}/${id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.blob();
  }

  /**
   * Ordres en attente
   */
  async getPending(): Promise<OrdreTravail[]> {
    const response = await apiClient.get<ApiResponse<OrdreTravail[]>>(
      `${this.endpoint}/pending`
    );
    return response.data;
  }

  /**
   * Statistiques des ordres
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    total_amount: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      total_amount: number;
    }>>(`${this.endpoint}/stats`);
    return response.data;
  }
}

export const ordresTravailService = new OrdresTravailService();
