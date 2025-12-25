import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Client,
  ClientContact,
  ListParams,
} from "./types";

class ClientsService {
  private endpoint = "/clients";

  /**
   * Liste des clients avec pagination
   */
  async getAll(params?: ListParams): Promise<PaginatedResponse<Client>> {
    return apiClient.get<PaginatedResponse<Client>>(this.endpoint, params);
  }

  /**
   * Récupérer un client par son ID
   */
  async getById(id: number): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer un nouveau client
   */
  async create(data: Omit<Client, "id" | "created_at" | "updated_at" | "total_invoices" | "balance">): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour un client
   */
  async update(id: number, data: Partial<Client>): Promise<Client> {
    const response = await apiClient.put<ApiResponse<Client>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer un client
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Rechercher des clients
   */
  async search(query: string): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<Client[]>>(
      `${this.endpoint}/search`,
      { q: query }
    );
    return response.data;
  }

  /**
   * Récupérer les contacts d'un client
   */
  async getContacts(clientId: number): Promise<ClientContact[]> {
    const response = await apiClient.get<ApiResponse<ClientContact[]>>(
      `${this.endpoint}/${clientId}/contacts`
    );
    return response.data;
  }

  /**
   * Ajouter un contact à un client
   */
  async addContact(
    clientId: number,
    data: Omit<ClientContact, "id" | "client_id">
  ): Promise<ClientContact> {
    const response = await apiClient.post<ApiResponse<ClientContact>>(
      `${this.endpoint}/${clientId}/contacts`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer un contact
   */
  async deleteContact(clientId: number, contactId: number): Promise<void> {
    await apiClient.delete(
      `${this.endpoint}/${clientId}/contacts/${contactId}`
    );
  }

  /**
   * Récupérer le solde d'un client
   */
  async getBalance(clientId: number): Promise<{ balance: number; invoices_count: number }> {
    const response = await apiClient.get<ApiResponse<{ balance: number; invoices_count: number }>>(
      `${this.endpoint}/${clientId}/balance`
    );
    return response.data;
  }

  /**
   * Exporter les clients en Excel/CSV
   */
  async export(format: "xlsx" | "csv" = "xlsx"): Promise<Blob> {
    const response = await fetch(
      `${apiClient["baseUrl"]}${this.endpoint}/export?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.blob();
  }
}

export const clientsService = new ClientsService();
