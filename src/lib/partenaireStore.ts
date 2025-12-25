// Store centralisé pour les partenaires (compagnies maritimes, transitaires, représentants)

export interface CompagnieMaritime {
  id: string;
  nom: string;
  code: string; // num_tc (type conteneur)
  pays: string;
  contact: string;
  telephone: string;
  email: string;
  prix: number; // Prix par jour
  jours: number; // Jours de franchise
}

export interface Transitaire {
  id: string;
  nom: string;
  compagnie: string;
  nif: string;
  rccm: string;
  adresse: string;
  telephone: string;
  email: string;
  prime: number;
  solde: number;
}

export interface Representant {
  id: string;
  nom: string;
  prenom: string;
  compagnie: string;
  telephone: string;
  email: string;
  adresse: string;
  prime: number;
  solde: number;
  transitaire?: string;
}

// Données initiales des compagnies maritimes (depuis SQL)
const initialCompagnies: CompagnieMaritime[] = [
  { id: "1", nom: "MSC", code: "40", pays: "", contact: "", telephone: "", email: "", prix: 1200, jours: 14 },
  { id: "2", nom: "MSC", code: "20", pays: "", contact: "", telephone: "", email: "", prix: 1200, jours: 14 },
  { id: "3", nom: "MSC", code: "Frigo", pays: "", contact: "", telephone: "", email: "", prix: 1200, jours: 14 },
  { id: "4", nom: "TSR", code: "20", pays: "", contact: "", telephone: "", email: "", prix: 18500, jours: 7 },
  { id: "5", nom: "TSR", code: "40", pays: "", contact: "", telephone: "", email: "", prix: 18500, jours: 7 },
  { id: "6", nom: "CMA CGM", code: "20", pays: "", contact: "", telephone: "", email: "", prix: 7500, jours: 3 },
  { id: "7", nom: "CMA CGM", code: "FRIGO 20", pays: "", contact: "", telephone: "", email: "", prix: 17500, jours: 3 },
  { id: "8", nom: "CMA-CGM", code: "40", pays: "", contact: "", telephone: "", email: "", prix: 17200, jours: 3 },
  { id: "9", nom: "MAERSK", code: "20", pays: "", contact: "", telephone: "", email: "", prix: 11800, jours: 7 },
  { id: "10", nom: "MAERSK", code: "40", pays: "", contact: "", telephone: "", email: "", prix: 23600, jours: 7 },
  { id: "11", nom: "MAERSK FRIGO", code: "20", pays: "", contact: "", telephone: "", email: "", prix: 5900, jours: 3 },
  { id: "12", nom: "MAERSK FRIGO", code: "40", pays: "", contact: "", telephone: "", email: "", prix: 118000, jours: 3 },
  { id: "13", nom: "HAPAG-LLOYD", code: "20", pays: "", contact: "", telephone: "", email: "", prix: 0, jours: 0 },
  { id: "14", nom: "HAPAG-LLOYD", code: "40", pays: "", contact: "", telephone: "", email: "", prix: 0, jours: 0 },
  { id: "15", nom: "AUCUN", code: "AUCUN", pays: "", contact: "", telephone: "", email: "", prix: 0, jours: 0 },
];

