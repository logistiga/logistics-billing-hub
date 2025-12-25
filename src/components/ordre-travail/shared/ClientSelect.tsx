import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client } from "@/services/api";

interface ClientSelectProps {
  value: string;
  onChange: (value: string) => void;
  clients: Client[];
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
}

export function ClientSelect({
  value,
  onChange,
  clients,
  isLoading = false,
  error,
  disabled = false,
}: ClientSelectProps) {
  return (
    <div className="space-y-2">
      <Label className={error ? "text-destructive" : ""}>Client *</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading || disabled}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={isLoading ? "Chargement..." : "Sélectionner un client"} />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
