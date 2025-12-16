import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Mail,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
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
  Ban,
  CreditCard,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkOrder {
  id: string;
  number: string;
  client: string;
  type: string;
  subType: string;
  date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  amount: number;
  description: string;
}

const mockOrders: WorkOrder[] = [
  {
    id: "1",
    number: "OT-2024-0089",
    client: "COMILOG SA",
    type: "Transport",
    subType: "Hors Libreville",
    date: "15/12/2024",
    status: "in_progress",
    amount: 2500000,
    description: "Transport de minerai vers Port-Gentil",
  },
  {
    id: "2",
    number: "OT-2024-0088",
    client: "OLAM Gabon",
    type: "Manutention",
    subType: "Chargement/Déchargement",
    date: "14/12/2024",
    status: "completed",
    amount: 850000,
    description: "Manutention containers au port",
  },
  {
    id: "3",
    number: "OT-2024-0087",
    client: "Total Energies",
    type: "Stockage",
    subType: "Entrepôt sécurisé",
    date: "14/12/2024",
    status: "pending",
    amount: 1200000,
    description: "Stockage équipements pétroliers",
  },
  {
    id: "4",
    number: "OT-2024-0086",
    client: "Assala Energy",
    type: "Transport",
    subType: "Exceptionnel",
    date: "13/12/2024",
    status: "completed",
    amount: 4500000,
    description: "Convoi exceptionnel équipement lourd",
  },
  {
    id: "5",
    number: "OT-2024-0085",
    client: "SEEG",
    type: "Location",
    subType: "Location engin",
    date: "12/12/2024",
    status: "cancelled",
    amount: 750000,
    description: "Location grue - Annulé",
  },
];

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