// Données initiales des transitaires (depuis SQL)
const initialTransitaires: Transitaire[] = [
  { id: "1", compagnie: "BOLLORE", nom: "BOLLORE", nif: "", rccm: "", adresse: "", telephone: "", email: "", prime: 0, solde: 0 },
  { id: "2", compagnie: "DHL", nom: "DHL", nif: "", rccm: "", adresse: "", telephone: "", email: "", prime: 0, solde: 0 },
  { id: "3", compagnie: "LSG", nom: "LSG", nif: "", rccm: "", adresse: "owendo", telephone: "011705726", email: "junior.yenda@lsg-gabon.com", prime: 0, solde: 0 },
  { id: "4", compagnie: "MAERSK", nom: "MAERSK", nif: "", rccm: "", adresse: "", telephone: "", email: "ga.import@maersk.com", prime: 0, solde: 0 },
  { id: "5", compagnie: "TMT", nom: "TMT", nif: "", rccm: "", adresse: "", telephone: "011707363", email: "contact@tmtransit.com", prime: 0, solde: 0 },
  { id: "6", compagnie: "ETL", nom: "ETL", nif: "", rccm: "", adresse: "", telephone: "+241 06614100", email: "commercial.etl241@gmail.com", prime: 0, solde: 0 },
  { id: "7", compagnie: "SGTA", nom: "SGTA", nif: "", rccm: "", adresse: "", telephone: "+241 07501242", email: "", prime: 0, solde: 0 },
  { id: "8", compagnie: "CATRAMAC", nom: "CATRAMAC", nif: "", rccm: "", adresse: "", telephone: "+241 06130554", email: "", prime: 0, solde: 0 },
  { id: "9", compagnie: "TATA SHIPING", nom: "TATA-SHIPING", nif: "", rccm: "", adresse: "", telephone: "077384071", email: "nomokongoma@yahoo.fr", prime: 0, solde: 0 },
  { id: "10", compagnie: "TRANSGAB", nom: "TRANSGAB", nif: "", rccm: "", adresse: "", telephone: "+241 77363618", email: "giggs504@yahoo.fr", prime: 0, solde: 0 },
  { id: "11", compagnie: "ART", nom: "A.R.T", nif: "", rccm: "", adresse: "owendo", telephone: "065998151", email: "k.moutsiga@artgabon.com", prime: 0, solde: 0 },
  { id: "12", compagnie: "FORMALIS", nom: "FORMALIS", nif: "", rccm: "", adresse: "lbv", telephone: "077534576", email: "drameramamadou2018@gmail.com", prime: 0, solde: 0 },
  { id: "13", compagnie: "INTER-TRANSIT GABON", nom: "INTER-TRANSIT GABON", nif: "", rccm: "", adresse: "", telephone: "+241 66004341", email: "intertransitgabon@gmail.com", prime: 0, solde: 0 },
  { id: "14", compagnie: "APRETRAC", nom: "APRETRAC", nif: "", rccm: "", adresse: "", telephone: "+241 66412221", email: "dissouchr@yahoo.fr", prime: 0, solde: 0 },
  { id: "15", compagnie: "TRANSEXPORT", nom: "TRANSEXPORT", nif: "", rccm: "", adresse: "LIBREVILLE", telephone: "", email: "TRANSEXPORT@GMAIL.COM", prime: 0, solde: 0 },
];

// Données initiales des représentants (depuis SQL)
const initialRepresentants: Representant[] = [
  { id: "1", compagnie: "MR. CHAOUKI", nom: "CHAOUKI", prenom: "", telephone: "+241 65303809", email: "CHAOUKI@LOGISTIGA.COM", adresse: "libreville gabon", prime: 0, solde: 0 },
  { id: "2", compagnie: "JUDE MOUTENDY", nom: "MOUTENDY", prenom: "JUDE", telephone: "0100000", email: "Jude@logistiga.com", adresse: "oloumi", prime: 0, solde: 0 },
  { id: "3", compagnie: "AUCUN", nom: "AUCUN", prenom: "", telephone: "", email: "", adresse: "", prime: 0, solde: 0 },
  { id: "4", compagnie: "LSG", nom: "JUNIOR/PRAXED", prenom: "", telephone: "", email: "", adresse: "", prime: 0, solde: 0 },
  { id: "5", compagnie: "ABOU", nom: "ABOU", prenom: "", telephone: "+241 66329007", email: "", adresse: "", prime: 0, solde: 0 },
  { id: "6", compagnie: "CONDUCTEUR", nom: "CONDUCTEUR", prenom: "", telephone: "", email: "", adresse: "", prime: 0, solde: 0 },
  { id: "7", compagnie: "PRESTATAIRE", nom: "PRESTATAIRE", prenom: "", telephone: "", email: "", adresse: "", prime: 0, solde: 0 },
  { id: "8", compagnie: "SIGALLI", nom: "BOUCHARD", prenom: "", telephone: "+241 077570703", email: "admin@logistiga.com", adresse: "LIBREVILLE", prime: 0, solde: 0 },
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
