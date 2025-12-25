// Store centralisé pour la gestion des avoirs (credit notes)

export interface Avoir {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  linkedInvoice?: string; // Optionnel pour les avoirs libres
  date: string;
  originalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: "disponible" | "partiellement_utilise" | "utilise" | "annule" | "rembourse";
  reason: string;
  createdBy: string;
  createdAt: string;
  // Champs pour le remboursement
  refundMethod?: "virement" | "especes" | "cheque";
  refundDate?: string;
  refundReference?: string;
}

export interface AvoirCompensation {
  id: string;
  date: string;
  avoirId: string;
  avoirNumber: string;
  avoirOriginalAmount: number;
  compensatedAmount: number;
  remainingAfter: number;
  documentId: string;
  documentNumber: string;
  documentType: "facture" | "ordre";
  clientId: string;
  clientName: string;
  paymentId: string;
  paymentMethod: string;
  operateur: string;
  notes?: string;
}

// Données initiales des avoirs
const initialAvoirs: Avoir[] = [
  {
    id: "av-001",
    number: "AV-2024-001",
    clientId: "1",
    clientName: "COMILOG SA",
    linkedInvoice: "FAC-2024-001",
    date: "2024-02-20",
    originalAmount: 500000,
    usedAmount: 0,
    remainingAmount: 500000,
    status: "disponible",
    reason: "Erreur de facturation",
    createdBy: "Jean Dupont",
    createdAt: "2024-02-20T10:00:00",
  },
  {
    id: "av-002",
    number: "AV-2024-002",
    clientId: "1",
    clientName: "COMILOG SA",
    linkedInvoice: "FAC-2024-008",
    date: "2024-03-25",
    originalAmount: 180000,
    usedAmount: 0,
    remainingAmount: 180000,
    status: "disponible",
    reason: "Retour de matériel",
    createdBy: "Marie Koumba",
    createdAt: "2024-03-25T14:30:00",
  },
  {
    id: "av-003",
    number: "AV-2024-003",
    clientId: "2",
    clientName: "Total Gabon",
    linkedInvoice: "FAC-2024-012",
    date: "2024-01-15",
    originalAmount: 1200000,
    usedAmount: 800000,
    remainingAmount: 400000,
    status: "partiellement_utilise",
    reason: "Réduction commerciale",
    createdBy: "Paul Mba",
    createdAt: "2024-01-15T09:00:00",
  },
  {
    id: "av-004",
    number: "AV-2024-004",
    clientId: "3",
    clientName: "SEEG",
    linkedInvoice: "FAC-2024-020",
    date: "2024-04-01",
    originalAmount: 350000,
    usedAmount: 350000,
    remainingAmount: 0,
    status: "utilise",
    reason: "Annulation prestation",
    createdBy: "Jean Dupont",
    createdAt: "2024-04-01T11:00:00",
  },
];

// Historique des compensations
let compensationsHistory: AvoirCompensation[] = [
  {
    id: "comp-001",
    date: "2024-01-20T10:30:00",
    avoirId: "av-003",
    avoirNumber: "AV-2024-003",
    avoirOriginalAmount: 1200000,
    compensatedAmount: 800000,
    remainingAfter: 400000,
    documentId: "fac-015",
    documentNumber: "FAC-2024-0089",
    documentType: "facture",
    clientId: "2",
    clientName: "Total Gabon",
    paymentId: "pay-001",
    paymentMethod: "Mixte (Avoir + Virement)",
    operateur: "Jean Dupont",
    notes: "Compensation partielle",
  },
  {
    id: "comp-002",
    date: "2024-04-05T14:15:00",
    avoirId: "av-004",
    avoirNumber: "AV-2024-004",
    avoirOriginalAmount: 350000,
    compensatedAmount: 350000,
    remainingAfter: 0,
    documentId: "fac-025",
    documentNumber: "FAC-2024-0156",
    documentType: "facture",
    clientId: "3",
    clientName: "SEEG",
    paymentId: "pay-002",
    paymentMethod: "Avoir uniquement",
    operateur: "Paul Mba",
    notes: "Compensation totale",
  },
];

