import { Calendar, CreditCard, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Credit, formatCurrency } from "./types";

interface CreditDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credit: Credit | null;
}

export function CreditDetailsDialog({ open, onOpenChange, credit }: CreditDetailsDialogProps) {
  if (!credit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Détails du crédit {credit.reference}
          </DialogTitle>
          <DialogDescription>
            Informations complètes et échéancier du crédit
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Banque</Label>
              <p className="font-medium">{credit.bank}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Objet</Label>
              <p className="font-medium">{credit.objetCredit}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Capital initial</Label>
              <p className="font-medium">{formatCurrency(credit.capitalInitial)} FCFA</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Capital restant</Label>
              <p className="font-medium text-destructive">{formatCurrency(credit.capitalRestant)} FCFA</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Taux d'intérêt</Label>
              <p className="font-medium">{credit.tauxInteret}%</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mensualité</Label>
              <p className="font-medium">{formatCurrency(credit.mensualite)} FCFA</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Période</Label>
              <p className="font-medium">{credit.dateDebut} → {credit.dateFin}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Échéances</Label>
              <p className="font-medium">{credit.echeancesPayees} / {credit.dureeTotal} payées</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Progression du remboursement</Label>
            <Progress 
              value={(credit.echeancesPayees / credit.dureeTotal) * 100} 
              className="h-3"
            />
            <p className="text-sm text-muted-foreground text-right">
              {((credit.echeancesPayees / credit.dureeTotal) * 100).toFixed(1)}% remboursé
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Prochain paiement:</span>
              <span>{credit.prochainPaiement}</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-semibold text-primary">{formatCurrency(credit.mensualite)} FCFA</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          <Button variant="gradient">
            <DollarSign className="h-4 w-4 mr-2" />
            Enregistrer paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
