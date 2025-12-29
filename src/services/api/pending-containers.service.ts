import { apiClient } from "./client";

export interface PendingContainer {
  id: number;
  container_number: string;
  container_type: string | null;
  container_size: string | null;
  weight: number | null;
  seal_number: string | null;
  description: string | null;
  external_id: string | null;
  created_at: string;
}

export interface PendingBookingGroup {
  booking_number: string;
  client_name: string | null;
  client_id: number | null;
  vessel_name: string | null;
  voyage_number: string | null;
  shipping_line: string | null;
  port_origin: string | null;
  port_destination: string | null;
  eta: string | null;
  etd: string | null;
  operation_type: string;
  containers: PendingContainer[];
  container_count: number;
  received_at: string;
  source: string;
}

interface PendingContainersResponse {
  success: boolean;
  data: PendingBookingGroup[];
  total_bookings: number;
  total_containers: number;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    ordre_travail: {
      id: number;
      numero: string;
    };
    containers_count: number;
  };
}

interface BulkCreateResponse {
  success: boolean;
  data: {
    created: Array<{
      booking_number: string;
      ordre_travail_id: number;
      containers_count: number;
    }>;
    failed: Array<{
      booking_number: string;
      error: string;
    }>;
  };
  summary: {
    created_count: number;
    failed_count: number;
  };
}

interface StatsResponse {
  success: boolean;
  data: {
    total_containers: number;
    total_bookings: number;
    by_shipping_line: Record<string, number>;
    by_operation_type: Record<string, number>;
    recent_count: number;
  };
}

export const pendingContainersService = {
  /**
   * Récupérer les conteneurs en attente groupés par booking
   */
  async getAll(params?: { search?: string; client_name?: string }): Promise<PendingContainersResponse> {
    return apiClient.get<PendingContainersResponse>("/pending-containers", params);
  },

  /**
   * Créer un ordre de travail à partir d'un booking
   */
  async createOrdreTravail(data: {
    booking_number: string;
    client_id?: number;
    date?: string;
    type?: string;
    description?: string;
  }): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderResponse>("/pending-containers/create-ordre", data);
  },

  /**
   * Créer plusieurs ordres de travail en lot
   */
  async bulkCreateOrdresTravail(bookingNumbers: string[]): Promise<BulkCreateResponse> {
    return apiClient.post<BulkCreateResponse>("/pending-containers/bulk-create", {
      booking_numbers: bookingNumbers,
    });
  },

  /**
   * Rejeter les conteneurs d'un booking
   */
  async reject(bookingNumber: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/pending-containers/${bookingNumber}/reject`, { reason });
  },

  /**
   * Récupérer les statistiques
   */
  async getStats(): Promise<StatsResponse> {
    return apiClient.get<StatsResponse>("/pending-containers/stats");
  },
};
