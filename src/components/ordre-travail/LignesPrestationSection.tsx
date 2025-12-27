import { Plus, X, Truck, Forklift, Warehouse, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { differenceInDays, parseISO } from "date-fns";
import { LignePrestation, operationTypes, createEmptyLigne, getFieldsForOperationType } from "./types";

interface LignesPrestationSectionProps {
  lignes: LignePrestation[];
  onChange: (lignes: LignePrestation[]) => void;
  isTransport?: boolean;
  showValidationErrors?: boolean;
}

// Helper pour calculer le nombre de jours entre deux dates
const calculateDaysBetweenDates = (dateDebut: string, dateFin: string): number => {
  if (!dateDebut || !dateFin) return 0;
  try {
    const start = parseISO(dateDebut);
    const end = parseISO(dateFin);
    const days = differenceInDays(end, start);
    return days >= 0 ? days + 1 : 0; // +1 pour inclure le jour de début
  } catch {
    return 0;
  }
};

export function LignesPrestationSection({ lignes, onChange, isTransport = false, showValidationErrors = false }: LignesPrestationSectionProps) {
  const updateLigne = (index: number, field: keyof LignePrestation, value: string | number) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    
    // Calcul automatique des jours pour les types avec dates (stockage, location)
    if (field === "dateDebut" || field === "dateFin") {
      const ligne = newLignes[index];
      const [category] = ligne.typeOperation.split("-");
      
      // Appliquer seulement pour stockage et location
      if (category === "stockage" || category === "location") {
        const days = calculateDaysBetweenDates(ligne.dateDebut, ligne.dateFin);
        if (days > 0) {
          newLignes[index].quantite = days;
          newLignes[index].total = days * newLignes[index].prixUnit;
        }
      }
    }
    
    if (field === "quantite" || field === "prixUnit") {
      newLignes[index].total = newLignes[index].quantite * newLignes[index].prixUnit;
    }
    onChange(newLignes);
  };

  const addLigne = () => {
    onChange([...lignes, createEmptyLigne()]);
  };

  const removeLigne = (index: number) => {
    if (lignes.length > 1) {
      onChange(lignes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3">Lignes de prestation</h4>
      
      {lignes.map((ligne, index) => {
        const fields = getFieldsForOperationType(ligne.typeOperation);
        const hasAnyField = fields.showConteneur || fields.showLot || fields.showOperation || fields.showDates || fields.showPoints;
        
        return (
          <div key={index} className="mb-4 p-4 border rounded-lg bg-muted/30">
            {/* Row 1: Type d'opération en premier */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1 max-w-xs">
                <Label className="text-xs text-muted-foreground mb-1 block">Type d'opération *</Label>
                <Select 
                  value={ligne.typeOperation} 
                  onValueChange={(value) => updateLigne(index, "typeOperation", value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choisir le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Sélectionner --</SelectItem>
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2">
                        <Truck className="h-3 w-3" /> Transport
                      </SelectLabel>
                      {operationTypes.filter(o => o.category === "Transport").map(op => (
                        <SelectItem key={op.key} value={op.key}>{op.label}</SelectItem>
                      ))}
                    </SelectGroup>
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
                {fields.showPoints && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Point départ</Label>
                      <Input 
                        placeholder="Ex: Port d'Owendo"
                        value={ligne.pointDepart}
                        onChange={(e) => updateLigne(index, "pointDepart", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Point arrivée</Label>
                      <Input 
                        placeholder="Ex: Libreville"
                        value={ligne.pointArrivee}
                        onChange={(e) => updateLigne(index, "pointArrivee", e.target.value)}
                      />
                    </div>
                  </>
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
            
            {/* Row 3: Description, Quantité, Prix, Total - toujours visible */}
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
                <Label className={`text-xs mb-1 block ${showValidationErrors && ligne.typeOperation !== "none" && (!ligne.quantite || ligne.quantite <= 0) ? "text-destructive" : "text-muted-foreground"}`}>
                  Quantité {ligne.typeOperation !== "none" && "*"}
                </Label>
                <Input 
                  type="number" 
                  placeholder="1"
                  min="1"
                  value={ligne.quantite || ""}
                  onChange={(e) => updateLigne(index, "quantite", parseInt(e.target.value) || 0)}
                  className={showValidationErrors && ligne.typeOperation !== "none" && (!ligne.quantite || ligne.quantite <= 0) ? "border-destructive" : ""}
                />
                {showValidationErrors && ligne.typeOperation !== "none" && (!ligne.quantite || ligne.quantite <= 0) && (
                  <p className="text-xs text-destructive mt-1">Requis</p>
                )}
              </div>
              <div className="col-span-3">
                <Label className={`text-xs mb-1 block ${showValidationErrors && ligne.typeOperation !== "none" && (!ligne.prixUnit || ligne.prixUnit <= 0) ? "text-destructive" : "text-muted-foreground"}`}>
                  Prix unitaire {ligne.typeOperation !== "none" && "*"}
                </Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  min="0"
                  value={ligne.prixUnit || ""}
                  onChange={(e) => updateLigne(index, "prixUnit", parseInt(e.target.value) || 0)}
                  className={showValidationErrors && ligne.typeOperation !== "none" && (!ligne.prixUnit || ligne.prixUnit <= 0) ? "border-destructive" : ""}
                />
                {showValidationErrors && ligne.typeOperation !== "none" && (!ligne.prixUnit || ligne.prixUnit <= 0) && (
                  <p className="text-xs text-destructive mt-1">Requis</p>
                )}
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
}