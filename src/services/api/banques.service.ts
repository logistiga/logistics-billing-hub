import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Banque,
  Transaction,
  ListParams,
} from "./types";

interface CreateBanqueData {
  name: string;
  account_number: string;
  iban?: string;
  swift?: string;
  currency?: string;
}

interface CreateTransactionData {
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string;
  date: string;
  bank_id?: number;
  category: string;
}

class BanquesService {
  private endpoint = "/banques";

  /**
   * Liste des banques
   */
  async getAll(): Promise<Banque[]> {
    const response = await apiClient.get<ApiResponse<Banque[]>>(this.endpoint);
    return response.data;
  }

  /**
   * Récupérer une banque par son ID
   */
  async getById(id: number): Promise<Banque> {
    const response = await apiClient.get<ApiResponse<Banque>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer une nouvelle banque
   */
  async create(data: CreateBanqueData): Promise<Banque> {
    const response = await apiClient.post<ApiResponse<Banque>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour une banque
   */
  async update(id: number, data: Partial<CreateBanqueData>): Promise<Banque> {
    const response = await apiClient.put<ApiResponse<Banque>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer une banque
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Récupérer les transactions d'une banque
   */
  async getTransactions(
    bankId: number,
    params?: ListParams
  ): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(
      `${this.endpoint}/${bankId}/transactions`,
      params
    );
  }

  /**
   * Toutes les transactions
   */
  async getAllTransactions(
    params?: ListParams & { bank_id?: number; type?: string }
  ): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>("/transactions", params);
  }

  /**
   * Créer une transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      "/transactions",
      data
    );
    return response.data;
  }

  /**
   * Rapprochement bancaire
   */
  async reconcile(
    bankId: number,
    data: { statement_balance: number; date: string }
  ): Promise<{ difference: number; matched: Transaction[] }> {
    const response = await apiClient.post<ApiResponse<{ difference: number; matched: Transaction[] }>>(
      `${this.endpoint}/${bankId}/reconcile`,
      data
    );
    return response.data;
  }

  /**
   * Solde total de toutes les banques
   */
  async getTotalBalance(): Promise<{ total: number; by_bank: { bank: string; balance: number }[] }> {
    const response = await apiClient.get<ApiResponse<{ total: number; by_bank: { bank: string; balance: number }[] }>>(
      `${this.endpoint}/total-balance`
    );
    return response.data;
  }
}

export const banquesService = new BanquesService();
