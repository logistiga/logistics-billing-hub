import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Save, RotateCcw, Trash2, Loader2, FileText, AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { generateOrdrePDF, type OrdreTravailData } from "@/lib/generateOrdrePDF";
import { 
  FormHeader, 
  ClientSection, 
  TransportToggleSection, 
  LignesPrestationWrapper 
} from "@/components/ordre-travail/shared";
import { useAutosave } from "@/hooks/useAutosave";
import { createEmptyLigne } from "@/components/ordre-travail/types";
import { devisService, type Devis } from "@/services/api";
import { 
  useOrdreTravailForm, 
  useOrdreTravailSubmit, 
  useOrdreTravailData,
  type DraftData 
} from "@/hooks/ordre-travail";

export default function NouvelOrdreTravail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromDevisId = searchParams.get("fromDevis");
  const isDevisMode = searchParams.get("mode") === "devis";
  
  const [fromDevisNumber, setFromDevisNumber] = useState<string | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Load API data
  const { clients, taxes, isLoadingClients, isLoadingTaxes, getDefaultTaxIds } = useOrdreTravailData();

  // Form state and actions
  const { state, actions, helpers } = useOrdreTravailForm({
    defaultTaxIds: getDefaultTaxIds(),
  });

  // Update default taxes when loaded
  useEffect(() => {
    if (!isLoadingTaxes && taxes.length > 0) {
      const defaultIds = getDefaultTaxIds();
      if (defaultIds.length > 0 && state.selectedTaxIds.length === 0) {
        actions.setSelectedTaxIds(defaultIds);
      }
    }
  }, [isLoadingTaxes, taxes, getDefaultTaxIds, state.selectedTaxIds.length, actions]);

  // Submit handler
  const { isSubmitting, submit } = useOrdreTravailSubmit({
    mode: "create",
    onSuccess: () => clearDraft(),
  });

  // Autosave
  const handleRestore = useCallback((data: DraftData) => {
    actions.restoreFromDraft(data);
  }, [actions]);

  const { lastSaved, clearDraft, checkForDraft, restoreDraft } = useAutosave<DraftData>({
    key: "ordre-travail-draft",
    data: helpers.draftData,
    debounceMs: 1500,
    onRestore: handleRestore,
  });

  // Check for draft on load (only if not from devis)
  useEffect(() => {
    if (!fromDevisId) {
      const draft = checkForDraft();
      if (draft && (draft.clientId || draft.description || draft.lignes.some(l => l.operationType !== "none"))) {
        setShowDraftDialog(true);
      }
    }
  }, [fromDevisId, checkForDraft]);

  // Load devis if fromDevisId
  useEffect(() => {
    const fetchDevis = async () => {
      if (!fromDevisId) return;
      
      try {
        const devis: Devis = await devisService.getById(parseInt(fromDevisId, 10));
        setFromDevisNumber(devis.number);
        actions.setClientId(String(devis.client_id));
        actions.setDescription(devis.description || "");
        
        if (devis.type === "Transport") {
          actions.setHasTransport(true);
        }
        
        let opType = "none";
        if (devis.type === "Manutention") opType = "manutention-chargement";
        else if (devis.type === "Stockage") opType = "stockage-entrepot";
        else if (devis.type === "Location") opType = "location-engin";
        
        actions.setLignes([{
          ...createEmptyLigne(),
          operationType: opType,
          description: `Prestation ${devis.type} - Réf. Devis ${devis.number}`,
          prixUnit: devis.amount || 0,
          total: devis.amount || 0
        }]);
        
        toast.success(`Données récupérées du devis ${devis.number}`);
      } catch (error) {
        console.error("Erreur chargement devis:", error);
        toast.error("Impossible de charger le devis");
      }
    };
    
    fetchDevis();
  }, [fromDevisId, actions]);

  // PDF generation
  const handleGeneratePDF = () => {
    const pdfData = helpers.getPdfData(clients) as OrdreTravailData;
    const doc = generateOrdrePDF(pdfData);
    doc.save(`ordre-travail-${helpers.getPrimaryType().toLowerCase()}-${Date.now()}.pdf`);
    toast.success("PDF généré avec succès");
  };

  // Submit form
  const handleCreate = async () => {
    const result = await submit({ state, helpers, clients });
    if (!result.success && result.errors) {
      actions.setFormErrors(result.errors);
    }
  };

  // Reset form
  const handleClearForm = () => {
    actions.resetForm();
    clearDraft();
    toast.success("Formulaire réinitialisé");
  };

  // Tax toggle handler
  const handleTaxToggle = (taxId: number) => {
    if (state.selectedTaxIds.includes(taxId)) {
      actions.setSelectedTaxIds(state.selectedTaxIds.filter(id => id !== taxId));
    } else {
      actions.setSelectedTaxIds([...state.selectedTaxIds, taxId]);
    }
  };

  return (
    <PageTransition>
      {/* Draft restore dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Brouillon trouvé
            </AlertDialogTitle>
            <AlertDialogDescription>
              Un brouillon d'ordre de travail a été trouvé. Voulez-vous le restaurer ou commencer un nouveau formulaire ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              clearDraft();
              setShowDraftDialog(false);
            }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Nouveau formulaire
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              restoreDraft();
              setShowDraftDialog(false);
            }}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurer le brouillon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <FormHeader
          title={isDevisMode ? "Nouveau devis" : "Nouvel ordre de travail"}
          subtitle="Remplissez les informations du client, activez le transport si nécessaire, puis ajoutez vos lignes de prestation"
          fromDevisNumber={fromDevisNumber}
          lastSaved={lastSaved}
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
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={handleClearForm}
                className="text-muted-foreground hover:text-destructive"
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate("/ordres-travail")} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button variant="outline" onClick={handleGeneratePDF} disabled={!state.clientId || isSubmitting}>
                  <FileText className="h-4 w-4 mr-2" />
                  Aperçu PDF
                </Button>
                <Button variant="gradient" onClick={handleCreate} disabled={!state.clientId || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'ordre"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
