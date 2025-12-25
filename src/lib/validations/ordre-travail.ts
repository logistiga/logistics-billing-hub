import { z } from "zod";

// Schéma de validation pour le transport
export const transportSchema = z.object({
  transportType: z.string().min(1, "Le type de transport est requis"),
  pointDepart: z.string().trim().min(1, "Le point de départ est requis"),
  pointArrivee: z.string().trim().min(1, "Le point d'arrivée est requis"),
  dateEnlevement: z.string().optional(),
  dateLivraison: z.string().optional(),
  numeroConnaissement: z.string().optional(),
  numeroConteneur: z.string().optional(),
  compagnieMaritime: z.string().optional(),
  navire: z.string().optional(),
  transitaire: z.string().optional(),
  representant: z.string().optional(),
  primeTransitaire: z.string().optional(),
  destinationFinale: z.string().optional(),
  numeroBooking: z.string().optional(),
  poidsTotal: z.string().optional(),
  dimensions: z.string().optional(),
  typeEscorte: z.string().optional(),
  autorisationSpeciale: z.string().optional(),
});

// Schéma de validation pour une ligne de prestation
export const lignePrestationSchema = z.object({
  operationType: z.string(),
  description: z.string().max(500, "La description est trop longue (max 500 caractères)").optional(),
  numeroConteneur: z.string().max(50, "Le numéro de conteneur est trop long").optional(),
  quantite: z.number().min(0, "La quantité doit être positive"),
  prixUnit: z.number().min(0, "Le prix unitaire doit être positif"),
  total: z.number().min(0),
});

// Schéma principal pour l'ordre de travail
export const ordreTravailSchema = z.object({
  clientId: z.string().min(1, "Veuillez sélectionner un client"),
  description: z.string().max(1000, "La description est trop longue (max 1000 caractères)").optional(),
  hasTransport: z.boolean(),
  transportData: transportSchema.optional(),
  lignes: z.array(lignePrestationSchema),
  selectedTaxIds: z.array(z.number()).optional(),
}).refine(
  (data) => {
    // Au moins une opération ou transport activé
    const hasOperations = data.lignes.some(l => l.operationType !== "none");
    return data.hasTransport || hasOperations;
  },
  {
    message: "Veuillez activer le transport ou ajouter au moins une prestation",
    path: ["hasAnyService"],
  }
).refine(
  (data) => {
    // Si transport activé, vérifier les champs requis
    if (data.hasTransport && data.transportData) {
      return data.transportData.pointDepart.trim().length > 0 && 
             data.transportData.pointArrivee.trim().length > 0;
    }
    return true;
  },
  {
    message: "Les points de départ et d'arrivée sont requis pour le transport",
    path: ["transportData"],
  }
);

export type OrdreTravailFormData = z.infer<typeof ordreTravailSchema>;

// Fonction helper pour valider le formulaire
export function validateOrdreTravail(data: {
  clientId: string;
  description: string;
  hasTransport: boolean;
  transportData: any;
  lignes: any[];
  selectedTaxIds?: number[];
}): { success: boolean; errors: string[] } {
  const result = ordreTravailSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: [] };
  }
  
  const errors = result.error.errors.map(err => err.message);
  return { success: false, errors };
}

// Validation simplifiée pour afficher les erreurs individuellement
export function getFieldErrors(data: {
  clientId: string;
  description: string;
  hasTransport: boolean;
  transportData: any;
  lignes: any[];
}): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Client requis
  if (!data.clientId || data.clientId.trim() === "") {
    errors.clientId = "Veuillez sélectionner un client";
  }
  
  // Description trop longue
  if (data.description && data.description.length > 1000) {
    errors.description = "La description est trop longue (max 1000 caractères)";
  }
  
  // Transport validations
  if (data.hasTransport && data.transportData) {
    if (!data.transportData.pointDepart || data.transportData.pointDepart.trim() === "") {
      errors.pointDepart = "Le point de départ est requis";
    }
    if (!data.transportData.pointArrivee || data.transportData.pointArrivee.trim() === "") {
      errors.pointArrivee = "Le point d'arrivée est requis";
    }
  }
  
  // Au moins une prestation ou transport
  const hasOperations = data.lignes.some(l => l.operationType !== "none");
  if (!data.hasTransport && !hasOperations) {
    errors.hasAnyService = "Veuillez activer le transport ou ajouter au moins une prestation";
  }
  
  return errors;
}
