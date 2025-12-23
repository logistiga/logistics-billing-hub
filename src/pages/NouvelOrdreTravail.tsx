import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { generateOrdrePDF } from "@/lib/generateOrdrePDF";

const typeConfig = {
  Manutention: {
    icon: Forklift,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    subTypes: [
      { key: "chargement", label: "Chargement/Déchargement", icon: PackageOpen },
      { key: "empotage", label: "Empotage/Dépotage", icon: Container },
      { key: "autre", label: "Autre type", icon: Wrench },
    ],
  },
  Transport: {
    icon: Truck,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    subTypes: [
      { key: "hors-lbv", label: "Hors Libreville", icon: MapPin },
      { key: "import", label: "Import sur Libreville", icon: Ship },
      { key: "export", label: "Export", icon: ArrowRightLeft },
      { key: "exceptionnel", label: "Exceptionnel", icon: Sparkles },
    ],
  },
  Stockage: {
    icon: Warehouse,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    subTypes: [
      { key: "entrepot", label: "Entrepôt sécurisé", icon: Warehouse },
      { key: "plein-air", label: "Stockage plein air", icon: Package },
    ],
  },
  Location: {
    icon: Package,
    color: "bg-green-100 text-green-700 border-green-200",
    subTypes: [
      { key: "engin", label: "Location engin", icon: Cog },
      { key: "vehicule", label: "Location véhicule", icon: Car },
    ],
  },
};

interface LignePrestation {
  description: string;
  quantite: number;
  prixUnit: number;
  total: number;
}

