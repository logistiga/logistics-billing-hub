import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, FileText, Save, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { generateOrdrePDF } from "@/lib/generateOrdrePDF";
import { TransportSection } from "@/components/ordre-travail/TransportSection";
import { LignesPrestationSection } from "@/components/ordre-travail/LignesPrestationSection";
import { useAutosave } from "@/hooks/useAutosave";
import {
  LignePrestation,
  TransportData,
  createEmptyLigne,
  createEmptyTransportData,
  transportSubTypes,
} from "@/components/ordre-travail/types";
import { clientsService, ordresTravailService, devisService, type Client, type Devis } from "@/services/api";

interface DraftData {
  clientId: string;
  description: string;
  hasTransport: boolean;
  transportData: TransportData;
  lignes: LignePrestation[];
}

// Mock des conteneurs existants pour les notes de débit
export const mockConteneurs: { numeroConteneur: string; ordreId: string; ordreNumber: string; client: string; type: string; date: string }[] = [];

export default function NouvelOrdreTravail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromDevisId = searchParams.get("fromDevis");
  const isDevisMode = searchParams.get("mode") === "devis";
  
  const [fromDevisNumber, setFromDevisNumber] = useState<string | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // API data
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client & Description
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");

  // Transport
  const [hasTransport, setHasTransport] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>(createEmptyTransportData());

  // Lignes de prestation
  const [lignes, setLignes] = useState<LignePrestation[]>([createEmptyLigne()]);

  // Charger les clients depuis l'API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const response = await clientsService.getAll({ per_page: 100 });
        setClients(response.data || []);
      } catch (error) {
        console.error("Erreur chargement clients:", error);
        toast.error("Erreur lors du chargement des clients");
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Charger le devis depuis l'API si fromDevisId
  useEffect(() => {
    const fetchDevis = async () => {
      if (!fromDevisId) return;
      
      try {
        const devis: Devis = await devisService.getById(parseInt(fromDevisId, 10));
        setFromDevisNumber(devis.number);
        setClientId(String(devis.client_id));
        setDescription(devis.description || "");
        
        if (devis.type === "Transport") {
          setHasTransport(true);
        }
        
        let opType = "none";
        if (devis.type === "Manutention") opType = "manutention-chargement";
        else if (devis.type === "Stockage") opType = "stockage-entrepot";
        else if (devis.type === "Location") opType = "location-engin";
        
        setLignes([{
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
  }, [fromDevisId]);

  // Données pour l'autosave
  const draftData = useMemo<DraftData>(() => ({
    clientId,
    description,
    hasTransport,
    transportData,
    lignes,
  }), [clientId, description, hasTransport, transportData, lignes]);

  // Callback pour restaurer le brouillon
  const handleRestore = useCallback((data: DraftData) => {
    setClientId(data.clientId);
    setDescription(data.description);
    setHasTransport(data.hasTransport);
    setTransportData(data.transportData);
    setLignes(data.lignes);
  }, []);

  // Hook d'autosave
  const { hasDraft, lastSaved, clearDraft, checkForDraft, restoreDraft } = useAutosave<DraftData>({
    key: "ordre-travail-draft",
    data: draftData,
    debounceMs: 1500,
    onRestore: handleRestore,
  });

  // Vérifier s'il y a un brouillon au chargement (seulement si pas de devis)
  useEffect(() => {
    if (!fromDevisId) {
      const draft = checkForDraft();
      if (draft && (draft.clientId || draft.description || draft.lignes.some(l => l.operationType !== "none"))) {
        setShowDraftDialog(true);
      }
    }
  }, [fromDevisId, checkForDraft]);

  const handleTransportChange = (field: keyof TransportData, value: string | number) => {
    setTransportData(prev => ({ ...prev, [field]: value }));
  };

  // Validation
  const hasOperations = lignes.some(l => l.operationType !== "none");
  const hasAnyService = hasTransport || hasOperations;

  // Helper pour obtenir le nom du client
  const getClientName = (id: string): string => {
    const client = clients.find(c => String(c.id) === id);
    return client?.name || id;
  };

  // Type principal pour le PDF
  const getPrimaryType = (): "Transport" | "Manutention" | "Stockage" | "Location" => {
    if (hasTransport) return "Transport";
    const ops = lignes.map(l => l.operationType).filter(o => o !== "none");
    if (ops.some(o => o.startsWith("manutention"))) return "Manutention";
    if (ops.some(o => o.startsWith("stockage"))) return "Stockage";
    if (ops.some(o => o.startsWith("location"))) return "Location";
    return "Manutention"; // Default
  };

  const handleGeneratePDF = () => {
    const pdfData = {
      type: getPrimaryType(),
      subType: hasTransport ? transportData.transportType : "",
      subTypeLabel: hasTransport ? transportSubTypes.find(st => st.key === transportData.transportType)?.label || "" : "",
      client: getClientName(clientId),
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
    };

    const doc = generateOrdrePDF(pdfData);
    doc.save(`ordre-travail-${getPrimaryType().toLowerCase()}-${Date.now()}.pdf`);
    toast.success("PDF généré avec succès");
  };

  const handleCreate = async () => {
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    if (!hasAnyService) {
      toast.error("Veuillez activer le transport ou ajouter une opération aux lignes");
      return;
    }

    setIsSubmitting(true);
    try {
      // Appeler l'API pour créer l'ordre de travail
      const ordreData = {
        client_id: parseInt(clientId, 10),
        date: new Date().toISOString().split("T")[0],
        type: getPrimaryType(),
        description: description || `Ordre de travail - ${getPrimaryType()}`,
        // Ajouter les données de transport et lignes selon la structure backend
        containers: lignes
          .filter(l => l.numeroConteneur)
          .map(l => ({
            numero: l.numeroConteneur,
            type: l.operationType,
            description: l.description,
          })),
      };

      const ordre = await ordresTravailService.create(ordreData);
      
      // Générer le PDF localement
      handleGeneratePDF();
      
      clearDraft(); // Supprimer le brouillon après création
      toast.success(`Ordre de travail ${ordre.number || ""} créé avec succès`);
      navigate("/ordres-travail");
    } catch (error: any) {
      console.error("Erreur création ordre:", error);
      toast.error(error?.message || "Erreur lors de la création de l'ordre de travail");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setClientId("");
    setDescription("");
    setHasTransport(false);
    setTransportData(createEmptyTransportData());
    setLignes([createEmptyLigne()]);
    clearDraft();
    toast.success("Formulaire réinitialisé");
  };

  return (
    <PageTransition>
      {/* Dialog pour restaurer le brouillon */}
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ordres-travail")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold text-foreground">
                {isDevisMode ? "Nouveau devis" : "Nouvel ordre de travail"}
              </h1>
              {fromDevisNumber && (
                <Badge className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30">
                  <FileText className="h-3 w-3 mr-1" />
                  Depuis {fromDevisNumber}
                </Badge>
              )}
              {lastSaved && (
                <Badge variant="outline" className="text-muted-foreground border-muted">
                  <Save className="h-3 w-3 mr-1" />
                  Brouillon sauvegardé
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Remplissez les informations du client, activez le transport si nécessaire, puis ajoutez vos lignes de prestation
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* Section 1: Client */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                Informations Client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select value={clientId} onValueChange={setClientId} disabled={isLoadingClients}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingClients ? "Chargement..." : "Sélectionner un client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description générale</Label>
                  <Textarea 
                    placeholder="Description de l'ordre de travail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Transport */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Transport
                </h3>
                <div className="flex items-center gap-3">
                  <Label htmlFor="transport-toggle" className="text-sm text-muted-foreground">
                    {hasTransport ? "Activé" : "Désactivé"}
                  </Label>
                  <Switch
                    id="transport-toggle"
                    checked={hasTransport}
                    onCheckedChange={setHasTransport}
                  />
                </div>
              </div>
              
              {!hasTransport && (
                <div className="border rounded-lg p-4 bg-muted/30 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Activez le transport si cet ordre inclut une prestation de transport
                  </p>
                </div>
              )}

              <AnimatePresence>
                {hasTransport && (
                  <TransportSection 
                    data={transportData} 
                    onChange={handleTransportChange} 
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Section 3: Lignes de prestation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                Lignes de prestation
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Manutention, Stockage, Location)
                </span>
              </h3>
              
              <LignesPrestationSection lignes={lignes} onChange={setLignes} isTransport={hasTransport} />
            </div>

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
                <Button variant="outline" onClick={handleGeneratePDF} disabled={!clientId || isSubmitting}>
                  <FileText className="h-4 w-4 mr-2" />
                  Aperçu PDF
                </Button>
                <Button variant="gradient" onClick={handleCreate} disabled={!clientId || isSubmitting}>
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
