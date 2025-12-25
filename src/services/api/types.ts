// Types génériques pour les réponses API Laravel

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// Types d'authentification Laravel Sanctum
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Types pour les entités métier
export interface Client {
  id: number;
  name: string;
  nif: string;
  rccm: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  contacts: ClientContact[];
  total_invoices: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: number;
  client_id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Invoice {
  id: number;
  number: string;
  client_id: number;
  client?: Client;
  date: string;
  due_date: string;
  amount: number;
  paid: number;
  advance: number;
  status: "paid" | "pending" | "overdue" | "partial" | "advance";
  type: "Manutention" | "Transport" | "Stockage" | "Location";
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrdreTravail {
  id: number;
  numero: string;
  client_id: number;
  client?: Client;
  invoice_id?: number;
  date: string;
  reference?: string;
  navire?: string;
  voyage?: string;
  type_operation?: string;
  marchandise?: string;
  poids?: number;
  nombre_colis?: number;
  lieu_operation?: string;
  observations?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  validated_at?: string;
  total: number;
  lignes_prestations?: LignePrestation[];
  transport?: Transport;
  taxes?: TaxPivot[];
  created_at: string;
  updated_at: string;
}

export interface LignePrestation {
  id?: number;
  ordre_travail_id?: number;
  description: string;
  quantite: number;
  prix_unitaire: number;
  total?: number;
}

export interface Transport {
  id?: number;
  ordre_travail_id?: number;
  type_transport?: string;
  point_depart?: string;
  point_arrivee?: string;
  date_enlevement?: string;
  date_livraison?: string;
  numero_connaissement?: string;
  compagnie_maritime?: string;
  navire?: string;
  transitaire?: string;
  representant?: string;
}

export interface TaxPivot {
  id: number;
  name: string;
  code: string;
  rate: string;
  pivot?: {
    ordre_travail_id: number;
    tax_id: number;
    rate: string;
    amount: string;
  };
}

export interface Container {
  id: number;
  numero: string;
  type: string;
  description: string;
}

export interface Credit {
  id: number;
  bank: string;
  reference: string;
  capital_initial: number;
  capital_restant: number;
  taux_interet: number;
  mensualite: number;
  date_debut: string;
  date_fin: string;
  duree_total: number;
  echeances_payees: number;
  status: "active" | "overdue" | "completed" | "suspended";
  prochain_paiement: string;
  objet_credit: string;
  created_at: string;
  updated_at: string;
}

export interface CreditPayment {
  id: number;
  credit_id: number;
  credit_ref: string;
  bank: string;
  date: string;
  montant: number;
  capital: number;
  interet: number;
  status: "paid" | "pending" | "overdue";
  echeance: number;
}

export interface NoteDebut {
  id: number;
  number: string;
  client_id: number;
  client?: Client;
  type: "ouverture_port" | "detention" | "reparation";
  ordres_travail: string[];
  bl_number: string;
  container_number: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  tarif_journalier: number;
  montant_total: number;
  paid: number;
  advance: number;
  status: "pending" | "invoiced" | "paid" | "cancelled" | "partial";
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Avoir {
  id: number;
  number: string;
  invoice_id: number;
  invoice?: Invoice;
  client_id: number;
  client?: Client;
  date: string;
  amount: number;
  reason: string;
  status: "pending" | "applied" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Banque {
  id: number;
  name: string;
  account_number: string;
  iban: string;
  swift: string;
  balance: number;
  currency: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference: string;
  date: string;
  bank_id?: number;
  bank?: Banque;
  category: string;
  status: "completed" | "pending" | "cancelled";
  created_at: string;
  updated_at: string;
}

// Query params pour les listes
export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}
