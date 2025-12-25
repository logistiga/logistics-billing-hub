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

// Données vides - à remplacer par les données de la base de données
const initialCompagnies: CompagnieMaritime[] = [];
const initialTransitaires: Transitaire[] = [];
const initialRepresentants: Representant[] = [];

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