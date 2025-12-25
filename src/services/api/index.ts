// Export all API services
export { apiClient } from "./client";
export { API_CONFIG, STORAGE_KEYS } from "./config";

// Services
export { authService } from "./auth.service";
export { clientsService } from "./clients.service";
export { invoicesService } from "./invoices.service";
export { ordresTravailService } from "./ordres-travail.service";
export { creditsService } from "./credits.service";
export { notesDebutService } from "./notes-debut.service";
export { banquesService } from "./banques.service";
export { avoirsService } from "./avoirs.service";
export { devisService, type Devis, type DevisItem } from "./devis.service";

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ValidationError,
  LoginCredentials,
  RegisterData,
  AuthUser,
  AuthResponse,
  Client,
  ClientContact,
  Invoice,
  InvoiceItem,
  OrdreTravail,
  Container,
  Credit,
  CreditPayment,
  NoteDebut,
  Avoir,
  Banque,
  Transaction,
  ListParams,
} from "./types";
