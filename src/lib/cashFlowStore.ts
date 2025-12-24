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

// Données initiales combinées
const generateInitialTransactions = (): CashTransaction[] => {
  const today = new Date();
  const transactions: CashTransaction[] = [];

  // Transactions passées (confirmées) - depuis Caisse
  const pastTransactions = [
    {
      id: "caisse-1",
      date: "2024-12-15",
      type: "encaissement" as const,
      categorie: "clients",
      description: "Règlement facture FAC-2024-001 - Total Gabon",
      montant: 2500000,
      reference: "CAI-001",
      client: "Total Gabon",
      facture: "FAC-2024-001",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Admin",
    },
    {
      id: "caisse-2",
      date: "2024-12-14",
      type: "decaissement" as const,
      categorie: "carburant",
      description: "Carburant véhicules - Décembre",
      montant: 450000,
      reference: "CAI-002",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Comptable",
    },
    {
      id: "caisse-3",
      date: "2024-12-13",
      type: "encaissement" as const,
      categorie: "acompte",
      description: "Acompte commande CMD-2024-015 - Comilog",
      montant: 1200000,
      reference: "CAI-003",
      client: "Comilog",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Admin",
    },
    {
      id: "caisse-4",
      date: "2024-12-12",
      type: "decaissement" as const,
      categorie: "fournitures",
      description: "Fournitures de bureau",
      montant: 125000,
      reference: "CAI-004",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Comptable",
    },
    {
      id: "caisse-5",
      date: "2024-12-11",
      type: "encaissement" as const,
      categorie: "clients",
      description: "Règlement facture FAC-2024-003 - Assala Energy",
      montant: 890000,
      reference: "CAI-005",
      client: "Assala Energy",
      facture: "FAC-2024-003",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Admin",
    },
    {
      id: "caisse-6",
      date: "2024-12-10",
      type: "decaissement" as const,
      categorie: "frais_divers",
      description: "Petit équipement bureau",
      montant: 85000,
      reference: "CAI-006",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Comptable",
    },
    {
      id: "caisse-7",
      date: "2024-12-20",
      type: "encaissement" as const,
      categorie: "vente",
      description: "Vente matériel occasion",
      montant: 350000,
      reference: "CAI-007",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Admin",
    },
    {
      id: "caisse-8",
      date: "2024-12-18",
      type: "decaissement" as const,
      categorie: "transport",
      description: "Frais de transport personnel",
      montant: 75000,
      reference: "CAI-008",
      status: "confirmed" as const,
      source: "caisse" as const,
      createdBy: "Comptable",
    },
  ];

  transactions.push(...pastTransactions);

  // Prévisions futures
  const futureEncaissements = [
    { client: "COMILOG SA", amount: 3250000, daysFromNow: 5, status: "confirmed" as const },
    { client: "OLAM Gabon", amount: 1875000, daysFromNow: 12, status: "expected" as const },
    { client: "Total Energies", amount: 5420000, daysFromNow: 18, status: "expected" as const },
    { client: "Assala Energy", amount: 2100000, daysFromNow: 25, status: "uncertain" as const },
    { client: "SEEG", amount: 890000, daysFromNow: 30, status: "expected" as const },
  ];

  const futureDecaissements = [
    { category: "salaires", description: "Paie décembre 2024", amount: 4500000, daysFromNow: 3, status: "confirmed" as const },
    { category: "fournisseurs", description: "Carburant PIZOLUB", amount: 1200000, daysFromNow: 7, status: "confirmed" as const },
    { category: "charges", description: "Loyer entrepôt", amount: 850000, daysFromNow: 10, status: "confirmed" as const },
    { category: "fournisseurs", description: "Pièces détachées", amount: 650000, daysFromNow: 15, status: "expected" as const },
    { category: "impots", description: "TVA T4 2024", amount: 2100000, daysFromNow: 20, status: "confirmed" as const },
  ];

  futureEncaissements.forEach((e, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + e.daysFromNow);
    transactions.push({
      id: `prev-enc-${i}`,
      type: "encaissement",
      categorie: "clients",
      description: `Paiement ${e.client}`,
      montant: e.amount,
      date: date.toISOString().split("T")[0],
      status: e.status,
      reference: `FAC-2024-${String(140 + i).padStart(4, "0")}`,
      client: e.client,
      source: "previsionnel",
    });
  });

  futureDecaissements.forEach((d, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + d.daysFromNow);
    transactions.push({
      id: `prev-dec-${i}`,
      type: "decaissement",
      categorie: d.category,
      description: d.description,
      montant: d.amount,
      date: date.toISOString().split("T")[0],
      status: d.status,
      reference: `DEC-2024-${String(i + 1).padStart(4, "0")}`,
      source: "previsionnel",
    });
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
