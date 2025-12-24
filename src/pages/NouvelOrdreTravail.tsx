import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, FileText } from "lucide-react";
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
import { toast } from "sonner";
import { generateOrdrePDF } from "@/lib/generateOrdrePDF";
import { TransportSection } from "@/components/ordre-travail/TransportSection";
import { LignesPrestationSection } from "@/components/ordre-travail/LignesPrestationSection";
import {
  LignePrestation,
  TransportData,
  createEmptyLigne,
  createEmptyTransportData,
  clients,
  getClientName,
  transportSubTypes,
} from "@/components/ordre-travail/types";

// Mock des conteneurs existants pour les notes de débit
export const mockConteneurs: { numeroConteneur: string; ordreId: string; ordreNumber: string; client: string; type: string; date: string }[] = [];

// Mock devis data
const mockDevisData: Record<string, {
  id: string;
  number: string;
  client: string;
  clientKey: string;
  type: string;
  amount: number;
  description: string;
}> = {
  "1": { id: "1", number: "DEV-2024-0089", client: "COMILOG SA", clientKey: "comilog", type: "Transport", amount: 4500000, description: "Transport de marchandises vers Port-Gentil" },
  "2": { id: "2", number: "DEV-2024-0088", client: "OLAM Gabon", clientKey: "olam", type: "Manutention", amount: 2350000, description: "Chargement/déchargement au port d'Owendo" },
  "3": { id: "3", number: "DEV-2024-0087", client: "Total Energies", clientKey: "total", type: "Transport", amount: 6800000, description: "Transport exceptionnel de matériel pétrolier" },
  "4": { id: "4", number: "DEV-2024-0086", client: "Assala Energy", clientKey: "assala", type: "Stockage", amount: 1890000, description: "Stockage longue durée de matériaux" },
  "5": { id: "5", number: "DEV-2024-0085", client: "SEEG", clientKey: "seeg", type: "Location", amount: 750000, description: "Location d'engins de chantier" },
  "6": { id: "6", number: "DEV-2024-0084", client: "Perenco Oil", clientKey: "perenco", type: "Manutention", amount: 3200000, description: "Empotage de conteneurs" },
};

export default function NouvelOrdreTravail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromDevisId = searchParams.get("fromDevis");
  const isDevisMode = searchParams.get("mode") === "devis";
  
  const [fromDevisNumber, setFromDevisNumber] = useState<string | null>(null);

  // Client & Description
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");

  // Transport
  const [hasTransport, setHasTransport] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>(createEmptyTransportData());

  // Lignes de prestation
  const [lignes, setLignes] = useState<LignePrestation[]>([createEmptyLigne()]);

  // Pré-remplir depuis un devis
  useEffect(() => {
    if (fromDevisId && mockDevisData[fromDevisId]) {
      const devis = mockDevisData[fromDevisId];
      setFromDevisNumber(devis.number);
      setClient(devis.clientKey);
      setDescription(devis.description);
      
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
        prixUnit: devis.amount,
        total: devis.amount
      }]);
      
      toast.success(`Données récupérées du devis ${devis.number}`);
    }
  }, [fromDevisId]);

  const handleTransportChange = (field: keyof TransportData, value: string | number) => {
    setTransportData(prev => ({ ...prev, [field]: value }));
  };

  // Validation
  const hasOperations = lignes.some(l => l.operationType !== "none");
  const hasAnyService = hasTransport || hasOperations;

  // Type principal pour le PDF
  const getPrimaryType = () => {
    if (hasTransport) return "Transport";
    const ops = lignes.map(l => l.operationType).filter(o => o !== "none");
    if (ops.some(o => o.startsWith("manutention"))) return "Manutention";
    if (ops.some(o => o.startsWith("stockage"))) return "Stockage";
    if (ops.some(o => o.startsWith("location"))) return "Location";
    return "Multi-services";
  };

  const handleGeneratePDF = () => {
    const pdfData = {
      type: getPrimaryType(),
      subType: hasTransport ? transportData.transportType : "",
      subTypeLabel: hasTransport ? transportSubTypes.find(st => st.key === transportData.transportType)?.label || "" : "",
      client: getClientName(client),
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

  const handleCreate = () => {
    if (!client) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    if (!hasAnyService) {
      toast.error("Veuillez activer le transport ou ajouter une opération aux lignes");
      return;
    }
    handleGeneratePDF();
    toast.success("Ordre de travail créé avec succès");
    navigate("/ordres-travail");
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
              <h1 className="text-3xl font-heading font-bold text-foreground">
                {isDevisMode ? "Nouveau devis" : "Nouvel ordre de travail"}
              </h1>
              {fromDevisNumber && (
                <Badge className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30">
                  <FileText className="h-3 w-3 mr-1" />
                  Depuis {fromDevisNumber}
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
                  <Select value={client} onValueChange={setClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
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
              
              <LignesPrestationSection lignes={lignes} onChange={setLignes} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate("/ordres-travail")}>
                Annuler
              </Button>
              <Button variant="outline" onClick={handleGeneratePDF} disabled={!client}>
                <FileText className="h-4 w-4 mr-2" />
                Aperçu PDF
              </Button>
              <Button variant="gradient" onClick={handleCreate} disabled={!client}>
                Créer l'ordre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
