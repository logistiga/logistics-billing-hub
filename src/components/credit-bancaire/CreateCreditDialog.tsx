import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateCreditDialog({ open, onOpenChange, onCreated }: CreateCreditDialogProps) {
  const handleCreate = () => {
    toast.success("Crédit créé avec succès");
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau crédit bancaire</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau crédit avec son échéancier
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Banque *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bgfi">BGFI Bank</SelectItem>
                <SelectItem value="uba">UBA Gabon</SelectItem>
                <SelectItem value="orabank">Orabank</SelectItem>
                <SelectItem value="ecobank">Ecobank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Objet du crédit *</Label>
            <Input placeholder="Ex: Acquisition véhicules" />
          </div>
          <div className="space-y-2">
            <Label>Capital emprunté (FCFA) *</Label>
            <Input type="number" placeholder="100000000" />
          </div>
          <div className="space-y-2">
            <Label>Taux d'intérêt (%) *</Label>
            <Input type="number" step="0.1" placeholder="8.5" />
          </div>
          <div className="space-y-2">
            <Label>Durée (mois) *</Label>
            <Input type="number" placeholder="60" />
          </div>
          <div className="space-y-2">
            <Label>Date de début *</Label>
            <Input type="date" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="gradient" onClick={handleCreate}>
            Créer le crédit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