// Store des avoirs
let avoirs: Avoir[] = [...initialAvoirs];
let listeners: (() => void)[] = [];

// Snapshots stables pour useSyncExternalStore (doivent garder la même référence tant que rien ne change)
let avoirsSnapshot: Avoir[] = [...avoirs];
let compensationsSnapshot: AvoirCompensation[] = [...compensationsHistory];

const updateSnapshots = () => {
  avoirsSnapshot = [...avoirs];
  compensationsSnapshot = [...compensationsHistory];
};

const notifyListeners = () => {
  updateSnapshots();
  listeners.forEach((listener) => listener());
};

export const avoirStore = {
  // Récupérer tous les avoirs (snapshot stable pour useSyncExternalStore)
  getAll(): Avoir[] {
    return avoirsSnapshot;
  },

  // Récupérer les avoirs d'un client
  getByClient(clientId: string): Avoir[] {
    return avoirs.filter((a) => a.clientId === clientId);
  },

  // Récupérer les avoirs disponibles d'un client (pour paiement)
  getAvailableByClient(clientId: string): Avoir[] {
    return avoirs.filter(
      (a) => a.clientId === clientId && 
      (a.status === "disponible" || a.status === "partiellement_utilise") &&
      a.remainingAmount > 0
    );
  },

  // Récupérer un avoir par ID
  getById(id: string): Avoir | undefined {
    return avoirs.find((a) => a.id === id);
  },

  // Appliquer une compensation (utiliser un avoir)
  applyCompensation(
    avoirId: string,
    amount: number,
    documentId: string,
    documentNumber: string,
    documentType: "facture" | "ordre",
    paymentId: string,
    paymentMethod: string,
    operateur: string = "Système",
    notes?: string
  ): { success: boolean; error?: string; updatedAvoir?: Avoir } {
    const avoir = avoirs.find((a) => a.id === avoirId);
    
    if (!avoir) {
      return { success: false, error: "Avoir non trouvé" };
    }

    if (avoir.status === "utilise" || avoir.status === "annule") {
      return { success: false, error: "Cet avoir n'est plus disponible" };
    }

    if (amount > avoir.remainingAmount) {
      return { 
        success: false, 
        error: `Montant demandé (${amount}) supérieur au solde disponible (${avoir.remainingAmount})` 
      };
    }

    if (amount <= 0) {
      return { success: false, error: "Le montant doit être positif" };
    }

    // Mettre à jour l'avoir
    const newUsedAmount = avoir.usedAmount + amount;
    const newRemainingAmount = avoir.originalAmount - newUsedAmount;
    
    // Déterminer le nouveau statut
    let newStatus: Avoir["status"];
    if (newRemainingAmount === 0) {
      newStatus = "utilise";
    } else if (newUsedAmount > 0) {
      newStatus = "partiellement_utilise";
    } else {
      newStatus = "disponible";
    }

    // Appliquer les modifications
    avoir.usedAmount = newUsedAmount;
    avoir.remainingAmount = newRemainingAmount;
    avoir.status = newStatus;

    // Créer l'entrée dans l'historique des compensations
    const compensation: AvoirCompensation = {
      id: `comp-${Date.now()}`,
      date: new Date().toISOString(),
      avoirId: avoir.id,
      avoirNumber: avoir.number,
      avoirOriginalAmount: avoir.originalAmount,
      compensatedAmount: amount,
      remainingAfter: newRemainingAmount,
      documentId,
      documentNumber,
      documentType,
      clientId: avoir.clientId,
      clientName: avoir.clientName,
      paymentId,
      paymentMethod,
      operateur,
      notes,
    };

    compensationsHistory.push(compensation);

    notifyListeners();

    return { success: true, updatedAvoir: { ...avoir } };
  },

  // Appliquer plusieurs compensations en une fois
  applyMultipleCompensations(
    compensations: Array<{ avoirId: string; amount: number }>,
    documentId: string,
    documentNumber: string,
    documentType: "facture" | "ordre",
    paymentId: string,
    paymentMethod: string,
    operateur?: string,
    notes?: string
  ): { success: boolean; errors: string[]; appliedCount: number } {
    const errors: string[] = [];
    let appliedCount = 0;

    for (const comp of compensations) {
      const result = this.applyCompensation(
        comp.avoirId,
        comp.amount,
        documentId,
        documentNumber,
        documentType,
        paymentId,
        paymentMethod,
        operateur,
        notes
      );

      if (result.success) {
        appliedCount++;
      } else {
        errors.push(`${comp.avoirId}: ${result.error}`);
      }
    }

    return { success: errors.length === 0, errors, appliedCount };
  },

  // Récupérer l'historique des compensations
  getCompensationsHistory(): AvoirCompensation[] {
    return compensationsSnapshot;
  },

  // Récupérer l'historique des compensations d'un client
  getCompensationsHistoryByClient(clientId: string): AvoirCompensation[] {
    return compensationsHistory.filter((c) => c.clientId === clientId);
  },

  // Récupérer l'historique des compensations d'un avoir
  getCompensationsHistoryByAvoir(avoirId: string): AvoirCompensation[] {
    return compensationsHistory.filter((c) => c.avoirId === avoirId);
  },

  // Créer un nouvel avoir
  create(
    avoir: Omit<Avoir, "id" | "usedAmount" | "remainingAmount" | "status" | "createdAt">
  ): Avoir {
    const newAvoir: Avoir = {
      ...avoir,
      id: `av-${Date.now()}`,
      usedAmount: 0,
      remainingAmount: avoir.originalAmount,
      status: "disponible",
      createdAt: new Date().toISOString(),
    };

    avoirs.push(newAvoir);
    notifyListeners();

    return newAvoir;
  },

  // Annuler un avoir
  cancel(avoirId: string): { success: boolean; error?: string } {
    const avoir = avoirs.find((a) => a.id === avoirId);
    
    if (!avoir) {
      return { success: false, error: "Avoir non trouvé" };
    }

    if (avoir.usedAmount > 0) {
      return { 
        success: false, 
        error: "Impossible d'annuler un avoir déjà partiellement ou totalement utilisé" 
      };
    }

    avoir.status = "annule";
    notifyListeners();

    return { success: true };
  },

  // Traiter un remboursement
  processRefund(
    avoirId: string,
    method: "virement" | "especes" | "cheque",
    reference?: string
  ): { success: boolean; error?: string; updatedAvoir?: Avoir } {
    const avoir = avoirs.find((a) => a.id === avoirId);

    if (!avoir) {
      return { success: false, error: "Avoir non trouvé" };
    }

    if (avoir.status === "utilise" || avoir.status === "rembourse") {
      return { success: false, error: "Cet avoir a déjà été traité" };
    }

    if (avoir.status === "annule") {
      return { success: false, error: "Impossible de rembourser un avoir annulé" };
    }

    if (avoir.usedAmount > 0) {
      return {
        success: false,
        error: "Impossible de rembourser un avoir partiellement utilisé en compensation"
      };
    }

    // Mettre à jour l'avoir
    avoir.status = "rembourse";
    avoir.refundMethod = method;
    avoir.refundDate = new Date().toISOString().split("T")[0];
    avoir.refundReference = reference;
    avoir.usedAmount = avoir.originalAmount;
    avoir.remainingAmount = 0;

    notifyListeners();

    return { success: true, updatedAvoir: { ...avoir } };
  },

  // S'abonner aux changements
  subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Réinitialiser (pour les tests)
  reset(): void {
    avoirs = [...initialAvoirs];
    compensationsHistory = [];
    notifyListeners();
  },
};

// Export des types pour le PaymentDialog
export type { AvoirCompensation as CompensationRecord };