type DialogStep = "type" | "subtype" | "form";

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
  
  const [dialogStep, setDialogStep] = useState<DialogStep>("type");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [fromDevisNumber, setFromDevisNumber] = useState<string | null>(null);

  // Form state
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [lignes, setLignes] = useState<LignePrestation[]>([
    { description: "", quantite: 1, prixUnit: 0, total: 0 }
  ]);

  // Effet pour pré-remplir depuis un devis
  useEffect(() => {
    if (fromDevisId && mockDevisData[fromDevisId]) {
      const devis = mockDevisData[fromDevisId];
      setFromDevisNumber(devis.number);
      setClient(devis.clientKey);
      setDescription(devis.description);
      setSelectedType(devis.type);
      setDialogStep("subtype");
      setLignes([{
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

  // Location fields
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [typeEngin, setTypeEngin] = useState("");
  const [typeVehicule, setTypeVehicule] = useState("");
  const [avecChauffeur, setAvecChauffeur] = useState("");
  const [lieuUtilisation, setLieuUtilisation] = useState("");

  const currentTypeConfig = selectedType ? typeConfig[selectedType as keyof typeof typeConfig] : null;
  const currentSubTypeConfig = currentTypeConfig?.subTypes.find(st => st.key === selectedSubType);

  const updateLigne = (index: number, field: keyof LignePrestation, value: string | number) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    if (field === "quantite" || field === "prixUnit") {
      newLignes[index].total = newLignes[index].quantite * newLignes[index].prixUnit;
    }
    setLignes(newLignes);
  };

  const addLigne = () => {
    setLignes([...lignes, { description: "", quantite: 1, prixUnit: 0, total: 0 }]);
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

  const handleGeneratePDF = () => {
    const pdfData = {
      type: selectedType,
      subType: selectedSubType,
      subTypeLabel: currentSubTypeConfig?.label || "",
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
    doc.save(`ordre-travail-${selectedType.toLowerCase()}-${Date.now()}.pdf`);
    toast.success("PDF généré avec succès");
  };

  const handleCreate = () => {
    handleGeneratePDF();
    toast.success("Ordre de travail créé avec succès");
    navigate("/ordres-travail");
  };

  const renderTransportForm = () => (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 border-border bg-muted/30">
        <h4 className="font-medium mb-3 text-foreground">Trajet</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Point de départ (A) *</Label>
            <Input 
              placeholder="Ex: Port d'Owendo" 
              value={pointDepart}
              onChange={(e) => setPointDepart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Point d'arrivée (B) *</Label>
            <Input 
              placeholder="Ex: Port-Gentil"
              value={pointArrivee}
              onChange={(e) => setPointArrivee(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedSubType === "import" && (
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
                  <SelectItem value="MSC">MSC</SelectItem>
                  <SelectItem value="Maersk">Maersk</SelectItem>
                  <SelectItem value="CMA CGM">CMA CGM</SelectItem>
                  <SelectItem value="Hapag-Lloyd">Hapag-Lloyd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Navire</Label>
              <Input 
                placeholder="Nom du navire"
                value={navire}
                onChange={(e) => setNavire(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Transitaire *</Label>
              <Select value={transitaire} onValueChange={setTransitaire}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un transitaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trans Gabon Logistics">Trans Gabon Logistics</SelectItem>
                  <SelectItem value="Bolloré Transport & Logistics">Bolloré Transport & Logistics</SelectItem>
                  <SelectItem value="SDV Gabon">SDV Gabon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prime de Transitaire</Label>
              <Input type="number" step="0.1" placeholder="0" disabled className="bg-muted" />
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
                  <SelectItem value="Jean-Paul Ndong">Jean-Paul Ndong</SelectItem>
                  <SelectItem value="Marie Obame">Marie Obame</SelectItem>
                  <SelectItem value="Pierre Nguema">Pierre Nguema</SelectItem>
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

      {selectedSubType === "export" && (
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
              <Label>Compagnie Maritime *</Label>
              <Select value={compagnieMaritime} onValueChange={setCompagnieMaritime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une compagnie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MSC">MSC</SelectItem>
                  <SelectItem value="Maersk">Maersk</SelectItem>
                  <SelectItem value="CMA CGM">CMA CGM</SelectItem>
                  <SelectItem value="Hapag-Lloyd">Hapag-Lloyd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>N° Container</Label>
              <Input 
                placeholder="MSKU1234567"
                value={numeroConteneur}
                onChange={(e) => setNumeroConteneur(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {selectedSubType === "exceptionnel" && (
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
          <Label>Date d'enlèvement *</Label>
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
    </div>
  );

  const renderManutentionForm = () => (
    <div className="space-y-4">
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
      {selectedSubType === "autre" && (
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
    </div>
  );

  const renderStockageForm = () => (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 border-purple-200 bg-purple-50">
        <h4 className="font-medium mb-3 text-purple-700">Période de stockage</h4>
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
            <Input type="number" disabled placeholder="Calculé automatiquement" className="bg-muted" />
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
          <Label>Entrepôt *</Label>
          <Select value={entrepot} onValueChange={setEntrepot}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owendo - Entrepôt A">Owendo - Entrepôt A</SelectItem>
              <SelectItem value="Owendo - Entrepôt B">Owendo - Entrepôt B</SelectItem>
              <SelectItem value="Libreville Central">Libreville Central</SelectItem>
              <SelectItem value="Port-Gentil">Port-Gentil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type de marchandise</Label>
          <Select value={typeMarchandise} onValueChange={setTypeMarchandise}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marchandises générales">Marchandises générales</SelectItem>
              <SelectItem value="Marchandises dangereuses">Marchandises dangereuses</SelectItem>
              <SelectItem value="Produits réfrigérés">Produits réfrigérés</SelectItem>
              <SelectItem value="Vrac">Vrac</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Surface (m²)</Label>
          <Input 
            type="number" 
            placeholder="0"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tarif journalier/m² (FCFA)</Label>
          <Input 
            type="number" 
            placeholder="0"
            value={tarifJournalier}
            onChange={(e) => setTarifJournalier(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Total estimé (FCFA)</Label>
          <Input type="number" disabled placeholder="Calculé automatiquement" className="bg-muted" />
        </div>
      </div>
    </div>
  );

  const renderLocationForm = () => (
    <div className="space-y-4">
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
        {selectedSubType === "engin" && (
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
        {selectedSubType === "vehicule" && (
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tarif journalier (FCFA)</Label>
          <Input type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Total estimé (FCFA)</Label>
          <Input type="number" disabled placeholder="Calculé automatiquement" className="bg-muted" />
        </div>
      </div>
    </div>
  );

  const renderFormByType = () => {
    switch (selectedType) {
      case "Transport":
        return renderTransportForm();
      case "Manutention":
        return renderManutentionForm();
      case "Stockage":
        return renderStockageForm();
      case "Location":
        return renderLocationForm();
      default:
        return null;
    }
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
              {dialogStep === "type" && "Sélectionnez le type de prestation"}
              {dialogStep === "subtype" && `Sélectionnez le type de ${selectedType.toLowerCase()}`}
              {dialogStep === "form" && `Remplissez les informations - ${currentSubTypeConfig?.label}`}
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            {/* Step 1: Select Type */}
            {dialogStep === "type" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {Object.entries(typeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setDialogStep("subtype");
                      }}
                      className={`p-6 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 ${config.color}`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-3" />
                      <p className="font-semibold">{type}</p>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* Step 2: Select SubType */}
            {dialogStep === "subtype" && currentTypeConfig && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogStep("type");
                      setSelectedType("");
                    }}
                  >
                    ← Retour
                  </Button>
                  <Badge className={currentTypeConfig.color}>
                    {selectedType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Quel type de {selectedType.toLowerCase()} souhaitez-vous créer ?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentTypeConfig.subTypes.map((subType) => {
                    const Icon = subType.icon;
                    return (
                      <button
                        key={subType.key}
                        onClick={() => {
                          setSelectedSubType(subType.key);
                          setDialogStep("form");
                        }}
                        className={`p-5 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 ${currentTypeConfig.color}`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium text-sm">{subType.label}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Form */}
            {dialogStep === "form" && currentTypeConfig && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogStep("subtype");
                      setSelectedSubType("");
                    }}
                  >
                    ← Retour
                  </Button>
                  <Badge className={currentTypeConfig.color}>
                    {selectedType}
                  </Badge>
                  <Badge variant="outline">
                    {currentSubTypeConfig?.label}
                  </Badge>
                </div>

                {/* Client */}
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

                {/* Type-specific form */}
                {renderFormByType()}

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Description de la prestation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Lignes de prestation */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Lignes de prestation</h4>
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Quantité</div>
                    <div className="col-span-2">Prix unit.</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {lignes.map((ligne, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <Input 
                        className="col-span-5" 
                        placeholder="Description"
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
                        className="col-span-2" 
                        disabled 
                        value={`${ligne.total.toLocaleString("fr-FR")} FCFA`}
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
                </div>

                {/* Actions */}
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
