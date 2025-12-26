import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Loader2, FileText, AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { generateOrdrePDF, type OrdreTravailData } from "@/lib/generateOrdrePDF";
import { 
  FormHeader, 
  ClientSection, 
  TransportToggleSection, 
  LignesPrestationWrapper 
} from "@/components/ordre-travail/shared";
import { createEmptyLigne, createEmptyTransportData } from "@/components/ordre-travail/types";
import { ordresTravailService } from "@/services/api";
import { 
  useOrdreTravailForm, 
  useOrdreTravailSubmit, 
  useOrdreTravailData 
} from "@/hooks/ordre-travail";

export default function EditerOrdreTravail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ordreId = id ? parseInt(id, 10) : null;

  const [isLoadingOrdre, setIsLoadingOrdre] = useState(true);
  const [ordreNumero, setOrdreNumero] = useState<string>("");
  const [existingContainers, setExistingContainers] = useState<
    Array<{ numero: string; type?: string | null; description?: string | null }>
  >([]);

  // Load API data
  const { clients, taxes, isLoadingClients, isLoadingTaxes } = useOrdreTravailData();

  // Form state and actions
  const { state, actions, helpers } = useOrdreTravailForm();

  // Submit handler
  const { isSubmitting, submit } = useOrdreTravailSubmit({
    mode: "edit",
    ordreId,
  });

  // Load existing ordre
  useEffect(() => {
    const fetchOrdre = async () => {
      if (!ordreId) {
        toast.error("ID d'ordre de travail invalide");
        navigate("/ordres-travail");
        return;
      }

      try {
        setIsLoadingOrdre(true);
        const ordre: any = await ordresTravailService.getById(ordreId);
        
        setOrdreNumero(ordre.numero || ordre.number || `OT-${ordre.id}`);
        actions.setClientId(String(ordre.client_id));
        actions.setDescription(ordre.description || "");
        
        // Transport
        const hasTransportFromApi = !!ordre.transport || ordre.type === "Transport";
        actions.setHasTransport(hasTransportFromApi);

        if (ordre.transport) {
          const parsedFromNotes = parseTransportNotes(ordre.transport.notes);
          actions.setTransportData({
            ...createEmptyTransportData(),
            transportType: ordre.transport.type || "import",
            pointDepart: ordre.transport.depart || "",
            pointArrivee: ordre.transport.arrivee || "",
            dateEnlevement: toDateInput(ordre.transport.date_depart),
            dateLivraison: toDateInput(ordre.transport.date_arrivee),
            ...parsedFromNotes,
          });
        }

        // Containers
        const containersFromApi = Array.isArray(ordre.containers) ? ordre.containers : [];
        setExistingContainers(
          containersFromApi.map((c: any) => ({
            numero: String(c.numero || "").toUpperCase(),
            type: c.type ?? null,
            description: c.description ?? null,
          }))
        );

        // Lignes de prestation
        const prestationLines = Array.isArray(ordre.lignes_prestations)
          ? ordre.lignes_prestations.map((l: any, idx: number) => {
              const quantite = Number(l.quantite ?? 1) || 1;
              const prixUnit = Number(l.prix_unitaire ?? 0) || 0;
              const matchingContainer = containersFromApi[idx];
              // Reconstituer le typeOperation depuis l'API
              const typeOp = l.type_operation && l.sous_type 
                ? `${l.type_operation.toLowerCase()}-${l.sous_type}`
                : defaultOperationTypeForOrdreType(ordre.type);
              return {
                ...createEmptyLigne(),
                typeOperation: typeOp,
                sousType: l.sous_type || "",
                description: l.description || "",
                quantite,
                prixUnit,
                total: quantite * prixUnit,
                numeroConteneur: matchingContainer ? String(matchingContainer.numero || "").toUpperCase() : "",
                pointDepart: l.point_depart || "",
                pointArrivee: l.point_arrivee || "",
                dateDebut: l.date_debut ? String(l.date_debut).slice(0, 10) : "",
                dateFin: l.date_fin ? String(l.date_fin).slice(0, 10) : "",
              };
            })
          : [];

        // Extra containers without associated prestations
        const usedContainerIndices = new Set(prestationLines.map((_: any, idx: number) => idx));
        const extraContainerLines = containersFromApi
          .filter((_: any, idx: number) => !usedContainerIndices.has(idx) && idx >= prestationLines.length)
          .map((c: any) => ({
            ...createEmptyLigne(),
            typeOperation: "none",
            numeroConteneur: String(c.numero || "").toUpperCase(),
            description: c.description || "",
          }));

        const nextLignes = [...prestationLines, ...extraContainerLines];
        actions.setLignes(nextLignes.length > 0 ? nextLignes : [createEmptyLigne()]);
        
        if (ordre.taxes && ordre.taxes.length > 0) {
          actions.setSelectedTaxIds(ordre.taxes.map((t: any) => t.id));
        }
        
        toast.success(`Ordre ${ordre.numero || ordre.id} chargé`);
      } catch (error: any) {
        console.error("Erreur chargement ordre:", error);
        toast.error("Impossible de charger l'ordre de travail");
        navigate("/ordres-travail");
      } finally {
        setIsLoadingOrdre(false);
      }
    };

    fetchOrdre();
  }, [ordreId, navigate, actions]);

  // Helper functions
  const toDateInput = (value?: string | null): string => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const parseTransportNotes = (notes?: string | null) => {
    const result: Record<string, string> = {};
    if (!notes) return result;

    const parts = String(notes).split("|").map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      const [rawKey, ...rest] = part.split(":");
      const key = (rawKey || "").trim().toLowerCase();
      const value = rest.join(":").trim();
      if (!value) continue;

      if (key.includes("connaissement")) result.numeroConnaissement = value;
      else if (key.includes("compagnie")) result.compagnieMaritime = value;
      else if (key.includes("navire")) result.navire = value;
      else if (key.includes("transitaire")) result.transitaire = value;
      else if (key.includes("représentant") || key.includes("representant")) result.representant = value;
    }
    return result;
  };

  const defaultOperationTypeForOrdreType = (ordreType?: string): string => {
    switch (ordreType) {
      case "Stockage": return "stockage-entrepot";
      case "Location": return "location-engin";
      case "Manutention":
      default: return "manutention-chargement";
    }
  };

  // PDF generation
  const handleGeneratePDF = () => {
    const pdfData = helpers.getPdfData(clients) as OrdreTravailData;
    const doc = generateOrdrePDF(pdfData);
    doc.save(`ordre-travail-${ordreNumero}-${Date.now()}.pdf`);
    toast.success("PDF généré avec succès");
  };

  // Submit form
  const handleUpdate = async () => {
    const result = await submit({ state, helpers, clients, existingContainers });
    if (!result.success && result.errors) {
      actions.setFormErrors(result.errors);
    }
  };

  // Tax toggle handler
  const handleTaxToggle = (taxId: number) => {
    if (state.selectedTaxIds.includes(taxId)) {
      actions.setSelectedTaxIds(state.selectedTaxIds.filter(id => id !== taxId));
    } else {
      actions.setSelectedTaxIds([...state.selectedTaxIds, taxId]);
    }
  };

  if (isLoadingOrdre) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Chargement de l'ordre de travail...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <FormHeader
          title="Modifier l'ordre de travail"
          subtitle="Modifiez les informations de l'ordre de travail"
          ordreNumero={ordreNumero}
        />

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* Validation errors */}
            {Object.keys(state.formErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(state.formErrors).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Section 1: Client */}
            <ClientSection
              clientId={state.clientId}
              description={state.description}
              clients={clients}
              isLoadingClients={isLoadingClients}
              onClientChange={actions.setClientId}
              onDescriptionChange={actions.setDescription}
              clientError={state.formErrors.clientId}
              onClearClientError={() => actions.clearFieldError("clientId")}
            />

            {/* Section 2: Transport */}
            <TransportToggleSection
              hasTransport={state.hasTransport}
              transportData={state.transportData}
              onToggle={actions.setHasTransport}
              onChange={actions.handleTransportChange}
            />

            {/* Section 3: Lignes de prestation */}
            <LignesPrestationWrapper
              lignes={state.lignes}
              hasTransport={state.hasTransport}
              showValidationErrors={Object.keys(state.formErrors).length > 0}
              taxes={taxes}
              selectedTaxIds={state.selectedTaxIds}
              isLoadingTaxes={isLoadingTaxes}
              subtotal={helpers.subtotal}
              onLignesChange={actions.setLignes}
              onTaxToggle={handleTaxToggle}
              calculateTaxAmount={helpers.calculateTaxAmount}
              totalTTC={helpers.totalTTC(taxes)}
            />

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t gap-4">
              <Button variant="outline" onClick={() => navigate("/ordres-travail")} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button variant="outline" onClick={handleGeneratePDF} disabled={!state.clientId || isSubmitting}>
                <FileText className="h-4 w-4 mr-2" />
                Aperçu PDF
              </Button>
              <Button variant="gradient" onClick={handleUpdate} disabled={!state.clientId || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
