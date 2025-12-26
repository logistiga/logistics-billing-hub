// Types et constantes pour les ordres de travail

export interface LignePrestation {
  typeOperation: string;
  sousType: string;
  numeroConteneur: string;
  numeroLot: string;
  numeroOperation: string;
  pointDepart: string;
  pointArrivee: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  quantite: number;
  prixUnit: number;
  total: number;
}

export interface BookingData {
  numeroBooking: string;
  numeroConnaissement: string;
  compagnieMaritime: string;
  navire: string;
  transitaire: string;
  representant: string;
  nombreConteneurs: number;
  primeTransitaire: number;
  primeRepresentant: number;
  // Export specifics
  destinationFinale: string;
}

export interface OrdreTravailData {
  id?: number;
  numero?: string;
  clientId: string;
  date: string;
  type: string;
  description: string;
  booking: BookingData;
  lignes: LignePrestation[];
  selectedTaxIds: number[];
  // Integration externe
  source: 'internal' | 'external';
  externalId?: string;
  syncedAt?: string;
}

// Types d'opération principaux avec leurs sous-types
export const operationCategories = [
  {
    key: "Transport",
    label: "Transport",
    icon: "Truck",
    color: "amber",
    sousTypes: [
      { key: "import", label: "Import sur Libreville" },
      { key: "export", label: "Export" },
      { key: "vrac", label: "Transport en vrac" },
      { key: "hors-lbv", label: "Hors Libreville" },
      { key: "exceptionnel", label: "Exceptionnel" },
    ],
  },
  {
    key: "Manutention",
    label: "Manutention",
    icon: "Forklift",
    color: "blue",
    sousTypes: [
      { key: "chargement", label: "Chargement" },
      { key: "dechargement", label: "Déchargement" },
      { key: "empotage", label: "Empotage" },
      { key: "depotage", label: "Dépotage" },
      { key: "autre", label: "Autre manutention" },
    ],
  },
  {
    key: "Stockage",
    label: "Stockage",
    icon: "Warehouse",
    color: "purple",
    sousTypes: [
      { key: "entrepot", label: "Entrepôt sécurisé" },
      { key: "plein-air", label: "Stockage plein air" },
      { key: "frigorifique", label: "Stockage frigorifique" },
      { key: "dangereux", label: "Marchandises dangereuses" },
    ],
  },
  {
    key: "Location",
    label: "Location",
    icon: "Car",
    color: "green",
    sousTypes: [
      { key: "engin", label: "Location engin" },
      { key: "vehicule", label: "Location véhicule" },
      { key: "grue", label: "Location grue" },
      { key: "chariot", label: "Location chariot élévateur" },
    ],
  },
];

// Sous-types de transport (compatibilité)
export const transportSubTypes = operationCategories
  .find((c) => c.key === "Transport")
  ?.sousTypes || [];

// Liste plate des types d'opération pour le select existant
export const operationTypes = [
  { key: "none", label: "-- Sélectionner --", category: null },
  ...operationCategories.flatMap((cat) =>
    cat.sousTypes.map((st) => ({
      key: `${cat.key.toLowerCase()}-${st.key}`,
      label: st.label,
      category: cat.key,
    }))
  ),
];

export const createEmptyLigne = (): LignePrestation => ({
  typeOperation: "none",
  sousType: "",
  numeroConteneur: "",
  numeroLot: "",
  numeroOperation: "",
  pointDepart: "",
  pointArrivee: "",
  dateDebut: "",
  dateFin: "",
  description: "",
  quantite: 1,
  prixUnit: 0,
  total: 0,
});

export const createEmptyBookingData = (): BookingData => ({
  numeroBooking: "",
  numeroConnaissement: "",
  compagnieMaritime: "",
  navire: "",
  transitaire: "",
  representant: "",
  nombreConteneurs: 0,
  primeTransitaire: 0,
  primeRepresentant: 0,
  destinationFinale: "",
});

// Compatibilité avec l'ancien TransportData
export interface TransportData {
  transportType: string;
  pointDepart: string;
  pointArrivee: string;
  dateEnlevement: string;
  dateLivraison: string;
  // Import
  numeroConnaissement: string;
  numeroConteneur: string;
  compagnieMaritime: string;
  navire: string;
  transitaire: string;
  representant: string;
  primeTransitaire: number;
  primeRepresentant: number;
  // Export
  destinationFinale: string;
  numeroBooking: string;
  // Exceptionnel
  poidsTotal: string;
  dimensions: string;
  typeEscorte: string;
  autorisationSpeciale: string;
}

export const createEmptyTransportData = (): TransportData => ({
  transportType: "import",
  pointDepart: "",
  pointArrivee: "",
  dateEnlevement: "",
  dateLivraison: "",
  numeroConnaissement: "",
  numeroConteneur: "",
  compagnieMaritime: "",
  navire: "",
  transitaire: "",
  representant: "",
  primeTransitaire: 0,
  primeRepresentant: 0,
  destinationFinale: "",
  numeroBooking: "",
  poidsTotal: "",
  dimensions: "",
  typeEscorte: "",
  autorisationSpeciale: "",
});

export const clients = [
  { key: "comilog", label: "COMILOG SA" },
  { key: "olam", label: "OLAM Gabon" },
  { key: "total", label: "Total Energies" },
  { key: "assala", label: "Assala Energy" },
  { key: "seeg", label: "SEEG" },
];

export const getClientName = (key: string): string => {
  return clients.find((c) => c.key === key)?.label || key;
};

// Helper pour déterminer les champs à afficher selon le type d'opération
export const getFieldsForOperationType = (typeOperation: string) => {
  if (typeOperation === "none") {
    return { showConteneur: false, showLot: false, showOperation: false, showDates: false, showPoints: false };
  }
  
  const [category] = typeOperation.split("-");
  
  switch (category) {
    case "transport":
      return { showConteneur: true, showLot: false, showOperation: false, showDates: false, showPoints: true };
    case "manutention":
      return { showConteneur: true, showLot: true, showOperation: false, showDates: false, showPoints: false };
    case "stockage":
      return { showConteneur: true, showLot: true, showOperation: false, showDates: true, showPoints: false };
    case "location":
      return { showConteneur: false, showLot: false, showOperation: true, showDates: true, showPoints: false };
    default:
      return { showConteneur: false, showLot: false, showOperation: false, showDates: false, showPoints: false };
  }
};

// Helper pour obtenir la catégorie principale d'un type d'opération
export const getCategoryFromOperationType = (typeOperation: string): string | null => {
  if (typeOperation === "none") return null;
  const [category] = typeOperation.split("-");
  return category ? category.charAt(0).toUpperCase() + category.slice(1) : null;
};
