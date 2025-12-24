// Store centralisé pour les partenaires (compagnies maritimes, transitaires, représentants)

export interface CompagnieMaritime {
  id: string;
  nom: string;
  code: string;
  pays: string;
  contact: string;
  telephone: string;
  email: string;
}

export interface Transitaire {
  id: string;
  nom: string;
  nif: string;
  rccm: string;
  adresse: string;
  telephone: string;
  email: string;
  prime: number;
}

export interface Representant {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  prime: number;
  transitaire?: string;
}

// Données initiales des compagnies maritimes
const initialCompagnies: CompagnieMaritime[] = [
  { id: "1", nom: "MSC", code: "MSCU", pays: "Suisse", contact: "Jean Martin", telephone: "+241 01 23 45 67", email: "contact@msc.ga" },
  { id: "2", nom: "Maersk", code: "MAEU", pays: "Danemark", contact: "Marie Dubois", telephone: "+241 01 23 45 68", email: "contact@maersk.ga" },
  { id: "3", nom: "CMA CGM", code: "CMAU", pays: "France", contact: "Pierre Nze", telephone: "+241 01 23 45 69", email: "contact@cmacgm.ga" },
  { id: "4", nom: "Hapag-Lloyd", code: "HLCU", pays: "Allemagne", contact: "Sophie Mba", telephone: "+241 01 23 45 70", email: "contact@hapag.ga" },
];

// Données initiales des transitaires
const initialTransitaires: Transitaire[] = [
  { id: "1", nom: "Trans Gabon Logistics", nif: "123456789", rccm: "GA-LBV-2020-B-1234", adresse: "Zone Portuaire Owendo", telephone: "+241 01 76 00 00", email: "contact@transgabon.ga", prime: 2.5 },
  { id: "2", nom: "Bolloré Transport & Logistics", nif: "987654321", rccm: "GA-LBV-2015-B-5678", adresse: "Port d'Owendo", telephone: "+241 01 76 01 01", email: "contact@bollore.ga", prime: 3.0 },
  { id: "3", nom: "SDV Gabon", nif: "456789123", rccm: "GA-LBV-2018-B-9012", adresse: "Libreville Centre", telephone: "+241 01 76 02 02", email: "contact@sdv.ga", prime: 2.0 },
];

// Données initiales des représentants
const initialRepresentants: Representant[] = [
  { id: "1", nom: "Ndong", prenom: "Jean-Paul", telephone: "+241 07 12 34 56", email: "jp.ndong@email.ga", prime: 1.5, transitaire: "Trans Gabon Logistics" },
  { id: "2", nom: "Obame", prenom: "Marie", telephone: "+241 07 12 34 57", email: "m.obame@email.ga", prime: 2.0, transitaire: "Bolloré Transport & Logistics" },
  { id: "3", nom: "Nguema", prenom: "Pierre", telephone: "+241 07 12 34 58", email: "p.nguema@email.ga", prime: 1.0 },
];

// Store
let compagnies: CompagnieMaritime[] = [...initialCompagnies];
let transitaires: Transitaire[] = [...initialTransitaires];
let representants: Representant[] = [...initialRepresentants];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// Snapshots pour useSyncExternalStore (doivent être stables entre les appels)
let compagniesSnapshot = compagnies;
let transitairesSnapshot = transitaires;
let representantsSnapshot = representants;

const updateSnapshots = () => {
  compagniesSnapshot = [...compagnies];
  transitairesSnapshot = [...transitaires];
  representantsSnapshot = [...representants];
};

export const partenaireStore = {
  // Compagnies Maritimes
  getCompagnies(): CompagnieMaritime[] {
    return compagniesSnapshot;
  },

  addCompagnie(compagnie: Omit<CompagnieMaritime, "id">): CompagnieMaritime {
    const newCompagnie: CompagnieMaritime = {
      ...compagnie,
      id: `comp-${Date.now()}`,
    };
    compagnies.push(newCompagnie);
    updateSnapshots();
    notifyListeners();
    return newCompagnie;
  },

  updateCompagnie(id: string, updates: Partial<CompagnieMaritime>): void {
    const index = compagnies.findIndex((c) => c.id === id);
    if (index !== -1) {
      compagnies[index] = { ...compagnies[index], ...updates };
      updateSnapshots();
      notifyListeners();
    }
  },

  deleteCompagnie(id: string): void {
    compagnies = compagnies.filter((c) => c.id !== id);
    updateSnapshots();
    notifyListeners();
  },

  // Transitaires
  getTransitaires(): Transitaire[] {
    return transitairesSnapshot;
  },

  addTransitaire(transitaire: Omit<Transitaire, "id">): Transitaire {
    const newTransitaire: Transitaire = {
      ...transitaire,
      id: `trans-${Date.now()}`,
    };
    transitaires.push(newTransitaire);
    updateSnapshots();
    notifyListeners();
    return newTransitaire;
  },

  updateTransitaire(id: string, updates: Partial<Transitaire>): void {
    const index = transitaires.findIndex((t) => t.id === id);
    if (index !== -1) {
      transitaires[index] = { ...transitaires[index], ...updates };
      updateSnapshots();
      notifyListeners();
    }
  },

  deleteTransitaire(id: string): void {
    transitaires = transitaires.filter((t) => t.id !== id);
    updateSnapshots();
    notifyListeners();
  },

  // Représentants
  getRepresentants(): Representant[] {
    return representantsSnapshot;
  },

  addRepresentant(representant: Omit<Representant, "id">): Representant {
    const newRepresentant: Representant = {
      ...representant,
      id: `rep-${Date.now()}`,
    };
    representants.push(newRepresentant);
    updateSnapshots();
    notifyListeners();
    return newRepresentant;
  },

  updateRepresentant(id: string, updates: Partial<Representant>): void {
    const index = representants.findIndex((r) => r.id === id);
    if (index !== -1) {
      representants[index] = { ...representants[index], ...updates };
      updateSnapshots();
      notifyListeners();
    }
  },

  deleteRepresentant(id: string): void {
    representants = representants.filter((r) => r.id !== id);
    updateSnapshots();
    notifyListeners();
  },

  // Abonnement aux changements
  subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // Réinitialiser
  reset(): void {
    compagnies = [...initialCompagnies];
    transitaires = [...initialTransitaires];
    representants = [...initialRepresentants];
    updateSnapshots();
    notifyListeners();
  },
};