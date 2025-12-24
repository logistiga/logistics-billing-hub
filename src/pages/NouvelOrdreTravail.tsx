import { useState, useEffect, useSyncExternalStore } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  SelectItem,
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

interface LignePrestation {
  numeroConteneur: string;
  description: string;
  quantite: number;
  prixUnit: number;
  total: number;
  service: string; // "transport" | "manutention" | "stockage" | "location"
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

  // ========== SERVICE SELECTORS ==========
  // Transport : dropdown (peut être vide = "aucun transport")
  const [transportType, setTransportType] = useState<string>("");
  
  // Manutention : switch + sous-type
  const [hasManutention, setHasManutention] = useState(false);
  const [manutentionType, setManutentionType] = useState<string>("");
  
  // Stockage : switch + sous-type
  const [hasStockage, setHasStockage] = useState(false);
  const [stockageType, setStockageType] = useState<string>("");
  
  // Location : switch + sous-type
  const [hasLocation, setHasLocation] = useState(false);
  const [locationType, setLocationType] = useState<string>("");

  // Form state
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [lignes, setLignes] = useState<LignePrestation[]>([
    { numeroConteneur: "", description: "", quantite: 1, prixUnit: 0, total: 0, service: "transport" }
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
        setTransportType("import");
      } else if (devis.type === "Manutention") {
        setHasManutention(true);
        setManutentionType("chargement");
      } else if (devis.type === "Stockage") {
        setHasStockage(true);
        setStockageType("entrepot");
      } else if (devis.type === "Location") {
        setHasLocation(true);
        setLocationType("engin");
      }
      
      setLignes([{
        numeroConteneur: "",
        description: `Prestation ${devis.type} - Réf. Devis ${devis.number}`,
        quantite: 1,
        prixUnit: devis.amount,
        total: devis.amount,
        service: devis.type.toLowerCase()
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

  // Manutention fields
  const [lieuPrestation, setLieuPrestation] = useState("");
  const [typeMarchandise, setTypeMarchandise] = useState("");
  const [datePrestation, setDatePrestation] = useState("");
  const [typeManutention, setTypeManutention] = useState("");

  // Stockage fields
  const [dateEntree, setDateEntree] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [typeStockage, setTypeStockage] = useState("");
  const [entrepot, setEntrepot] = useState("");
  const [surface, setSurface] = useState("");
  const [tarifJournalier, setTarifJournalier] = useState("");
  const [numeroConteneurStockage, setNumeroConteneurStockage] = useState("");
  const [typeConteneur, setTypeConteneur] = useState("");

  // Calcul durée de stockage
  const dureeStockage = dateEntree && dateSortie 
    ? Math.max(0, Math.ceil((new Date(dateSortie).getTime() - new Date(dateEntree).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  // Calcul total estimé stockage
  const totalStockageEstime = dureeStockage * parseFloat(surface || "0") * parseFloat(tarifJournalier || "0");

  // Location fields
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [typeEngin, setTypeEngin] = useState("");
  const [typeVehicule, setTypeVehicule] = useState("");
  const [avecChauffeur, setAvecChauffeur] = useState("");
  const [lieuUtilisation, setLieuUtilisation] = useState("");

  // Check if at least one service is selected
  const hasAnyService = (transportType && transportType !== "none") || hasManutention || hasStockage || hasLocation;

  const updateLigne = (index: number, field: keyof LignePrestation, value: string | number) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    if (field === "quantite" || field === "prixUnit") {
      newLignes[index].total = newLignes[index].quantite * newLignes[index].prixUnit;
    }
    setLignes(newLignes);
  };

  const addLigne = () => {
    const defaultService = transportType ? "transport" : hasManutention ? "manutention" : hasStockage ? "stockage" : "location";
    setLignes([...lignes, { numeroConteneur: "", description: "", quantite: 1, prixUnit: 0, total: 0, service: defaultService }]);
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
    if (transportType && transportType !== "none") return "Transport";
    if (hasManutention) return "Manutention";
    if (hasStockage) return "Stockage";
    if (hasLocation) return "Location";
    return "Multi-services";
  };

  const getPrimarySubType = () => {
    if (transportType && transportType !== "none") return transportType;
    if (hasManutention) return manutentionType;
    if (hasStockage) return stockageType;
    if (hasLocation) return locationType;
    return "";
  };

  const getPrimarySubTypeLabel = () => {
    if (transportType && transportType !== "none") {
      return transportSubTypes.find(st => st.key === transportType)?.label || "";
    }
    if (hasManutention) {
      return manutentionSubTypes.find(st => st.key === manutentionType)?.label || "";
    }
    if (hasStockage) {
      return stockageSubTypes.find(st => st.key === stockageType)?.label || "";
    }
    if (hasLocation) {
      return locationSubTypes.find(st => st.key === locationType)?.label || "";
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
      lignes,
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
      lieuPrestation,
      typeMarchandise,
      datePrestation,
      typeManutention,
      dateEntree,
      dateSortie,
      typeStockage,
      entrepot,
      surface,
      tarifJournalier,
      dateDebut,
      dateFin,
      typeEngin,
      typeVehicule,
      avecChauffeur,
      lieuUtilisation,
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
      toast.error("Veuillez sélectionner au moins un service");
      return;
    }
    handleGeneratePDF();
    toast.success("Ordre de travail créé avec succès");
    navigate("/ordres-travail");
  };

  // ========== RENDER TRANSPORT SECTION ==========
  const renderTransportSection = () => {
    if (!transportType || transportType === "none") return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 border rounded-lg p-4 border-amber-200 bg-amber-50/50"
      >
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-amber-700">Transport - {transportSubTypes.find(t => t.key === transportType)?.label}</h3>
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

  // ========== RENDER MANUTENTION SECTION ==========
  const renderManutentionSection = () => {
    if (!hasManutention) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 border rounded-lg p-4 border-blue-200 bg-blue-50/50"
      >
        <div className="flex items-center gap-2">
          <Forklift className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-700">Manutention - {manutentionSubTypes.find(t => t.key === manutentionType)?.label}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lieu de prestation *</Label>
            <Textarea 
              placeholder="Ex: Port d'Owendo, Quai 3..." 
              rows={2}
              value={lieuPrestation}
              onChange={(e) => setLieuPrestation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type de marchandise</Label>
            <Input 
              placeholder="Ex: Containers, Vrac..."
              value={typeMarchandise}
              onChange={(e) => setTypeMarchandise(e.target.value)}
            />
          </div>
        </div>
        {manutentionType === "autre" && (
          <div className="space-y-2">
            <Label>Précisez le type de manutention *</Label>
            <Input 
              placeholder="Décrivez le type de manutention"
              value={typeManutention}
              onChange={(e) => setTypeManutention(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Date prestation *</Label>
          <Input 
            type="date" 
            className="w-1/2"
            value={datePrestation}
            onChange={(e) => setDatePrestation(e.target.value)}
          />
        </div>
      </motion.div>
    );
  };

  // ========== RENDER STOCKAGE SECTION ==========
  const renderStockageSection = () => {
    if (!hasStockage) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 border rounded-lg p-4 border-purple-200 bg-purple-50/50"
      >
        <div className="flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-700">Stockage - {stockageSubTypes.find(t => t.key === stockageType)?.label}</h3>
        </div>

        {/* Informations conteneur */}
        <div className="border rounded-lg p-4 border-purple-200 bg-purple-50">
          <h4 className="font-medium mb-3 text-purple-700">Informations Conteneur</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Numéro de conteneur *</Label>
              <Input 
                placeholder="Ex: MSKU1234567"
                value={numeroConteneurStockage}
                onChange={(e) => setNumeroConteneurStockage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type de conteneur *</Label>
              <Select value={typeConteneur} onValueChange={setTypeConteneur}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20 pieds">20 pieds (6m)</SelectItem>
                  <SelectItem value="40 pieds">40 pieds (12m)</SelectItem>
                  <SelectItem value="40 pieds HC">40 pieds High Cube</SelectItem>
                  <SelectItem value="20 pieds réfrigéré">20 pieds réfrigéré</SelectItem>
                  <SelectItem value="40 pieds réfrigéré">40 pieds réfrigéré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Période de stockage */}
        <div className="border rounded-lg p-4 border-purple-200 bg-purple-50">
          <h4 className="font-medium mb-3 text-purple-700">Durée de stockage</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date d'entrée *</Label>
              <Input 
                type="date"
                value={dateEntree}
                onChange={(e) => setDateEntree(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de sortie prévue</Label>
              <Input 
                type="date"
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Durée (jours)</Label>
              <Input 
                type="number" 
                disabled 
                value={dureeStockage || ""} 
                placeholder="0" 
                className="bg-muted font-semibold text-purple-700" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type de stockage *</Label>
            <Select value={typeStockage} onValueChange={setTypeStockage}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrepôt sécurisé">Entrepôt sécurisé</SelectItem>
                <SelectItem value="Stockage plein air">Stockage plein air</SelectItem>
                <SelectItem value="Stockage réfrigéré">Stockage réfrigéré</SelectItem>
                <SelectItem value="Matières dangereuses">Matières dangereuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Emplacement *</Label>
            <Select value={entrepot} onValueChange={setEntrepot}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Zone A - Owendo">Zone A - Owendo</SelectItem>
                <SelectItem value="Zone B - Owendo">Zone B - Owendo</SelectItem>
                <SelectItem value="Zone C - Port-Gentil">Zone C - Port-Gentil</SelectItem>
                <SelectItem value="Zone D - Libreville">Zone D - Libreville</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tarif journalier (FCFA) *</Label>
            <Input 
              type="number" 
              placeholder="0"
              value={tarifJournalier}
              onChange={(e) => setTarifJournalier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Montant total estimé (FCFA)</Label>
            <Input 
              type="text" 
              disabled 
              value={totalStockageEstime > 0 ? new Intl.NumberFormat("fr-GA").format(totalStockageEstime) + " FCFA" : "0 FCFA"} 
              className="bg-muted font-semibold text-primary" 
            />
          </div>
        </div>
      </motion.div>
    );
  };

  // ========== RENDER LOCATION SECTION ==========
  const renderLocationSection = () => {
    if (!hasLocation) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 border rounded-lg p-4 border-green-200 bg-green-50/50"
      >
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-700">Location - {locationSubTypes.find(t => t.key === locationType)?.label}</h3>
        </div>

        <div className="border rounded-lg p-4 border-green-200 bg-green-50">
          <h4 className="font-medium mb-3 text-green-700">Période de location</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Input 
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <Input 
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Durée (jours)</Label>
              <Input type="number" disabled placeholder="Calculé automatiquement" className="bg-muted" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {locationType === "engin" && (
            <div className="space-y-2">
              <Label>Type d'engin *</Label>
              <Select value={typeEngin} onValueChange={setTypeEngin}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grue">Grue</SelectItem>
                  <SelectItem value="Chariot élévateur">Chariot élévateur</SelectItem>
                  <SelectItem value="Reach stacker">Reach stacker</SelectItem>
                  <SelectItem value="Tracteur portuaire">Tracteur portuaire</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {locationType === "vehicule" && (
            <div className="space-y-2">
              <Label>Type de véhicule *</Label>
              <Select value={typeVehicule} onValueChange={setTypeVehicule}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Camion">Camion</SelectItem>
                  <SelectItem value="Semi-remorque">Semi-remorque</SelectItem>
                  <SelectItem value="Plateau">Plateau</SelectItem>
                  <SelectItem value="Citerne">Citerne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Avec chauffeur/opérateur</Label>
            <Select value={avecChauffeur} onValueChange={setAvecChauffeur}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oui">Oui</SelectItem>
                <SelectItem value="Non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Lieu d'utilisation *</Label>
          <Input 
            placeholder="Ex: Chantier Owendo"
            value={lieuUtilisation}
            onChange={(e) => setLieuUtilisation(e.target.value)}
          />
        </div>
      </motion.div>
    );
  };

  // ========== RENDER LIGNES DE PRESTATION ==========
  const renderLignesPrestation = () => {
    if (!hasAnyService) return null;

    return (
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Lignes de prestation</h4>
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
          <div className="col-span-2">N° Conteneur/Lot</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Quantité</div>
          <div className="col-span-2">Prix unit.</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1"></div>
        </div>
        {lignes.map((ligne, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2">
            <Input 
              className="col-span-2" 
              placeholder="MSKU1234567"
              value={ligne.numeroConteneur}
              onChange={(e) => updateLigne(index, "numeroConteneur", e.target.value.toUpperCase())}
            />
            <Input 
              className="col-span-4" 
              placeholder="Description de la prestation"
              value={ligne.description}
              onChange={(e) => updateLigne(index, "description", e.target.value)}
            />
            <Input 
              className="col-span-2" 
              type="number" 
              placeholder="1"
              value={ligne.quantite || ""}
              onChange={(e) => updateLigne(index, "quantite", parseInt(e.target.value) || 0)}
            />
            <Input 
              className="col-span-2" 
              type="number" 
              placeholder="0"
              value={ligne.prixUnit || ""}
              onChange={(e) => updateLigne(index, "prixUnit", parseInt(e.target.value) || 0)}
            />
            <Input 
              className="col-span-1" 
              disabled 
              value={ligne.total.toLocaleString("fr-FR")}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="col-span-1"
              onClick={() => removeLigne(index)}
              disabled={lignes.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="mt-2" onClick={addLigne}>
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
              Sélectionnez les services et remplissez les informations
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* ========== SERVICE SELECTORS ========== */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold mb-4 text-foreground">Services à inclure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Transport Selector */}
                <div className="space-y-3 p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-amber-600" />
                    <Label className="font-semibold text-amber-700">Transport</Label>
                  </div>
                  <Select value={transportType} onValueChange={setTransportType}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Aucun transport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun transport</SelectItem>
                      {transportSubTypes.map((st) => (
                        <SelectItem key={st.key} value={st.key}>
                          {st.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manutention Selector */}
                <div className="space-y-3 p-4 rounded-lg border border-blue-200 bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Forklift className="h-5 w-5 text-blue-600" />
                      <Label className="font-semibold text-blue-700">Manutention</Label>
                    </div>
                    <Switch 
                      checked={hasManutention} 
                      onCheckedChange={(checked) => {
                        setHasManutention(checked);
                        if (checked && !manutentionType) {
                          setManutentionType("chargement");
                        }
                      }}
                    />
                  </div>
                  {hasManutention && (
                    <Select value={manutentionType} onValueChange={setManutentionType}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Type de manutention" />
                      </SelectTrigger>
                      <SelectContent>
                        {manutentionSubTypes.map((st) => (
                          <SelectItem key={st.key} value={st.key}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Stockage Selector */}
                <div className="space-y-3 p-4 rounded-lg border border-purple-200 bg-purple-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5 text-purple-600" />
                      <Label className="font-semibold text-purple-700">Stockage</Label>
                    </div>
                    <Switch 
                      checked={hasStockage} 
                      onCheckedChange={(checked) => {
                        setHasStockage(checked);
                        if (checked && !stockageType) {
                          setStockageType("entrepot");
                        }
                      }}
                    />
                  </div>
                  {hasStockage && (
                    <Select value={stockageType} onValueChange={setStockageType}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Type de stockage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockageSubTypes.map((st) => (
                          <SelectItem key={st.key} value={st.key}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Location Selector */}
                <div className="space-y-3 p-4 rounded-lg border border-green-200 bg-green-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      <Label className="font-semibold text-green-700">Location</Label>
                    </div>
                    <Switch 
                      checked={hasLocation} 
                      onCheckedChange={(checked) => {
                        setHasLocation(checked);
                        if (checked && !locationType) {
                          setLocationType("engin");
                        }
                      }}
                    />
                  </div>
                  {hasLocation && (
                    <Select value={locationType} onValueChange={setLocationType}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Type de location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationSubTypes.map((st) => (
                          <SelectItem key={st.key} value={st.key}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Message si aucun service sélectionné */}
            {!hasAnyService && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Sélectionnez au moins un service pour continuer</p>
              </div>
            )}

            {/* ========== CLIENT ========== */}
            {hasAnyService && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
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

                {/* ========== DYNAMIC SECTIONS ========== */}
                {renderTransportSection()}
                {renderManutentionSection()}
                {renderStockageSection()}
                {renderLocationSection()}

                {/* ========== DESCRIPTION ========== */}
                <div className="space-y-2">
                  <Label>Description générale</Label>
                  <Textarea 
                    placeholder="Description de l'ordre de travail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* ========== LIGNES DE PRESTATION ========== */}
                {renderLignesPrestation()}

                {/* ========== ACTIONS ========== */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate("/ordres-travail")}>
                    Annuler
                  </Button>
                  <Button variant="outline" onClick={handleGeneratePDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Aperçu PDF
                  </Button>
                  <Button variant="gradient" onClick={handleCreate}>
                    Créer l'ordre
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
