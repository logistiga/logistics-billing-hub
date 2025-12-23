import { useState, useEffect } from "react";
import { Percent, Check, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TaxItem {
  id: string;
  name: string;
  code: string;
  rate: number;
  isDefault: boolean;
}

interface TaxSelectorProps {
  taxes: TaxItem[];
  selectedTaxIds: string[];
  onSelectionChange: (taxIds: string[]) => void;
  documentType?: "devis" | "ordres" | "factures";
  disabled?: boolean;
  className?: string;
  showTotal?: boolean;
}

// Default taxes available in the system
export const defaultAvailableTaxes: TaxItem[] = [
  { id: "1", name: "TVA Standard", code: "TVA18", rate: 18, isDefault: true },
  { id: "2", name: "CSS", code: "CSS1", rate: 1, isDefault: true },
  { id: "3", name: "TVA Réduite", code: "TVA10", rate: 10, isDefault: false },
  { id: "4", name: "Exonéré", code: "EXO", rate: 0, isDefault: false },
];

export function TaxSelector({
  taxes = defaultAvailableTaxes,
  selectedTaxIds,
  onSelectionChange,
  documentType = "factures",
  disabled = false,
  className,
  showTotal = true,
}: TaxSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTaxes = taxes.filter((t) => selectedTaxIds.includes(t.id));
  const totalRate = selectedTaxes.reduce((sum, t) => sum + t.rate, 0);

  const handleToggle = (taxId: string) => {
    if (selectedTaxIds.includes(taxId)) {
      onSelectionChange(selectedTaxIds.filter((id) => id !== taxId));
    } else {
      onSelectionChange([...selectedTaxIds, taxId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(taxes.map((t) => t.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleSelectDefaults = () => {
    const defaultIds = taxes.filter((t) => t.isDefault).map((t) => t.id);
    onSelectionChange(defaultIds);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              selectedTaxIds.length === 0 && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              {selectedTaxIds.length === 0 ? (
                <span>Sélectionner les taxes</span>
              ) : (
                <span>
                  {selectedTaxIds.length} taxe(s) sélectionnée(s)
                </span>
              )}
            </div>
            {selectedTaxIds.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalRate}%
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Taxes applicables</span>
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleSelectDefaults}
                      >
                        Défauts
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sélectionner les taxes par défaut</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleSelectAll}
                >
                  Tout
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleClearAll}
                >
                  Aucun
                </Button>
              </div>
            </div>
          </div>

          <div className="p-2 max-h-64 overflow-y-auto">
            {taxes.map((tax) => {
              const isSelected = selectedTaxIds.includes(tax.id);
              return (
                <div
                  key={tax.id}
                  onClick={() => handleToggle(tax.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(tax.id)}
                      className="pointer-events-none"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{tax.name}</span>
                        {tax.isDefault && (
                          <Badge variant="outline" className="text-xs h-5">
                            Défaut
                          </Badge>
                        )}
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {tax.code}
                      </code>
                    </div>
                  </div>
                  <span className={cn(
                    "text-lg font-bold",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}>
                    {tax.rate}%
                  </span>
                </div>
              );
            })}
          </div>

          {selectedTaxIds.length > 0 && (
            <div className="p-3 border-t bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total taxes:</span>
                <span className="text-lg font-bold text-primary">{totalRate}%</span>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Display selected taxes */}
      {showTotal && selectedTaxes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTaxes.map((tax) => (
            <Badge
              key={tax.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {tax.code} ({tax.rate}%)
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleToggle(tax.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Total: {totalRate}%
          </Badge>
        </div>
      )}
    </div>
  );
}

// Hook to manage tax selection with defaults
export function useTaxSelection(taxes: TaxItem[] = defaultAvailableTaxes) {
  const defaultTaxIds = taxes.filter((t) => t.isDefault).map((t) => t.id);
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>(defaultTaxIds);

  const selectedTaxes = taxes.filter((t) => selectedTaxIds.includes(t.id));
  const totalRate = selectedTaxes.reduce((sum, t) => sum + t.rate, 0);

  const calculateTaxAmount = (baseAmount: number): number => {
    return (baseAmount * totalRate) / 100;
  };

  const calculateTotalWithTax = (baseAmount: number): number => {
    return baseAmount + calculateTaxAmount(baseAmount);
  };

  const getTaxBreakdown = (baseAmount: number) => {
    return selectedTaxes.map((tax) => ({
      ...tax,
      amount: (baseAmount * tax.rate) / 100,
    }));
  };

  const reset = () => {
    setSelectedTaxIds(defaultTaxIds);
  };

  return {
    selectedTaxIds,
    setSelectedTaxIds,
    selectedTaxes,
    totalRate,
    calculateTaxAmount,
    calculateTotalWithTax,
    getTaxBreakdown,
    reset,
  };
}

// Component to display tax summary in documents
interface TaxSummaryProps {
  baseAmount: number;
  selectedTaxIds: string[];
  taxes?: TaxItem[];
  className?: string;
}

export function TaxSummary({
  baseAmount,
  selectedTaxIds,
  taxes = defaultAvailableTaxes,
  className,
}: TaxSummaryProps) {
  const selectedTaxes = taxes.filter((t) => selectedTaxIds.includes(t.id));
  const totalTaxAmount = selectedTaxes.reduce(
    (sum, t) => sum + (baseAmount * t.rate) / 100,
    0
  );
  const totalWithTax = baseAmount + totalTaxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  if (selectedTaxes.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-sm">
          <span>Sous-total HT</span>
          <span className="font-medium">{formatCurrency(baseAmount)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Taxes</span>
          <span>Aucune</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total TTC</span>
          <span>{formatCurrency(baseAmount)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>Sous-total HT</span>
        <span className="font-medium">{formatCurrency(baseAmount)}</span>
      </div>

      {selectedTaxes.map((tax) => {
        const taxAmount = (baseAmount * tax.rate) / 100;
        return (
          <div key={tax.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {tax.name} ({tax.rate}%)
            </span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        );
      })}

      {selectedTaxes.length > 1 && (
        <div className="flex justify-between text-sm text-primary">
          <span>Total taxes</span>
          <span className="font-medium">{formatCurrency(totalTaxAmount)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-lg pt-2 border-t">
        <span>Total TTC</span>
        <span className="text-primary">{formatCurrency(totalWithTax)}</span>
      </div>
    </div>
  );
}
