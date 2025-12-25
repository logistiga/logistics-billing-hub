import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { LignesPrestationSection } from "@/components/ordre-travail/LignesPrestationSection";
import type { LignePrestation } from "@/components/ordre-travail/types";
import type { TaxAPI } from "@/services/api/taxes.service";

interface LignesPrestationWrapperProps {
  lignes: LignePrestation[];
  hasTransport: boolean;
  showValidationErrors: boolean;
  taxes: TaxAPI[];
  selectedTaxIds: number[];
  isLoadingTaxes: boolean;
  subtotal: number;
  onLignesChange: (lignes: LignePrestation[]) => void;
  onTaxToggle: (taxId: number) => void;
  calculateTaxAmount: (tax: TaxAPI) => number;
  totalTTC: number;
}

export function LignesPrestationWrapper({
  lignes,
  hasTransport,
  showValidationErrors,
  taxes,
  selectedTaxIds,
  isLoadingTaxes,
  subtotal,
  onLignesChange,
  onTaxToggle,
  calculateTaxAmount,
  totalTTC,
}: LignesPrestationWrapperProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
        Lignes de prestation
        <span className="text-sm font-normal text-muted-foreground ml-2">
          (Manutention, Stockage, Location)
        </span>
      </h3>
      
      <LignesPrestationSection 
        lignes={lignes} 
        onChange={onLignesChange} 
        isTransport={hasTransport} 
        showValidationErrors={showValidationErrors} 
      />

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
                      onCheckedChange={() => onTaxToggle(tax.id)}
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
              Sous-total HT: <span className="font-medium text-foreground">{subtotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
            {selectedTaxIds.map(taxId => {
              const tax = taxes.find(t => t.id === taxId);
              if (!tax) return null;
              return (
                <div key={taxId} className="text-muted-foreground">
                  {tax.name} ({tax.rate}%): <span className="font-medium text-foreground">{calculateTaxAmount(tax).toLocaleString("fr-FR")} FCFA</span>
                </div>
              );
            })}
            <div className="text-lg font-bold pt-2 border-t">
              Total TTC: {totalTTC.toLocaleString("fr-FR")} FCFA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
