// Store partagé pour les mouvements de trésorerie (Caisse + Trésorerie prévisionnelle)

export interface CashTransaction {
  id: string;
  date: string;
  type: "encaissement" | "decaissement";
  categorie: string;
  description: string;
  montant: number;
  reference: string;
  client?: string;
  facture?: string;
  status: "confirmed" | "expected" | "uncertain";
  source: "caisse" | "banque" | "previsionnel";
  createdBy?: string;
  isManual?: boolean;
}

// Catégories d'encaissements
export const encaissementCategories = [
  { value: "clients", label: "Paiement client" },
  { value: "acompte", label: "Acompte" },
  { value: "remboursement", label: "Remboursement" },
  { value: "vente", label: "Vente" },
  { value: "subventions", label: "Subventions" },
  { value: "emprunts", label: "Emprunts" },
  { value: "autres", label: "Autres" },
];

// Catégories de décaissements
export const decaissementCategories = [
  { value: "salaires", label: "Salaires" },
  { value: "fournisseurs", label: "Fournisseurs" },
  { value: "carburant", label: "Carburant" },
  { value: "charges", label: "Charges fixes" },
  { value: "fournitures", label: "Fournitures" },
  { value: "transport", label: "Transport" },
  { value: "impots", label: "Impôts & Taxes" },
  { value: "investissements", label: "Investissements" },
  { value: "remboursements", label: "Remboursements" },
  { value: "frais_divers", label: "Frais divers" },
  { value: "autres", label: "Autres" },
];

// Données vides - à remplacer par les données de la base de données
const generateInitialTransactions = (): CashTransaction[] => {
  return [];
};

// Store simple en mémoire (sera remplacé par Supabase plus tard)
let cashTransactions: CashTransaction[] = generateInitialTransactions();
let listeners: (() => void)[] = [];

export const cashFlowStore = {
  getAll: () => cashTransactions,
  
  // Obtenir les transactions passées (pour Caisse)
  getPastTransactions: () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return cashTransactions.filter(t => new Date(t.date) <= today && t.status === "confirmed");
  },
  
  // Obtenir toutes les transactions pour la trésorerie prévisionnelle
  getAllForTresorerie: () => cashTransactions,
  
  // Obtenir les transactions futures (prévisions)
  getFutureTransactions: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return cashTransactions.filter(t => new Date(t.date) >= today);
  },

  add: (transaction: Omit<CashTransaction, "id">) => {
    const newTransaction: CashTransaction = {
      ...transaction,
      id: `txn-${Date.now()}`,
    };
    cashTransactions = [newTransaction, ...cashTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    listeners.forEach(l => l());
    return newTransaction;
  },

  update: (id: string, updates: Partial<CashTransaction>) => {
    cashTransactions = cashTransactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    listeners.forEach(l => l());
  },

  delete: (id: string) => {
    cashTransactions = cashTransactions.filter(t => t.id !== id);
    listeners.forEach(l => l());
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  // Calculer le solde actuel (somme des transactions confirmées passées)
  getCurrentBalance: () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return cashTransactions
      .filter(t => new Date(t.date) <= today && t.status === "confirmed")
      .reduce((sum, t) => {
        return sum + (t.type === "encaissement" ? t.montant : -t.montant);
      }, 0);
  },
};
