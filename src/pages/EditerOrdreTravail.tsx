import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, FileText, Save, Loader2, AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateOrdrePDF } from "@/lib/generateOrdrePDF";
import { TransportSection } from "@/components/ordre-travail/TransportSection";
import { LignesPrestationSection } from "@/components/ordre-travail/LignesPrestationSection";
import {
  LignePrestation,
  TransportData,
  createEmptyLigne,
  createEmptyTransportData,
  transportSubTypes,
} from "@/components/ordre-travail/types";
import { clientsService, ordresTravailService, type Client } from "@/services/api";
import { taxesService, type TaxAPI } from "@/services/api/taxes.service";
import { getFieldErrors } from "@/lib/validations/ordre-travail";

export default function EditerOrdreTravail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ordreId = id ? parseInt(id, 10) : null;

  // État de chargement
  const [isLoadingOrdre, setIsLoadingOrdre] = useState(true);
  const [ordreNumero, setOrdreNumero] = useState<string>("");

  // API data
  const [clients, setClients] = useState<Client[]>([]);
  const [taxes, setTaxes] = useState<TaxAPI[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client & Description
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>([]);

  // Transport
  const [hasTransport, setHasTransport] = useState(false);
  const [hadTransportInitially, setHadTransportInitially] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>(createEmptyTransportData());

  // Conteneurs (persistés en base séparément des lignes)
  const [existingContainers, setExistingContainers] = useState<
    Array<{ numero: string; type?: string | null; description?: string | null }>
  >([]);

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

  // Charger les taxes depuis l'API
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setIsLoadingTaxes(true);
        const taxesList = await taxesService.getAll();
        const activeTaxes = taxesList.filter(t => t.is_active);
        setTaxes(activeTaxes);
      } catch (error) {
        console.error("Erreur chargement taxes:", error);
      } finally {
        setIsLoadingTaxes(false);
      }
    };
    fetchTaxes();
  }, []);

  // Charger l'ordre de travail existant
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
        
        // Remplir le formulaire avec les données existantes
        setOrdreNumero(ordre.numero || ordre.number || `OT-${ordre.id}`);
        setClientId(String(ordre.client_id));
        setDescription(ordre.description || "");
        
        // Transport
        const hasTransportFromApi = !!ordre.transport || ordre.type === "Transport";
        setHasTransport(hasTransportFromApi);
        setHadTransportInitially(!!ordre.transport);

        if (ordre.transport) {
          const parsedFromNotes = parseTransportNotes(ordre.transport.notes);
          setTransportData({
            ...createEmptyTransportData(),
            transportType: ordre.transport.type || "import",
            pointDepart: ordre.transport.depart || "",
            pointArrivee: ordre.transport.arrivee || "",
            dateEnlevement: toDateInput(ordre.transport.date_depart),
            dateLivraison: toDateInput(ordre.transport.date_arrivee),
            ...parsedFromNotes,
          });
        }

        // Conteneurs (on les garde en mémoire pour éviter de les écraser à la sauvegarde)
        const containersFromApi = Array.isArray(ordre.containers) ? ordre.containers : [];
        setExistingContainers(
          containersFromApi.map((c: any) => ({
            numero: String(c.numero || "").toUpperCase(),
            type: c.type ?? null,
            description: c.description ?? null,
          }))
        );

        // Lignes de prestation (API -> UI)
        const prestationLines: LignePrestation[] = Array.isArray(ordre.lignes_prestations)
          ? ordre.lignes_prestations.map((l: any) => {
              const quantite = Number(l.quantite ?? 1) || 1;
              const prixUnit = Number(l.prix_unitaire ?? 0) || 0;
              return {
                ...createEmptyLigne(),
                // Le backend ne stocke pas operationType: on met un défaut cohérent pour ne pas perdre les lignes
                operationType: defaultOperationTypeForOrdreType(ordre.type),
                description: l.description || "",
                quantite,
                prixUnit,
                total: quantite * prixUnit,
              };
            })
          : [];

        // Pour afficher les conteneurs existants dans le formulaire (sans les transformer en prestations)
        const containerLines: LignePrestation[] = containersFromApi.map((c: any) => ({
          ...createEmptyLigne(),
          operationType: "none",
          numeroConteneur: String(c.numero || "").toUpperCase(),
        }));

        const nextLignes = [...containerLines, ...prestationLines];
        setLignes(nextLignes.length > 0 ? nextLignes : [createEmptyLigne()]);
        if (ordre.taxes && ordre.taxes.length > 0) {
          const taxIds = ordre.taxes.map((t: any) => t.id);
          setSelectedTaxIds(taxIds);
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
  }, [ordreId, navigate]);

  const handleTransportChange = (field: keyof TransportData, value: string | number) => {
    setTransportData((prev) => ({ ...prev, [field]: value }));
  };

  const toDateInput = (value?: string | null): string => {
    if (!value) return "";
    // Accepte ISO "2025-12-25T..." ou "2025-12-25"
    return String(value).slice(0, 10);
  };

  const parseTransportNotes = (notes?: string | null) => {
    const result: Partial<TransportData> = {};
    if (!notes) return result;

    // Format attendu: "Connaissement: X | Compagnie: Y | Navire: Z | Transitaire: ... | Représentant: ..."
    const parts = String(notes)
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean);

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
      case "Stockage":
        return "stockage-entrepot";
      case "Location":
        return "location-engin";
      case "Manutention":
      default:
        return "manutention-chargement";
    }
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
    return "Manutention";
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
    doc.save(`ordre-travail-${ordreNumero}-${Date.now()}.pdf`);
    toast.success("PDF généré avec succès");
  };

  // État des erreurs de validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleUpdate = async () => {
    // Valider le formulaire
    const errors = getFieldErrors({
      clientId,
      description,
      hasTransport,
      transportData,
      lignes,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    setFormErrors({});

    if (!ordreId) {
      toast.error("ID d'ordre invalide");
      return;
    }

    setIsSubmitting(true);
    try {
      const containersFromLignes = lignes
        .filter((l) => !!l.numeroConteneur)
        .map((l) => ({
          numero: l.numeroConteneur,
          type: l.operationType || null,
          description: l.description || null,
        }));

      const containersFromTransport =
        hasTransport && transportData.numeroConteneur
          ? [
              {
                numero: transportData.numeroConteneur,
                type: `transport-${transportData.transportType}`,
                description: "Conteneur transport",
              },
            ]
          : [];

      const mergedContainers = [
        ...existingContainers,
        ...containersFromLignes,
        ...containersFromTransport,
      ].filter((c) => !!c.numero && String(c.numero).trim().length > 0);

      const uniqueContainers = Array.from(
        new Map(
          mergedContainers.map((c) => {
            const numero = String(c.numero).trim().toUpperCase();
            return [numero, { ...c, numero }];
          })
        ).values()
      );

      const ordreData: Record<string, any> = {
        client_id: parseInt(clientId, 10),
        type: getPrimaryType(),
        description: description || "",

        // Lignes de prestations
        lignes_prestations: lignes
          .filter((l) => l.operationType !== "none")
          .map((l) => ({
            description: l.description || `Prestation ${l.operationType}`,
            quantite: l.quantite,
            prix_unitaire: l.prixUnit,
          })),

        tax_ids: selectedTaxIds,
      };

      if (uniqueContainers.length > 0) {
        ordreData.containers = uniqueContainers;
      }

      // Si transport désactivé, on envoie null pour supprimer côté backend
      if (!hasTransport) {
        ordreData.transport = null;
      }

      // Transport si activé
      if (hasTransport) {
        const transportNotes = [
          transportData.numeroConnaissement && `Connaissement: ${transportData.numeroConnaissement}`,
          transportData.compagnieMaritime && `Compagnie: ${transportData.compagnieMaritime}`,
          transportData.navire && `Navire: ${transportData.navire}`,
          transportData.transitaire && `Transitaire: ${transportData.transitaire}`,
          transportData.representant && `Représentant: ${transportData.representant}`,
        ]
          .filter(Boolean)
          .join(" | ");

        ordreData.transport = {
          type: transportData.transportType,
          depart: transportData.pointDepart,
          arrivee: transportData.pointArrivee,
          date_depart: transportData.dateEnlevement || null,
          date_arrivee: transportData.dateLivraison || null,
          notes: transportNotes || null,
        };
      }

      await ordresTravailService.update(ordreId, ordreData as any);
      
      toast.success(`Ordre de travail ${ordreNumero} mis à jour avec succès`);
      navigate("/ordres-travail");
    } catch (error: any) {
      console.error("Erreur mise à jour ordre:", error);
      toast.error(error?.message || "Erreur lors de la mise à jour de l'ordre de travail");
    } finally {
      setIsSubmitting(false);
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ordres-travail")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Modifier l'ordre de travail
              </h1>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {ordreNumero}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Modifiez les informations de l'ordre de travail
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* Afficher les erreurs de validation */}
            {Object.keys(formErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(formErrors).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Section 1: Client */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                Informations Client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={formErrors.clientId ? "text-destructive" : ""}>Client *</Label>
                  <Select value={clientId} onValueChange={(v) => { setClientId(v); setFormErrors(prev => { const { clientId, ...rest } = prev; return rest; }); }} disabled={isLoadingClients}>
                    <SelectTrigger className={formErrors.clientId ? "border-destructive" : ""}>
                      <SelectValue placeholder={isLoadingClients ? "Chargement..." : "Sélectionner un client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.clientId && <p className="text-sm text-destructive">{formErrors.clientId}</p>}
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

              {/* Sélection des taxes et totaux */}
              <div className="border rounded-lg p-4 bg-muted/30 mt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Taxes applicables</Label>
                    {isLoadingTaxes ? (
                      <div className="text-muted-foreground text-sm">Chargement des taxes...</div>
                    ) : taxes.length === 0 ? (
                      <div className="text-muted-foreground text-sm">Aucune taxe configurée</div>
                    ) : (
                      <div className="space-y-2">
                        {taxes.map((tax) => (
                          <div key={tax.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tax-${tax.id}`}
                              checked={selectedTaxIds.includes(tax.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTaxIds([...selectedTaxIds, tax.id]);
                                } else {
                                  setSelectedTaxIds(selectedTaxIds.filter(id => id !== tax.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`tax-${tax.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {tax.name} ({tax.rate}%)
                              {tax.is_default && (
                                <Badge variant="secondary" className="ml-2 text-xs">Par défaut</Badge>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1 min-w-[200px]">
                    <div className="text-muted-foreground">
                      Sous-total HT: <span className="font-medium text-foreground">{lignes.reduce((sum, l) => sum + l.total, 0).toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    {selectedTaxIds.length > 0 && (() => {
                      const subtotal = lignes.reduce((sum, l) => sum + l.total, 0);
                      return selectedTaxIds.map(taxId => {
                        const tax = taxes.find(t => t.id === taxId);
                        if (!tax) return null;
                        const taxAmount = Math.round(subtotal * tax.rate / 100);
                        return (
                          <div key={taxId} className="text-muted-foreground">
                            {tax.name} ({tax.rate}%): <span className="font-medium text-foreground">{taxAmount.toLocaleString("fr-FR")} FCFA</span>
                          </div>
                        );
                      });
                    })()}
                    <div className="text-lg font-bold pt-2 border-t">
                      Total TTC: {(() => {
                        const subtotal = lignes.reduce((sum, l) => sum + l.total, 0);
                        const totalTaxes = selectedTaxIds.reduce((sum, taxId) => {
                          const tax = taxes.find(t => t.id === taxId);
                          return sum + (tax ? Math.round(subtotal * tax.rate / 100) : 0);
                        }, 0);
                        return (subtotal + totalTaxes).toLocaleString("fr-FR");
                      })()} FCFA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t gap-4">
              <Button variant="outline" onClick={() => navigate("/ordres-travail")} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button variant="outline" onClick={handleGeneratePDF} disabled={!clientId || isSubmitting}>
                <FileText className="h-4 w-4 mr-2" />
                Aperçu PDF
              </Button>
              <Button variant="gradient" onClick={handleUpdate} disabled={!clientId || isSubmitting}>
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
