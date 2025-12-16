import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

type DialogStep = "type" | "subtype" | "form";

export default function NouvelOrdreTravail() {
  const navigate = useNavigate();
  const [dialogStep, setDialogStep] = useState<DialogStep>("type");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");

  const currentTypeConfig = selectedType ? typeConfig[selectedType as keyof typeof typeConfig] : null;
  const currentSubTypeConfig = currentTypeConfig?.subTypes.find(st => st.key === selectedSubType);

  const handleCreate = () => {
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
          <Textarea placeholder="Ex: Port d'Owendo, Quai 3..." rows={2} />
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
      <div className="space-y-2">
        <Label>Date prestation *</Label>
        <Input type="date" className="w-1/2" />
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ordres-travail")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Nouvel ordre de travail
            </h1>
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
                <div className="border rounded-lg p-4">
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

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate("/ordres-travail")}>
                    Annuler
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