const statusConfig = {
  pending: {
    label: "En attente",
    icon: Clock,
    class: "bg-warning/20 text-warning",
  },
  in_progress: {
    label: "En cours",
    icon: Clock,
    class: "bg-primary/20 text-primary",
  },
  completed: {
    label: "Terminé",
    icon: CheckCircle2,
    class: "bg-success/20 text-success",
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    class: "bg-muted text-muted-foreground",
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

type DialogStep = "type" | "subtype" | "form";

export default function OrdresTravail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("type");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-GA", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const resetDialog = () => {
    setDialogStep("type");
    setSelectedType("");
    setSelectedSubType("");
  };

  const currentTypeConfig = selectedType ? typeConfig[selectedType as keyof typeof typeConfig] : null;
  const currentSubTypeConfig = currentTypeConfig?.subTypes.find(st => st.key === selectedSubType);

  const renderTransportForm = () => (
    <div className="space-y-4">
      {/* Point A et Point B */}
      <div className="border rounded-lg p-4 border-border bg-muted/30">
        <h4 className="font-medium mb-3 text-foreground">Trajet</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Point de départ (A) *</Label>
            <Input placeholder="Ex: Port d'Owendo" />
          </div>
          <div className="space-y-2">
            <Label>Point d'arrivée (B) *</Label>
            <Input placeholder="Ex: Port-Gentil" />
          </div>
        </div>
      </div>

      {selectedSubType === "import" && (
        <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
          <h4 className="font-medium mb-3 text-blue-700">Import sur Libreville</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>N° Connaissement (BL) *</Label>
              <Input placeholder="BL-XXXX" />
            </div>
            <div className="space-y-2">
              <Label>N° Container</Label>
              <Input placeholder="MSKU1234567" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Compagnie Maritime *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une compagnie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="msc">MSC</SelectItem>
                  <SelectItem value="maersk">Maersk</SelectItem>
                  <SelectItem value="cmacgm">CMA CGM</SelectItem>
                  <SelectItem value="hapag">Hapag-Lloyd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Navire</Label>
              <Input placeholder="Nom du navire" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Transitaire *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un transitaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transgabon">Trans Gabon Logistics</SelectItem>
                  <SelectItem value="bollore">Bolloré Transport & Logistics</SelectItem>
                  <SelectItem value="sdv">SDV Gabon</SelectItem>
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un représentant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ndong">Jean-Paul Ndong</SelectItem>
                  <SelectItem value="obame">Marie Obame</SelectItem>
                  <SelectItem value="nguema">Pierre Nguema</SelectItem>
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
              <Input placeholder="Ex: Douala, Cameroun" />
            </div>
            <div className="space-y-2">
              <Label>N° Booking</Label>
              <Input placeholder="Booking number" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Compagnie Maritime *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une compagnie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="msc">MSC</SelectItem>
                  <SelectItem value="maersk">Maersk</SelectItem>
                  <SelectItem value="cmacgm">CMA CGM</SelectItem>
                  <SelectItem value="hapag">Hapag-Lloyd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>N° Container</Label>
              <Input placeholder="MSKU1234567" />
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
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Dimensions (L x l x H)</Label>
              <Input placeholder="Ex: 12m x 3m x 4m" />
            </div>
            <div className="space-y-2">
              <Label>Type d'escorte</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucune">Aucune</SelectItem>
                  <SelectItem value="vehicule">Véhicule pilote</SelectItem>
                  <SelectItem value="police">Escorte police</SelectItem>
                  <SelectItem value="gendarmerie">Escorte gendarmerie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Autorisation spéciale</Label>
              <Input placeholder="N° autorisation" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date d'enlèvement *</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>Date de livraison prévue</Label>
          <Input type="date" />
        </div>
      </div>
    </div>
  );

  const renderManutentionForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lieu de prestation *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owendo">Port d'Owendo</SelectItem>
              <SelectItem value="libreville">Port de Libreville</SelectItem>
              <SelectItem value="portgentil">Port-Gentil</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type de marchandise</Label>
          <Input placeholder="Ex: Containers, Vrac..." />
        </div>
      </div>
      {selectedSubType === "autre" && (
        <div className="space-y-2">
          <Label>Précisez le type de manutention *</Label>
          <Input placeholder="Décrivez le type de manutention" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date prestation *</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>Nombre d'unités</Label>
          <Input type="number" placeholder="1" />
        </div>
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
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Date de sortie prévue</Label>
            <Input type="date" />
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
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrepot">Entrepôt sécurisé</SelectItem>
              <SelectItem value="plein-air">Stockage plein air</SelectItem>
              <SelectItem value="refrigere">Stockage réfrigéré</SelectItem>
              <SelectItem value="dangereux">Matières dangereuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Entrepôt *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owendo-a">Owendo - Entrepôt A</SelectItem>
              <SelectItem value="owendo-b">Owendo - Entrepôt B</SelectItem>
              <SelectItem value="libreville">Libreville Central</SelectItem>
              <SelectItem value="portgentil">Port-Gentil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type de marchandise</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Marchandises générales</SelectItem>
              <SelectItem value="dangereux">Marchandises dangereuses</SelectItem>
              <SelectItem value="refrigere">Produits réfrigérés</SelectItem>
              <SelectItem value="vrac">Vrac</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Surface (m²)</Label>
          <Input type="number" placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tarif journalier/m² (FCFA)</Label>
          <Input type="number" placeholder="0" />
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
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Date de fin *</Label>
            <Input type="date" />
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grue">Grue</SelectItem>
                <SelectItem value="chariot">Chariot élévateur</SelectItem>
                <SelectItem value="reach">Reach stacker</SelectItem>
                <SelectItem value="tracteur">Tracteur portuaire</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedSubType === "vehicule" && (
          <div className="space-y-2">
            <Label>Type de véhicule *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camion">Camion</SelectItem>
                <SelectItem value="semi">Semi-remorque</SelectItem>
                <SelectItem value="plateau">Plateau</SelectItem>
                <SelectItem value="citerne">Citerne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Avec chauffeur/opérateur</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oui">Oui</SelectItem>
              <SelectItem value="non">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lieu d'utilisation *</Label>
        <Input placeholder="Ex: Chantier Owendo" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Ordres de travail
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos connaissements et ordres de travail
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialog();
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel ordre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Nouvel ordre de travail
                </DialogTitle>
                <DialogDescription>
                  {dialogStep === "type" && "Sélectionnez le type de prestation"}
                  {dialogStep === "subtype" && `Sélectionnez le type de ${selectedType.toLowerCase()}`}
                  {dialogStep === "form" && `Remplissez les informations - ${currentSubTypeConfig?.label}`}
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                {/* Step 1: Select Type */}
                {dialogStep === "type" && (
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                )}

                {/* Step 2: Select SubType */}
                {dialogStep === "subtype" && currentTypeConfig && (
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                )}

                {/* Step 3: Form */}
                {dialogStep === "form" && currentTypeConfig && (
                  <div className="space-y-4">
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
                      <Select>
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
                      <Textarea placeholder="Description de la prestation..." />
                    </div>

                    {/* Lignes de prestation */}
                    <div className="border rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-3">Lignes de prestation</h4>
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2">Quantité</div>
                        <div className="col-span-2">Prix unit.</div>
                        <div className="col-span-2">Total</div>
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <Input className="col-span-6" placeholder="Description" />
                        <Input className="col-span-2" type="number" placeholder="1" />
                        <Input className="col-span-2" type="number" placeholder="0" />
                        <Input className="col-span-2" disabled placeholder="0 FCFA" />
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une ligne
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {dialogStep === "form" && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetDialog();
                  }}>
                    Annuler
                  </Button>
                  <Button variant="gradient" onClick={() => {
                    setIsDialogOpen(false);
                    resetDialog();
                  }}>
                    Créer l'ordre
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Manutention">Manutention</SelectItem>
              <SelectItem value="Stockage">Stockage</SelectItem>
              <SelectItem value="Location">Location</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Orders Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sous-type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => {
                  const config = typeConfig[order.type as keyof typeof typeConfig];
                  const TypeIcon = config?.icon || Truck;
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  return (
                    <motion.tr
                      key={order.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {order.number}
                      </TableCell>
                      <TableCell>{order.client}</TableCell>
                      <TableCell>
                        <Badge className={`${config?.color || "bg-muted"} border`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.subType}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.date}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(order.amount)} FCFA
                      </TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${status.class}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Actions
                              <MoreHorizontal className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover w-52">
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <Eye className="h-4 w-4 text-slate-500" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <Edit className="h-4 w-4 text-blue-500" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <Download className="h-4 w-4 text-slate-500" />
                              Télécharger PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <Mail className="h-4 w-4 text-green-500" />
                              Envoyer par email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <FileCheck className="h-4 w-4 text-indigo-500" />
                              Convertir en facture
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                              <CreditCard className="h-4 w-4 text-emerald-500" />
                              Enregistrer paiement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2 text-amber-500">
                              <Ban className="h-4 w-4" />
                              Annuler
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
