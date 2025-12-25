import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/services/api";

interface ClientSectionProps {
  clientId: string;
  description: string;
  clients: Client[];
  isLoadingClients: boolean;
  onClientChange: (id: string) => void;
  onDescriptionChange: (desc: string) => void;
  clientError?: string;
  onClearClientError?: () => void;
}

export function ClientSection({
  clientId,
  description,
  clients,
  isLoadingClients,
  onClientChange,
  onDescriptionChange,
  clientError,
  onClearClientError,
}: ClientSectionProps) {
  const handleClientChange = (value: string) => {
    onClientChange(value);
    onClearClientError?.();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
        Informations Client
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={clientError ? "text-destructive" : ""}>Client *</Label>
          <Select value={clientId} onValueChange={handleClientChange} disabled={isLoadingClients}>
            <SelectTrigger className={clientError ? "border-destructive" : ""}>
              <SelectValue placeholder={isLoadingClients ? "Chargement..." : "Sélectionner un client"} />
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {clientError && <p className="text-sm text-destructive">{clientError}</p>}
        </div>
        <div className="space-y-2">
          <Label>Description générale</Label>
          <Textarea 
            placeholder="Description de l'ordre de travail..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
}
