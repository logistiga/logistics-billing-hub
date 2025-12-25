import { useState, useCallback, useMemo } from "react";
import {
  LignePrestation,
  TransportData,
  createEmptyLigne,
  createEmptyTransportData,
  transportSubTypes,
} from "@/components/ordre-travail/types";
import { type Client } from "@/services/api";
import { type TaxAPI } from "@/services/api/taxes.service";

export interface OrdreTravailFormState {
  clientId: string;
  description: string;
  hasTransport: boolean;
  transportData: TransportData;
  lignes: LignePrestation[];
  selectedTaxIds: number[];
  formErrors: Record<string, string>;
}

export interface OrdreTravailFormActions {
  setClientId: (id: string) => void;
  setDescription: (desc: string) => void;
  setHasTransport: (value: boolean) => void;
  setTransportData: React.Dispatch<React.SetStateAction<TransportData>>;
  handleTransportChange: (field: keyof TransportData, value: string | number) => void;
  setLignes: (lignes: LignePrestation[]) => void;
  setSelectedTaxIds: (ids: number[]) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clearFieldError: (field: string) => void;
  resetForm: () => void;
  restoreFromDraft: (data: DraftData) => void;
}

export interface DraftData {
  clientId: string;
  description: string;
  hasTransport: boolean;
  transportData: TransportData;
  lignes: LignePrestation[];
}

export interface OrdreTravailFormHelpers {
  hasOperations: boolean;
  hasAnyService: boolean;
  subtotal: number;
  calculateTaxAmount: (tax: TaxAPI) => number;
  totalTTC: (taxes: TaxAPI[]) => number;
  getPrimaryType: () => "Transport" | "Manutention" | "Stockage" | "Location";
  getClientName: (clients: Client[]) => string;
  draftData: DraftData;
  getPdfData: (clients: Client[]) => Record<string, any>;
}

interface UseOrdreTravailFormOptions {
  defaultTaxIds?: number[];
}

export function useOrdreTravailForm(options: UseOrdreTravailFormOptions = {}) {
  const { defaultTaxIds = [] } = options;

  // Form state
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [hasTransport, setHasTransport] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>(createEmptyTransportData());
  const [lignes, setLignes] = useState<LignePrestation[]>([createEmptyLigne()]);
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>(defaultTaxIds);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Transport change handler
  const handleTransportChange = useCallback((field: keyof TransportData, value: string | number) => {
    setTransportData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((field: string) => {
    setFormErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setClientId("");
    setDescription("");
    setHasTransport(false);
    setTransportData(createEmptyTransportData());
    setLignes([createEmptyLigne()]);
    setSelectedTaxIds(defaultTaxIds);
    setFormErrors({});
  }, [defaultTaxIds]);

  // Restore from draft
  const restoreFromDraft = useCallback((data: DraftData) => {
    setClientId(data.clientId);
    setDescription(data.description);
    setHasTransport(data.hasTransport);
    setTransportData(data.transportData);
    setLignes(data.lignes);
  }, []);

  // Computed values
  const hasOperations = useMemo(() => lignes.some(l => l.operationType !== "none"), [lignes]);
  const hasAnyService = useMemo(() => hasTransport || hasOperations, [hasTransport, hasOperations]);
  const subtotal = useMemo(() => lignes.reduce((sum, l) => sum + l.total, 0), [lignes]);

  const calculateTaxAmount = useCallback((tax: TaxAPI) => {
    return Math.round(subtotal * tax.rate / 100);
  }, [subtotal]);

  const totalTTC = useCallback((taxes: TaxAPI[]) => {
    const totalTaxes = selectedTaxIds.reduce((sum, taxId) => {
      const tax = taxes.find(t => t.id === taxId);
      return sum + (tax ? Math.round(subtotal * tax.rate / 100) : 0);
    }, 0);
    return subtotal + totalTaxes;
  }, [subtotal, selectedTaxIds]);

  const getPrimaryType = useCallback((): "Transport" | "Manutention" | "Stockage" | "Location" => {
    if (hasTransport) return "Transport";
    const ops = lignes.map(l => l.operationType).filter(o => o !== "none");
    if (ops.some(o => o.startsWith("manutention"))) return "Manutention";
    if (ops.some(o => o.startsWith("stockage"))) return "Stockage";
    if (ops.some(o => o.startsWith("location"))) return "Location";
    return "Manutention";
  }, [hasTransport, lignes]);

  const getClientName = useCallback((clients: Client[]) => {
    const client = clients.find(c => String(c.id) === clientId);
    return client?.name || clientId;
  }, [clientId]);

  // Draft data for autosave
  const draftData = useMemo<DraftData>(() => ({
    clientId,
    description,
    hasTransport,
    transportData,
    lignes,
  }), [clientId, description, hasTransport, transportData, lignes]);

  // PDF data generator
  const getPdfData = useCallback((clients: Client[]) => ({
    type: getPrimaryType(),
    subType: hasTransport ? transportData.transportType : "",
    subTypeLabel: hasTransport ? transportSubTypes.find(st => st.key === transportData.transportType)?.label || "" : "",
    client: getClientName(clients),
    description,
    lignes: lignes.map(l => ({
      ...l,
      service: l.operationType.split("-")[0] || "autre"
    })),
    pointDepart: transportData.pointDepart,
    pointArrivee: transportData.pointArrivee,
    dateEnlevement: transportData.dateEnlevement,
    dateLivraison: transportData.dateLivraison,
    numeroConnaissement: transportData.numeroConnaissement,
    numeroConteneur: "",
    compagnieMaritime: transportData.compagnieMaritime,
    navire: transportData.navire,
    transitaire: transportData.transitaire,
    representant: transportData.representant,
    primeTransitaire: transportData.primeTransitaire,
    destinationFinale: transportData.destinationFinale,
    numeroBooking: transportData.numeroBooking,
    poidsTotal: transportData.poidsTotal,
    dimensions: transportData.dimensions,
    typeEscorte: transportData.typeEscorte,
    autorisationSpeciale: transportData.autorisationSpeciale,
    lieuPrestation: "",
    typeMarchandise: "",
    datePrestation: "",
    typeManutention: "",
    dateEntree: "",
    dateSortie: "",
    typeStockage: "",
    entrepot: "",
    surface: "",
    tarifJournalier: "",
    dateDebut: "",
    dateFin: "",
    typeEngin: "",
    typeVehicule: "",
    avecChauffeur: "",
    lieuUtilisation: "",
  }), [getPrimaryType, hasTransport, transportData, getClientName, description, lignes]);

  // State object
  const state: OrdreTravailFormState = {
    clientId,
    description,
    hasTransport,
    transportData,
    lignes,
    selectedTaxIds,
    formErrors,
  };

  // Actions object
  const actions: OrdreTravailFormActions = {
    setClientId,
    setDescription,
    setHasTransport,
    setTransportData,
    handleTransportChange,
    setLignes,
    setSelectedTaxIds,
    setFormErrors,
    clearFieldError,
    resetForm,
    restoreFromDraft,
  };

  // Helpers object
  const helpers: OrdreTravailFormHelpers = {
    hasOperations,
    hasAnyService,
    subtotal,
    calculateTaxAmount,
    totalTTC,
    getPrimaryType,
    getClientName,
    draftData,
    getPdfData,
  };

  return { state, actions, helpers };
}
