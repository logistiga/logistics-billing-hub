import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Credit,
  CreditPayment,
  ListParams,
} from "./types";

interface CreateCreditData {
  bank: string;
  capital_initial: number;
  taux_interet: number;
  duree_total: number;
  date_debut: string;
  objet_credit: string;
}

class CreditsService {
  private endpoint = "/credits";

  /**
   * Liste des crédits avec pagination
   */
  async getAll(params?: ListParams & { status?: string }): Promise<PaginatedResponse<Credit>> {
    return apiClient.get<PaginatedResponse<Credit>>(this.endpoint, params);
  }

  /**
   * Récupérer un crédit par son ID
   */
  async getById(id: number): Promise<Credit> {
    const response = await apiClient.get<ApiResponse<Credit>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer un nouveau crédit
   */
  async create(data: CreateCreditData): Promise<Credit> {
    const response = await apiClient.post<ApiResponse<Credit>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour un crédit
   */
  async update(id: number, data: Partial<CreateCreditData>): Promise<Credit> {
    const response = await apiClient.put<ApiResponse<Credit>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer un crédit
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Récupérer les paiements d'un crédit
   */
  async getPayments(creditId: number): Promise<CreditPayment[]> {
    const response = await apiClient.get<ApiResponse<CreditPayment[]>>(
      `${this.endpoint}/${creditId}/payments`
    );
    return response.data;
  }

  /**
   * Enregistrer un paiement d'échéance
   */
  async recordPayment(
    creditId: number,
    data: { montant: number; date?: string }
  ): Promise<CreditPayment> {
    const response = await apiClient.post<ApiResponse<CreditPayment>>(
      `${this.endpoint}/${creditId}/payments`,
      data
    );
    return response.data;
  }

  /**
   * Récupérer l'échéancier complet
   */
  async getSchedule(creditId: number): Promise<CreditPayment[]> {
    const response = await apiClient.get<ApiResponse<CreditPayment[]>>(
      `${this.endpoint}/${creditId}/schedule`
    );
    return response.data;
  }

  /**
   * Crédits en retard
   */
  async getOverdue(): Promise<Credit[]> {
    const response = await apiClient.get<ApiResponse<Credit[]>>(
      `${this.endpoint}/overdue`
    );
    return response.data;
  }

  /**
   * Paiements à venir (prochains 7 jours)
   */
  async getUpcomingPayments(): Promise<CreditPayment[]> {
    const response = await apiClient.get<ApiResponse<CreditPayment[]>>(
      `${this.endpoint}/upcoming-payments`
    );
    return response.data;
  }

  /**
   * Statistiques des crédits
   */
  async getStats(): Promise<{
    total_capital: number;
    total_restant: number;
    total_mensualites: number;
    overdue_count: number;
    active_count: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total_capital: number;
      total_restant: number;
      total_mensualites: number;
      overdue_count: number;
      active_count: number;
    }>>(`${this.endpoint}/stats`);
    return response.data;
  }
}

export const creditsService = new CreditsService();
