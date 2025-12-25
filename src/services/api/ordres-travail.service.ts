import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  OrdreTravail,
  LignePrestation,
  Transport,
  ListParams,
} from "./types";

interface CreateOrdreData {
  client_id: number;
  date: string;
  type?: "Transport" | "Manutention" | "Stockage" | "Location";
  description?: string;
  lignes_prestations?: Omit<LignePrestation, "id" | "ordre_travail_id">[];
  containers?: { numero: string; type?: string; description?: string }[];
  transport?: Omit<Transport, "id" | "ordre_travail_id">;
  tax_ids?: number[];
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
   * Valider un ordre (marque completed)
   */
  async validate(id: number): Promise<OrdreTravail> {
    const response = await apiClient.post<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}/validate`
    );
    return response.data;
  }

  /**
   * Démarrer un ordre (marque in_progress)
   */
  async start(id: number): Promise<OrdreTravail> {
    const response = await apiClient.post<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}/start`
    );
    return response.data;
  }

  /**
   * Terminer un ordre (marque completed)
   */
  async complete(id: number): Promise<OrdreTravail> {
    const response = await apiClient.post<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}/complete`
    );
    return response.data;
  }

  /**
   * Annuler un ordre
   */
  async cancel(id: number): Promise<OrdreTravail> {
    const response = await apiClient.post<ApiResponse<OrdreTravail>>(
      `${this.endpoint}/${id}/cancel`
    );
    return response.data;
  }

  /**
   * Ajouter une ligne de prestation
   */
  async addLignePrestation(ordreId: number, ligne: Omit<LignePrestation, "id" | "ordre_travail_id">): Promise<LignePrestation> {
    const response = await apiClient.post<ApiResponse<LignePrestation>>(
      `${this.endpoint}/${ordreId}/lignes-prestations`,
      ligne
    );
    return response.data;
  }

  /**
   * Supprimer une ligne de prestation
   */
  async removeLignePrestation(ordreId: number, ligneId: number): Promise<void> {
    await apiClient.delete(
      `${this.endpoint}/${ordreId}/lignes-prestations/${ligneId}`
    );
  }

  /**
   * Convertir en facture
   */
  async convertToInvoice(id: number): Promise<{ invoice_id: number; invoice_number: string }> {
    const response = await apiClient.post<ApiResponse<{ id: number; number: string }>>(
      `${this.endpoint}/${id}/convert-to-invoice`
    );
    return { invoice_id: response.data.id, invoice_number: response.data.number };
  }

  /**
   * Générer une facture (alias pour compatibilité)
   */
  async generateInvoice(id: number): Promise<{ invoice_id: number; invoice_number: string }> {
    return this.convertToInvoice(id);
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
