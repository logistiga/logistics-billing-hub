// Types et constantes pour les ordres de travail

export interface LignePrestation {
  operationType: string;
  numeroConteneur: string;
  numeroLot: string;
  numeroOperation: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  quantite: number;
  prixUnit: number;
  total: number;
}

export interface TransportData {
  transportType: string;
  pointDepart: string;
  pointArrivee: string;
  dateEnlevement: string;
  dateLivraison: string;
  // Import
  numeroConnaissement: string;
  compagnieMaritime: string;
  navire: string;
  transitaire: string;
  representant: string;
  primeTransitaire: number;
  // Export
  destinationFinale: string;
  numeroBooking: string;
  // Exceptionnel
  poidsTotal: string;
  dimensions: string;
  typeEscorte: string;
  autorisationSpeciale: string;
}

export const transportSubTypes = [
  { key: "import", label: "Import sur Libreville" },
  { key: "export", label: "Export" },
  { key: "vrac", label: "Transport en vrac" },
  { key: "hors-lbv", label: "Hors Libreville" },
  { key: "exceptionnel", label: "Exceptionnel" },
];

export const operationTypes = [
  { key: "none", label: "-- Sélectionner --", category: null },
  { key: "manutention-chargement", label: "Chargement/Déchargement", category: "Manutention" },
  { key: "manutention-empotage", label: "Empotage/Dépotage", category: "Manutention" },
  { key: "manutention-autre", label: "Autre manutention", category: "Manutention" },
  { key: "stockage-entrepot", label: "Entrepôt sécurisé", category: "Stockage" },
  { key: "stockage-plein-air", label: "Stockage plein air", category: "Stockage" },
  { key: "location-engin", label: "Location engin", category: "Location" },
  { key: "location-vehicule", label: "Location véhicule", category: "Location" },
];

export const createEmptyLigne = (): LignePrestation => ({
  operationType: "none",
  numeroConteneur: "",
  numeroLot: "",
  numeroOperation: "",
  dateDebut: "",
  dateFin: "",
  description: "",
  quantite: 1,
  prixUnit: 0,
  total: 0,
});

export const createEmptyTransportData = (): TransportData => ({
  transportType: "import",
  pointDepart: "",
  pointArrivee: "",
  dateEnlevement: "",
  dateLivraison: "",
  numeroConnaissement: "",
  compagnieMaritime: "",
  navire: "",
  transitaire: "",
  representant: "",
  primeTransitaire: 0,
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
  return clients.find(c => c.key === key)?.label || key;
};
