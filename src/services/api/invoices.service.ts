import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Invoice,
  InvoiceItem,
  ListParams,
} from "./types";

interface CreateInvoiceData {
  client_id: number;
  date: string;
  due_date: string;
  type: Invoice["type"];
  items: Omit<InvoiceItem, "id" | "invoice_id">[];
}

interface InvoicePaymentData {
  amount: number;
  payment_method: string;
  reference?: string;
  date?: string;
  is_advance?: boolean;
}

class InvoicesService {
  private endpoint = "/invoices";

  /**
   * Liste des factures avec pagination
   */
  async getAll(params?: ListParams & { status?: string; client_id?: number }): Promise<PaginatedResponse<Invoice>> {
    return apiClient.get<PaginatedResponse<Invoice>>(this.endpoint, params);
  }

  /**
   * Récupérer une facture par son ID
   */
  async getById(id: number): Promise<Invoice> {
    const response = await apiClient.get<ApiResponse<Invoice>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer une nouvelle facture
   */
  async create(data: CreateInvoiceData): Promise<Invoice> {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour une facture
   */
  async update(id: number, data: Partial<CreateInvoiceData>): Promise<Invoice> {
    const response = await apiClient.put<ApiResponse<Invoice>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer une facture
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Enregistrer un paiement sur une facture
   */
  async recordPayment(invoiceId: number, data: InvoicePaymentData): Promise<Invoice> {
    const response = await apiClient.post<ApiResponse<Invoice>>(
      `${this.endpoint}/${invoiceId}/payments`,
      data
    );
    return response.data;
  }

  /**
   * Paiement groupé de plusieurs factures
   */
  async recordGroupPayment(
    invoiceIds: number[],
    data: InvoicePaymentData
  ): Promise<Invoice[]> {
    const response = await apiClient.post<ApiResponse<Invoice[]>>(
      `${this.endpoint}/group-payment`,
      { invoice_ids: invoiceIds, ...data }
    );
    return response.data;
  }

  /**
   * Générer le PDF d'une facture
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
   * Envoyer une facture par email
   */
  async sendByEmail(id: number, email?: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${this.endpoint}/${id}/send`,
      { email }
    );
    return response.data;
  }

  /**
   * Statistiques des factures
   */
  async getStats(): Promise<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      paid: number;
      pending: number;
      overdue: number;
      total_amount: number;
      paid_amount: number;
      pending_amount: number;
    }>>(`${this.endpoint}/stats`);
    return response.data;
  }

  /**
   * Factures en retard
   */
  async getOverdue(): Promise<Invoice[]> {
    const response = await apiClient.get<ApiResponse<Invoice[]>>(
      `${this.endpoint}/overdue`
    );
    return response.data;
  }
}

export const invoicesService = new InvoicesService();
