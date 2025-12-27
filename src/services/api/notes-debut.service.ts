import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  NoteDebut,
  ListParams,
} from "./types";

interface CreateNoteDebutData {
  client_id: number;
  type: NoteDebut["type"];
  ordre_travail_id?: number;
  date: string;
  reference?: string;
  navire?: string;
  voyage?: string;
  conteneur?: string;
  type_conteneur?: string;
  taille_conteneur?: string;
  armateur?: string;
  date_arrivee?: string;
  date_sortie?: string;
  jours_detention?: number;
  montant_detention?: number;
  observations?: string;
  details?: Record<string, unknown>;
}

class NotesDebutService {
  private endpoint = "/notes-debut";

  /**
   * Liste des notes de début avec pagination
   */
  async getAll(params?: ListParams & { status?: string; type?: string }): Promise<PaginatedResponse<NoteDebut>> {
    return apiClient.get<PaginatedResponse<NoteDebut>>(this.endpoint, params);
  }

  /**
   * Récupérer une note par son ID
   */
  async getById(id: number): Promise<NoteDebut> {
    const response = await apiClient.get<ApiResponse<NoteDebut>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Créer une nouvelle note
   */
  async create(data: CreateNoteDebutData): Promise<NoteDebut> {
    const response = await apiClient.post<ApiResponse<NoteDebut>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  /**
   * Mettre à jour une note
   */
  async update(id: number, data: Partial<CreateNoteDebutData>): Promise<NoteDebut> {
    const response = await apiClient.put<ApiResponse<NoteDebut>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Supprimer une note
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Enregistrer un paiement
   */
  async recordPayment(
    noteId: number,
    data: { amount: number; payment_method: string; is_advance?: boolean }
  ): Promise<NoteDebut> {
    const response = await apiClient.post<ApiResponse<NoteDebut>>(
      `${this.endpoint}/${noteId}/payments`,
      data
    );
    return response.data;
  }

  /**
   * Paiement groupé
   */
  async recordGroupPayment(
    noteIds: number[],
    data: { amount: number; payment_method: string }
  ): Promise<NoteDebut[]> {
    const response = await apiClient.post<ApiResponse<NoteDebut[]>>(
      `${this.endpoint}/group-payment`,
      { note_ids: noteIds, ...data }
    );
    return response.data;
  }

  /**
   * Générer une facture à partir d'une note
   */
  async generateInvoice(id: number): Promise<{ invoice_id: number; invoice_number: string }> {
    const response = await apiClient.post<ApiResponse<{ invoice_id: number; invoice_number: string }>>(
      `${this.endpoint}/${id}/generate-invoice`
    );
    return response.data;
  }

  /**
   * Statistiques
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    paid: number;
    total_amount: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      pending: number;
      paid: number;
      total_amount: number;
    }>>(`${this.endpoint}/stats`);
    return response.data;
  }
}

export const notesDebutService = new NotesDebutService();
