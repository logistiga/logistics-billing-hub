import { Truck } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TransportSection } from "@/components/ordre-travail/TransportSection";
import type { TransportData } from "@/components/ordre-travail/types";

interface TransportToggleSectionProps {
  hasTransport: boolean;
  transportData: TransportData;
  onToggle: (value: boolean) => void;
  onChange: (field: keyof TransportData, value: string | number) => void;
}

export function TransportToggleSection({
  hasTransport,
  transportData,
  onToggle,
  onChange,
}: TransportToggleSectionProps) {
  return (
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
            onCheckedChange={onToggle}
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
            onChange={onChange} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
