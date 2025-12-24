import { useState, useEffect, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowLeft,
  Truck,
  Package,
  Warehouse,
  Forklift,
  MapPin,
  Ship,
  ArrowRightLeft,
  Sparkles,
  Container,
  PackageOpen,
  Wrench,
  Car,
  Cog,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { generateOrdrePDF } from "@/lib/generateOrdrePDF";
import { partenaireStore } from "@/lib/partenaireStore";

const transportSubTypes = [
  { key: "import", label: "Import sur Libreville", icon: Ship },
  { key: "export", label: "Export", icon: ArrowRightLeft },
  { key: "vrac", label: "Transport en vrac", icon: Package },
  { key: "hors-lbv", label: "Hors Libreville", icon: MapPin },
  { key: "exceptionnel", label: "Exceptionnel", icon: Sparkles },
];

const manutentionSubTypes = [
  { key: "chargement", label: "Chargement/Déchargement", icon: PackageOpen },
  { key: "empotage", label: "Empotage/Dépotage", icon: Container },
  { key: "autre", label: "Autre type", icon: Wrench },
];

const stockageSubTypes = [
  { key: "entrepot", label: "Entrepôt sécurisé", icon: Warehouse },
  { key: "plein-air", label: "Stockage plein air", icon: Package },
];

const locationSubTypes = [
  { key: "engin", label: "Location engin", icon: Cog },
  { key: "vehicule", label: "Location véhicule", icon: Car },
];

// Operation types for line items
const operationTypes = [
  { key: "none", label: "Aucune opération", category: null },
  { key: "manutention-chargement", label: "Chargement/Déchargement", category: "Manutention" },
  { key: "manutention-empotage", label: "Empotage/Dépotage", category: "Manutention" },
  { key: "manutention-autre", label: "Autre manutention", category: "Manutention" },
  { key: "stockage-entrepot", label: "Entrepôt sécurisé", category: "Stockage" },
  { key: "stockage-plein-air", label: "Stockage plein air", category: "Stockage" },
  { key: "location-engin", label: "Location engin", category: "Location" },
  { key: "location-vehicule", label: "Location véhicule", category: "Location" },
];

interface LignePrestation {
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

// Mock des conteneurs existants pour les notes de débit
export const mockConteneurs: { numeroConteneur: string; ordreId: string; ordreNumber: string; client: string; type: string; date: string }[] = [];

// Mock devis data pour la récupération
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
  
  // Charger les données des partenaires depuis le store
  const compagniesMaritimes = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getCompagnies,
    partenaireStore.getCompagnies
  );
  const transitairesList = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getTransitaires,
    partenaireStore.getTransitaires
  );
  const representantsList = useSyncExternalStore(
    partenaireStore.subscribe,
    partenaireStore.getRepresentants,
    partenaireStore.getRepresentants
  );
  
  const [fromDevisNumber, setFromDevisNumber] = useState<string | null>(null);

  // Client & Description (now at top)
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");

  // Transport toggle
  const [hasTransport, setHasTransport] = useState(false);
  const [transportType, setTransportType] = useState<string>("import");

  // Lines with operation type
  const [lignes, setLignes] = useState<LignePrestation[]>([
    { operationType: "none", numeroConteneur: "", numeroLot: "", numeroOperation: "", dateDebut: "", dateFin: "", description: "", quantite: 1, prixUnit: 0, total: 0 }
  ]);

  // Effet pour pré-remplir depuis un devis
  useEffect(() => {
    if (fromDevisId && mockDevisData[fromDevisId]) {
      const devis = mockDevisData[fromDevisId];
      setFromDevisNumber(devis.number);
      setClient(devis.clientKey);
      setDescription(devis.description);
      
      // Activer le bon service selon le type du devis
      if (devis.type === "Transport") {
        setHasTransport(true);
        setTransportType("import");
      }
      
      // Map operation type for lines
      let opType = "none";
      if (devis.type === "Manutention") opType = "manutention-chargement";
      else if (devis.type === "Stockage") opType = "stockage-entrepot";
      else if (devis.type === "Location") opType = "location-engin";
      
      setLignes([{
        operationType: opType,
        numeroConteneur: "",
        numeroLot: "",
        numeroOperation: "",
        dateDebut: "",
        dateFin: "",
        description: `Prestation ${devis.type} - Réf. Devis ${devis.number}`,
        quantite: 1,
        prixUnit: devis.amount,
        total: devis.amount
      }]);
      
      toast.success(`Données récupérées du devis ${devis.number}`);
    }
  }, [fromDevisId]);

  // Transport fields
  const [pointDepart, setPointDepart] = useState("");
  const [pointArrivee, setPointArrivee] = useState("");
  const [dateEnlevement, setDateEnlevement] = useState("");
  const [dateLivraison, setDateLivraison] = useState("");

  // Import fields
  const [numeroConnaissement, setNumeroConnaissement] = useState("");
  const [numeroConteneur, setNumeroConteneur] = useState("");
  const [compagnieMaritime, setCompagnieMaritime] = useState("");
  const [navire, setNavire] = useState("");
  const [transitaire, setTransitaire] = useState("");
  const [representant, setRepresentant] = useState("");

  // Export fields
  const [destinationFinale, setDestinationFinale] = useState("");
  const [numeroBooking, setNumeroBooking] = useState("");

  // Exceptionnel fields
  const [poidsTotal, setPoidsTotal] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [typeEscorte, setTypeEscorte] = useState("");
  const [autorisationSpeciale, setAutorisationSpeciale] = useState("");

  // Check if form is valid (client is required, and either transport or at least one operation in lines)
  const hasOperations = lignes.some(l => l.operationType !== "none");
  const hasAnyService = hasTransport || hasOperations;

  const updateLigne = (index: number, field: keyof LignePrestation, value: string | number) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    if (field === "quantite" || field === "prixUnit") {
      newLignes[index].total = newLignes[index].quantite * newLignes[index].prixUnit;
    }
    setLignes(newLignes);
  };

  const addLigne = () => {
    setLignes([...lignes, { operationType: "none", numeroConteneur: "", numeroLot: "", numeroOperation: "", dateDebut: "", dateFin: "", description: "", quantite: 1, prixUnit: 0, total: 0 }]);
  };

  const removeLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  const getClientName = (value: string) => {
    const clients: Record<string, string> = {
      comilog: "COMILOG SA",
      olam: "OLAM Gabon",
      total: "Total Energies",
      assala: "Assala Energy",
      seeg: "SEEG",
    };
    return clients[value] || value;
  };

  // Déterminer le type principal pour le PDF
  const getPrimaryType = () => {
    if (hasTransport) return "Transport";
    // Check operations in lines
    const ops = lignes.map(l => l.operationType).filter(o => o !== "none");
    if (ops.some(o => o.startsWith("manutention"))) return "Manutention";
    if (ops.some(o => o.startsWith("stockage"))) return "Stockage";
    if (ops.some(o => o.startsWith("location"))) return "Location";
    return "Multi-services";
  };

  const getPrimarySubType = () => {
    if (hasTransport) return transportType;
    return "";
  };

  const getPrimarySubTypeLabel = () => {
    if (hasTransport) {
      return transportSubTypes.find(st => st.key === transportType)?.label || "";
    }
    return "";
  };

  const handleGeneratePDF = () => {
    const pdfData = {
      type: getPrimaryType(),
      subType: getPrimarySubType(),
      subTypeLabel: getPrimarySubTypeLabel(),
      client: getClientName(client),
      description,
      lignes: lignes.map(l => ({
        ...l,
        service: l.operationType.split("-")[0] || "autre"
      })),
      pointDepart,
      pointArrivee,
      dateEnlevement,
      dateLivraison,
      numeroConnaissement,
      numeroConteneur,
      compagnieMaritime,
      navire,
      transitaire,
      representant,
      destinationFinale,
      numeroBooking,
      poidsTotal,
      dimensions,
      typeEscorte,
      autorisationSpeciale,
      // Empty values for removed sections
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

  // ========== RENDER TRANSPORT SECTION ==========
  const renderTransportSection = () => {
    if (!hasTransport) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 border rounded-lg p-4 border-amber-200 bg-amber-50/50"
      >
        {/* Transport Type Selector */}
        <div className="space-y-2">
          <Label>Type de transport *</Label>
          <Select value={transportType} onValueChange={setTransportType}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              {transportSubTypes.map((st) => (
                <SelectItem key={st.key} value={st.key}>
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trajet */}
        <div className="border rounded-lg p-4 border-border bg-background">
          <h4 className="font-medium mb-3 text-foreground">Trajet</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Point de départ (A) {transportType !== "import" && transportType !== "export" && transportType !== "vrac" && "*"}</Label>
              <Input 
                placeholder="Ex: Port d'Owendo" 
                value={pointDepart}
                onChange={(e) => setPointDepart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Point d'arrivée (B) {transportType !== "import" && transportType !== "export" && transportType !== "vrac" && "*"}</Label>
              <Input 
                placeholder="Ex: Port-Gentil"
                value={pointArrivee}
                onChange={(e) => setPointArrivee(e.target.value)}
              />
            </div>
          </div>
        </div>

        {transportType === "import" && (
          <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
            <h4 className="font-medium mb-3 text-blue-700">Import sur Libreville</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>N° Connaissement (BL) *</Label>
                <Input 
                  placeholder="BL-XXXX"
                  value={numeroConnaissement}
                  onChange={(e) => setNumeroConnaissement(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Numéro de conteneur *</Label>
                <Input 
                  placeholder="Ex: MSKU1234567"
                  value={numeroConteneur}
                  onChange={(e) => setNumeroConteneur(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Compagnie Maritime *</Label>
                <Select value={compagnieMaritime} onValueChange={setCompagnieMaritime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une compagnie" />
                  </SelectTrigger>
                  <SelectContent>
                    {compagniesMaritimes.map((comp) => (
                      <SelectItem key={comp.id} value={comp.nom}>
                        {comp.nom} ({comp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transitaire *</Label>
                <Select value={transitaire} onValueChange={setTransitaire}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un transitaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {transitairesList.map((trans) => (
                      <SelectItem key={trans.id} value={trans.nom}>
                        {trans.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Représentant</Label>
                <Select value={representant} onValueChange={setRepresentant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un représentant" />
                  </SelectTrigger>
                  <SelectContent>
                    {representantsList.map((rep) => (
                      <SelectItem key={rep.id} value={`${rep.prenom} ${rep.nom}`}>
                        {rep.prenom} {rep.nom} {rep.transitaire && `(${rep.transitaire})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prime de Représentant</Label>
                <Input type="number" step="0.1" placeholder="0" disabled className="bg-muted" />
              </div>
            </div>
          </div>
        )}

        {transportType === "export" && (
          <div className="border rounded-lg p-4 border-green-200 bg-green-50">
            <h4 className="font-medium mb-3 text-green-700">Export</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Destination finale *</Label>
                <Input 
                  placeholder="Ex: Douala, Cameroun"
                  value={destinationFinale}
                  onChange={(e) => setDestinationFinale(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>N° Booking</Label>
                <Input 
                  placeholder="Booking number"
                  value={numeroBooking}
                  onChange={(e) => setNumeroBooking(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Compagnie Maritime</Label>
                <Select value={compagnieMaritime} onValueChange={setCompagnieMaritime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une compagnie" />
                  </SelectTrigger>
                  <SelectContent>
                    {compagniesMaritimes.map((comp) => (
                      <SelectItem key={comp.id} value={comp.nom}>
                        {comp.nom} ({comp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transitaire</Label>
                <Select value={transitaire} onValueChange={setTransitaire}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un transitaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {transitairesList.map((trans) => (
                      <SelectItem key={trans.id} value={trans.nom}>
                        {trans.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {transportType === "exceptionnel" && (
          <div className="border rounded-lg p-4 border-amber-200 bg-amber-50">
            <h4 className="font-medium mb-3 text-amber-700">Transport Exceptionnel</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poids total (tonnes)</Label>
                <Input 
                  type="text" 
                  placeholder="0"
                  value={poidsTotal}
                  onChange={(e) => setPoidsTotal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Dimensions (L x l x H)</Label>
                <Input 
                  placeholder="Ex: 12m x 3m x 4m"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type d'escorte</Label>
                <Select value={typeEscorte} onValueChange={setTypeEscorte}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aucune">Aucune</SelectItem>
                    <SelectItem value="Véhicule pilote">Véhicule pilote</SelectItem>
                    <SelectItem value="Escorte police">Escorte police</SelectItem>
                    <SelectItem value="Escorte gendarmerie">Escorte gendarmerie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Autorisation spéciale</Label>
                <Input 
                  placeholder="N° autorisation"
                  value={autorisationSpeciale}
                  onChange={(e) => setAutorisationSpeciale(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date d'enlèvement</Label>
            <Input 
              type="date"
              value={dateEnlevement}
              onChange={(e) => setDateEnlevement(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Date de livraison prévue</Label>
            <Input 
              type="date"
              value={dateLivraison}
              onChange={(e) => setDateLivraison(e.target.value)}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  // Helper to determine which fields to show based on operation type
  const getFieldsForOperationType = (opType: string) => {
    if (opType === "none") return { showConteneur: false, showLot: false, showOperation: false, showDates: false };
    if (opType.startsWith("manutention")) return { showConteneur: true, showLot: true, showOperation: false, showDates: false };
    if (opType.startsWith("stockage")) return { showConteneur: true, showLot: true, showOperation: false, showDates: true };
    if (opType.startsWith("location")) return { showConteneur: false, showLot: false, showOperation: true, showDates: true };
    return { showConteneur: false, showLot: false, showOperation: false, showDates: false };
  };

  // ========== RENDER LIGNES DE PRESTATION ==========
  const renderLignesPrestation = () => {
    return (
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Lignes de prestation</h4>
        
        {lignes.map((ligne, index) => {
          const fields = getFieldsForOperationType(ligne.operationType);
          const hasAnyField = fields.showConteneur || fields.showLot || fields.showOperation || fields.showDates;
          
          return (
            <div key={index} className="mb-4 p-4 border rounded-lg bg-muted/30">
              {/* Row 1: Type d'opération en premier */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 max-w-xs">
                  <Label className="text-xs text-muted-foreground mb-1 block">Type d'opération *</Label>
                  <Select 
                    value={ligne.operationType} 
                    onValueChange={(value) => updateLigne(index, "operationType", value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choisir le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Sélectionner --</SelectItem>
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-2">
                          <Forklift className="h-3 w-3" /> Manutention
                        </SelectLabel>
                        {operationTypes.filter(o => o.category === "Manutention").map(op => (
                          <SelectItem key={op.key} value={op.key}>{op.label}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-2">
                          <Warehouse className="h-3 w-3" /> Stockage
                        </SelectLabel>
                        {operationTypes.filter(o => o.category === "Stockage").map(op => (
                          <SelectItem key={op.key} value={op.key}>{op.label}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-2">
                          <Car className="h-3 w-3" /> Location
                        </SelectLabel>
                        {operationTypes.filter(o => o.category === "Location").map(op => (
                          <SelectItem key={op.key} value={op.key}>{op.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mt-5"
                  onClick={() => removeLigne(index)}
                  disabled={lignes.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Row 2: Dynamic fields based on operation type */}
              {hasAnyField && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {fields.showConteneur && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">N° Conteneur</Label>
                      <Input 
                        placeholder="MSKU1234567"
                        value={ligne.numeroConteneur}
                        onChange={(e) => updateLigne(index, "numeroConteneur", e.target.value.toUpperCase())}
                      />
                    </div>
                  )}
                  {fields.showLot && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">N° Lot</Label>
                      <Input 
                        placeholder="LOT-001"
                        value={ligne.numeroLot}
                        onChange={(e) => updateLigne(index, "numeroLot", e.target.value.toUpperCase())}
                      />
                    </div>
                  )}
                  {fields.showOperation && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">N° Opération</Label>
                      <Input 
                        placeholder="OP-001"
                        value={ligne.numeroOperation}
                        onChange={(e) => updateLigne(index, "numeroOperation", e.target.value.toUpperCase())}
                      />
                    </div>
                  )}
                  {fields.showDates && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Date début</Label>
                        <Input 
                          type="date"
                          value={ligne.dateDebut}
                          onChange={(e) => updateLigne(index, "dateDebut", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Date fin</Label>
                        <Input 
                          type="date"
                          value={ligne.dateFin}
                          onChange={(e) => updateLigne(index, "dateFin", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Row 3: Description, Quantité, Prix, Total */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
                  <Input 
                    placeholder="Description de la prestation"
                    value={ligne.description}
                    onChange={(e) => updateLigne(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground mb-1 block">Quantité</Label>
                  <Input 
                    type="number" 
                    placeholder="1"
                    value={ligne.quantite || ""}
                    onChange={(e) => updateLigne(index, "quantite", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs text-muted-foreground mb-1 block">Prix unitaire</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={ligne.prixUnit || ""}
                    onChange={(e) => updateLigne(index, "prixUnit", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground mb-1 block">Total</Label>
                  <Input 
                    disabled 
                    className="bg-muted font-medium"
                    value={ligne.total.toLocaleString("fr-FR") + " FCFA"}
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        <Button variant="outline" size="sm" className="mt-2" onClick={addLigne}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter une ligne
        </Button>
        
        {/* Total général */}
        <div className="flex justify-end mt-4 pt-4 border-t">
          <div className="text-right">
            <span className="text-muted-foreground mr-4">Total général:</span>
            <span className="font-bold text-lg">
              {lignes.reduce((sum, l) => sum + l.total, 0).toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      </div>
    );
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
            {/* ========== SECTION 1: CLIENT ========== */}
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
                      <SelectItem value="comilog">COMILOG SA</SelectItem>
                      <SelectItem value="olam">OLAM Gabon</SelectItem>
                      <SelectItem value="total">Total Energies</SelectItem>
                      <SelectItem value="assala">Assala Energy</SelectItem>
                      <SelectItem value="seeg">SEEG</SelectItem>
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

            {/* ========== SECTION 2: TRANSPORT TOGGLE ========== */}
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
                {renderTransportSection()}
              </AnimatePresence>
            </div>

            {/* ========== SECTION 3: LIGNES DE PRESTATION ========== */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                Lignes de prestation
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Manutention, Stockage, Location)
                </span>
              </h3>
              
              {renderLignesPrestation()}
            </div>

            {/* ========== ACTIONS ========== */}
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
