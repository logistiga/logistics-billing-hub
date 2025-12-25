import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ordresTravailService } from "@/services/api";
import { getFieldErrors } from "@/lib/validations/ordre-travail";
import { generateOrdrePDF, type OrdreTravailData } from "@/lib/generateOrdrePDF";
import type { OrdreTravailFormState, OrdreTravailFormHelpers } from "./useOrdreTravailForm";
import type { Client } from "@/services/api";

interface UseOrdreTravailSubmitOptions {
  mode: "create" | "edit";
  ordreId?: number | null;
  onSuccess?: () => void;
}

interface SubmitPayload {
  state: OrdreTravailFormState;
  helpers: OrdreTravailFormHelpers;
  clients: Client[];
  existingContainers?: Array<{ numero: string; type?: string | null; description?: string | null }>;
}

export function useOrdreTravailSubmit(options: UseOrdreTravailSubmitOptions) {
  const { mode, ordreId, onSuccess } = options;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildPayload = useCallback((
    state: OrdreTravailFormState, 
    helpers: OrdreTravailFormHelpers,
    existingContainers: Array<{ numero: string; type?: string | null; description?: string | null }> = []
  ) => {
    const { clientId, description, hasTransport, transportData, lignes, selectedTaxIds } = state;
    const { getPrimaryType } = helpers;

    // Build containers from lignes
    const containersFromLignes = lignes
      .filter(l => !!l.numeroConteneur)
      .map(l => ({
        numero: l.numeroConteneur,
        type: l.operationType || null,
        description: l.description || null,
      }));

    // Build container from transport
    const containersFromTransport = hasTransport && transportData.numeroConteneur
      ? [{
          numero: transportData.numeroConteneur,
          type: `transport-${transportData.transportType}`,
          description: "Conteneur transport",
        }]
      : [];

    // Merge and dedupe containers
    const mergedContainers = [...existingContainers, ...containersFromLignes, ...containersFromTransport]
      .filter(c => !!c.numero && String(c.numero).trim().length > 0);

    const uniqueContainers = Array.from(
      new Map(
        mergedContainers.map(c => {
          const numero = String(c.numero).trim().toUpperCase();
          return [numero, { ...c, numero }];
        })
      ).values()
    );

    // Build ordre data
    const ordreData: Record<string, any> = {
      client_id: parseInt(clientId, 10),
      date: new Date().toISOString().split("T")[0],
      type: getPrimaryType(),
      description: description || `Ordre de travail - ${getPrimaryType()}`,
      containers: uniqueContainers,
      lignes_prestations: lignes
        .filter(l => l.operationType !== "none" || (l.prixUnit > 0 && l.quantite > 0))
        .map(l => ({
          description: l.description || (l.operationType !== "none" ? `Prestation ${l.operationType}` : "Prestation"),
          quantite: l.quantite || 1,
          prix_unitaire: l.prixUnit || 0,
        })),
      tax_ids: selectedTaxIds,
    };

    // Add transport if enabled
    if (hasTransport) {
      const transportNotes = [
        transportData.numeroConnaissement && `Connaissement: ${transportData.numeroConnaissement}`,
        transportData.compagnieMaritime && `Compagnie: ${transportData.compagnieMaritime}`,
        transportData.navire && `Navire: ${transportData.navire}`,
        transportData.transitaire && `Transitaire: ${transportData.transitaire}`,
        transportData.representant && `Représentant: ${transportData.representant}`,
      ].filter(Boolean).join(" | ");

      ordreData.transport = {
        type: transportData.transportType,
        depart: transportData.pointDepart,
        arrivee: transportData.pointArrivee,
        date_depart: transportData.dateEnlevement || null,
        date_arrivee: transportData.dateLivraison || null,
        notes: transportNotes || null,
      };
    } else if (mode === "edit") {
      // Explicitly remove transport when editing
      ordreData.transport = null;
    }

    return ordreData;
  }, [mode]);

  const validate = useCallback((state: OrdreTravailFormState): Record<string, string> => {
    const { clientId, description, hasTransport, transportData, lignes } = state;
    return getFieldErrors({ clientId, description, hasTransport, transportData, lignes });
  }, []);

  const submit = useCallback(async ({ state, helpers, clients, existingContainers = [] }: SubmitPayload) => {
    // Validate
    const errors = validate(state);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return { success: false, errors };
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(state, helpers, existingContainers);

      let result: any;
      if (mode === "create") {
        result = await ordresTravailService.create(payload as any);
        
        // Generate PDF for new orders
        const pdfData = helpers.getPdfData(clients) as OrdreTravailData;
        const doc = generateOrdrePDF(pdfData);
        doc.save(`ordre-travail-${helpers.getPrimaryType().toLowerCase()}-${Date.now()}.pdf`);
      } else if (mode === "edit" && ordreId) {
        result = await ordresTravailService.update(ordreId, payload as any);
      }

      // Build success message
      const prestationsCount = Array.isArray(result?.lignes_prestations) ? result.lignes_prestations.length : 0;
      const containersCount = Array.isArray(result?.containers) ? result.containers.length : 0;
      const hasTransportSaved = !!result?.transport;
      const totalSaved = Number(result?.total ?? 0) || 0;
      const numero = result?.numero || result?.number || "";

      toast.success(`Ordre ${numero} enregistré`, {
        description: `Transport: ${hasTransportSaved ? "Oui" : "Non"} • Prestations: ${prestationsCount} • Conteneurs: ${containersCount} • Total: ${totalSaved.toLocaleString("fr-FR")} FCFA`,
      });

      onSuccess?.();
      navigate("/ordres-travail");

      return { success: true, data: result };
    } catch (error: any) {
      console.error(`Erreur ${mode === "create" ? "création" : "mise à jour"} ordre:`, error);
      toast.error(error?.message || `Erreur lors de ${mode === "create" ? "la création" : "la mise à jour"} de l'ordre de travail`);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, ordreId, navigate, buildPayload, validate, onSuccess]);

  return {
    isSubmitting,
    submit,
    validate,
  };
}
