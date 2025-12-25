import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TaxAPI } from "@/services/api/taxes.service";

interface TaxesSectionProps {
  taxes: TaxAPI[];
  selectedTaxIds: number[];
  onTaxChange: (taxIds: number[]) => void;
  isLoading?: boolean;
  subtotal: number;
}

export function TaxesSection({
  taxes,
  selectedTaxIds,
  onTaxChange,
  isLoading = false,
  subtotal,
}: TaxesSectionProps) {
  const handleTaxToggle = (taxId: number, checked: boolean) => {
    if (checked) {
      onTaxChange([...selectedTaxIds, taxId]);
    } else {
      onTaxChange(selectedTaxIds.filter((id) => id !== taxId));
    }
  };

  const calculateTaxAmount = (rate: number) => Math.round(subtotal * rate / 100);

  const totalTaxes = selectedTaxIds.reduce((sum, taxId) => {
    const tax = taxes.find((t) => t.id === taxId);
    return sum + (tax ? calculateTaxAmount(tax.rate) : 0);
  }, 0);

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Taxes applicables</Label>
          {isLoading ? (
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
                    onCheckedChange={(checked) => handleTaxToggle(tax.id, !!checked)}
                  />
                  <label
                    htmlFor={`tax-${tax.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {tax.name} ({tax.rate}%)
                    {tax.is_default && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Par défaut
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-right space-y-1 min-w-[200px]">
          <div className="text-muted-foreground">
            Sous-total HT:{" "}
            <span className="font-medium text-foreground">
              {subtotal.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
          {selectedTaxIds.map((taxId) => {
            const tax = taxes.find((t) => t.id === taxId);
            if (!tax) return null;
            const taxAmount = calculateTaxAmount(tax.rate);
            return (
              <div key={taxId} className="text-muted-foreground">
                {tax.name} ({tax.rate}%):{" "}
                <span className="font-medium text-foreground">
                  {taxAmount.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            );
          })}
          <div className="text-lg font-bold pt-2 border-t">
            Total TTC: {(subtotal + totalTaxes).toLocaleString("fr-FR")} FCFA
          </div>
        </div>
      </div>
    </div>
  );
}
