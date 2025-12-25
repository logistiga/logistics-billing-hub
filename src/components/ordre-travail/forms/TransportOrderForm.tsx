import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

import { ClientSelect, TaxesSection, FormActions } from "../shared";
import { TransportSection } from "../TransportSection";
import { LignesPrestationSection } from "../LignesPrestationSection";
import {
  LignePrestation,
  TransportData,
  createEmptyLigne,
  createEmptyTransportData,
  transportSubTypes,
} from "../types";

import { clientsService, ordresTravailService, type Client } from "@/services/api";
import { taxesService, type TaxAPI } from "@/services/api/taxes.service";
import { getFieldErrors } from "@/lib/validations/ordre-travail";
import { generateOrdrePDF } from "@/lib/generateOrdrePDF";

export default function TransportOrderForm() {
  const navigate = useNavigate();

  // API data
  const [clients, setClients] = useState<Client[]>([]);
  const [taxes, setTaxes] = useState<TaxAPI[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTaxIds, setSelectedTaxIds] = useState<number[]>([]);
  const [transportData, setTransportData] = useState<TransportData>(createEmptyTransportData());
  const [lignes, setLignes] = useState<LignePrestation[]>([createEmptyLigne()]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Charger les clients
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

  // Charger les taxes
  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        setIsLoadingTaxes(true);
        const taxesList = await taxesService.getAll();
        const activeTaxes = taxesList.filter((t) => t.is_active);
        setTaxes(activeTaxes);
        const defaultTaxIds = activeTaxes.filter((t) => t.is_default).map((t) => t.id);
        setSelectedTaxIds(defaultTaxIds);
      } catch (error) {
        console.error("Erreur chargement taxes:", error);
      } finally {
        setIsLoadingTaxes(false);
      }
    };
    fetchTaxes();
  }, []);

  const handleTransportChange = (field: keyof TransportData, value: string | number) => {
    setTransportData((prev) => ({ ...prev, [field]: value }));
  };

  const getClientName = (id: string): string => {
    const client = clients.find((c) => String(c.id) === id);
    return client?.name || id;
  };

  const subtotal = lignes.reduce((sum, l) => sum + l.total, 0);

  const handleGeneratePDF = () => {
    const pdfData = {
      type: "Transport" as const,
      subType: transportData.transportType,
      subTypeLabel: transportSubTypes.find((st) => st.key === transportData.transportType)?.label || "",
      client: getClientName(clientId),
      description,
      lignes: lignes.map((l) => ({
        ...l,
        service: l.operationType.split("-")[0] || "autre",
      })),
      pointDepart: transportData.pointDepart,
      pointArrivee: transportData.pointArrivee,
      dateEnlevement: transportData.dateEnlevement,
      dateLivraison: transportData.dateLivraison,
      numeroConnaissement: transportData.numeroConnaissement,
      numeroConteneur: transportData.numeroConteneur || "",
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
    doc.save(`ordre-transport-${Date.now()}.pdf`);
    toast.success("PDF généré avec succès");
  };

  const handleCreate = async () => {
    // Validation
    const errors = getFieldErrors({
      clientId,
      description,
      hasTransport: true,
      transportData,
      lignes,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const transportNotes = [
        transportData.numeroConnaissement && `Connaissement: ${transportData.numeroConnaissement}`,
        transportData.compagnieMaritime && `Compagnie: ${transportData.compagnieMaritime}`,
        transportData.navire && `Navire: ${transportData.navire}`,
        transportData.transitaire && `Transitaire: ${transportData.transitaire}`,
        transportData.representant && `Représentant: ${transportData.representant}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const ordreData = {
        client_id: parseInt(clientId, 10),
        date: new Date().toISOString().split("T")[0],
        type: "Transport" as const,
        description: description || "Ordre de travail - Transport",
        containers: [
          ...lignes
            .filter((l) => !!l.numeroConteneur)
            .map((l) => ({
              numero: l.numeroConteneur,
              type: l.operationType,
              description: l.description || null,
            })),
          ...(transportData.numeroConteneur
            ? [
                {
                  numero: transportData.numeroConteneur,
                  type: `transport-${transportData.transportType}`,
                  description: "Conteneur transport",
                },
              ]
            : []),
        ],
        lignes_prestations: lignes
          .filter((l) => l.operationType !== "none" || (l.prixUnit > 0 && l.quantite > 0))
          .map((l) => ({
            description: l.description || (l.operationType !== "none" ? `Prestation ${l.operationType}` : "Transport"),
            quantite: l.quantite || 1,
            prix_unitaire: l.prixUnit || 0,
          })),
        tax_ids: selectedTaxIds,
        transport: {
          type: transportData.transportType,
          depart: transportData.pointDepart,
          arrivee: transportData.pointArrivee,
          date_depart: transportData.dateEnlevement || null,
          date_arrivee: transportData.dateLivraison || null,
          notes: transportNotes || null,
        },
      };

      const ordre = await ordresTravailService.create(ordreData as any);

      handleGeneratePDF();
      toast.success(`Ordre Transport ${ordre.numero || ""} créé avec succès`);
      navigate("/ordres-travail");
    } catch (error: any) {
      console.error("Erreur création ordre transport:", error);
      toast.error(error?.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setClientId("");
    setDescription("");
    setTransportData(createEmptyTransportData());
    setLignes([createEmptyLigne()]);
    setFormErrors({});
    toast.success("Formulaire réinitialisé");
  };

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
              <Truck className="h-8 w-8 text-amber-600" />
              <h1 className="text-3xl font-heading font-bold text-foreground">
                Nouvel ordre - Transport
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Créez un ordre de travail pour une prestation de transport
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* Erreurs de validation */}
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
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  1
                </span>
                Informations Client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ClientSelect
                  value={clientId}
                  onChange={(v) => {
                    setClientId(v);
                    setFormErrors((prev) => {
                      const { clientId, ...rest } = prev;
                      return rest;
                    });
                  }}
                  clients={clients}
                  isLoading={isLoadingClients}
                  error={formErrors.clientId}
                />
                <div className="space-y-2">
                  <Label>Description générale</Label>
                  <Textarea
                    placeholder="Description de l'ordre de transport..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Transport (toujours visible pour ce formulaire) */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  2
                </span>
                Détails Transport
              </h3>
              <TransportSection data={transportData} onChange={handleTransportChange} />
            </div>

            {/* Section 3: Lignes de prestation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  3
                </span>
                Prestations et Tarification
              </h3>
              <LignesPrestationSection
                lignes={lignes}
                onChange={setLignes}
                isTransport={true}
                showValidationErrors={Object.keys(formErrors).length > 0}
              />

              {/* Taxes */}
              <TaxesSection
                taxes={taxes}
                selectedTaxIds={selectedTaxIds}
                onTaxChange={setSelectedTaxIds}
                isLoading={isLoadingTaxes}
                subtotal={subtotal}
              />
            </div>

            {/* Actions */}
            <FormActions
              onClear={handleClearForm}
              onCancel={() => navigate("/ordres-travail")}
              onPreviewPdf={handleGeneratePDF}
              onSubmit={handleCreate}
              isSubmitting={isSubmitting}
              canSubmit={!!clientId}
              submitLabel="Créer l'ordre Transport"
              submittingLabel="Création..."
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
