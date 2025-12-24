import { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { avoirStore } from "@/lib/avoirStore";

// Types pour les factures
export interface InvoiceForAvoir {
  id: string;
  number: string;
  client: string;
  clientId: string;
  amount: number;
  paid?: number;
  date?: string;
}

interface CreateAvoirDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceForAvoir; // Si fourni, pré-remplit le formulaire
  invoices?: InvoiceForAvoir[]; // Liste des factures disponibles si pas de facture spécifique
  onAvoirCreated?: (avoir: ReturnType<typeof avoirStore.create>) => void;
}

const reasonOptions = [
  "Erreur de facturation",
  "Annulation de prestation",
  "Retour de matériel",
  "Réduction commerciale",
  "Double facturation",
  "Autre",
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

export function CreateAvoirDialog({
  open,
  onOpenChange,
  invoice,
  invoices = [],
  onAvoirCreated,
}: CreateAvoirDialogProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [reasonType, setReasonType] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      if (invoice) {
        setSelectedInvoiceId(invoice.id);
      } else {
        setSelectedInvoiceId("");
      }
      setAmount("");
      setReasonType("");
      setCustomReason("");
    }
  }, [open, invoice]);

  // Récupérer la facture sélectionnée
  const selectedInvoice = invoice || invoices.find((inv) => inv.id === selectedInvoiceId);

  // Calculer le montant maximum
  const maxAmount = selectedInvoice ? selectedInvoice.amount : 0;

  // Validation du formulaire
  const validateForm = (): string | null => {
    if (!selectedInvoice) {
      return "Veuillez sélectionner une facture";
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Veuillez entrer un montant valide supérieur à 0";
    }

    if (amountValue > maxAmount) {
      return `Le montant ne peut pas dépasser ${formatCurrency(maxAmount)}`;
    }

    if (!reasonType) {
      return "Veuillez sélectionner un motif";
    }

    if (reasonType === "Autre" && !customReason.trim()) {
      return "Veuillez préciser le motif";
    }

    return null;
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      toast({
        title: "Erreur de validation",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (!selectedInvoice) return;

    setIsSubmitting(true);

    try {
      const reason = reasonType === "Autre" ? customReason.trim() : reasonType;
      const amountValue = parseFloat(amount);

      // Générer le numéro d'avoir
      const year = new Date().getFullYear();
      const existingAvoirs = avoirStore.getAll();
      const currentYearAvoirs = existingAvoirs.filter((a) =>
        a.number.includes(`AV-${year}`)
      );
      const nextNumber = currentYearAvoirs.length + 1;
      const avoirNumber = `AV-${year}-${String(nextNumber).padStart(4, "0")}`;

      // Créer l'avoir dans le store
      const newAvoir = avoirStore.create({
        number: avoirNumber,
        clientId: selectedInvoice.clientId,
        clientName: selectedInvoice.client,
        linkedInvoice: selectedInvoice.number,
        date: new Date().toISOString().split("T")[0],
        originalAmount: amountValue,
        reason,
        createdBy: "Utilisateur", // À remplacer par l'utilisateur connecté
      });

      toast({
        title: "Avoir créé avec succès",
        description: `L'avoir ${avoirNumber} de ${formatCurrency(amountValue)} a été créé pour la facture ${selectedInvoice.number}`,
      });

      onAvoirCreated?.(newAvoir);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'avoir",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Créer un avoir
          </DialogTitle>
          <DialogDescription>
            Créez un avoir (note de crédit) à partir d'une facture existante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sélection de la facture (si pas de facture pré-sélectionnée) */}
          {!invoice && invoices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="invoice">Facture d'origine *</Label>
              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger id="invoice">
                  <SelectValue placeholder="Sélectionner une facture" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      <span className="flex items-center justify-between gap-4">
                        <span>{inv.number}</span>
                        <span className="text-muted-foreground text-sm">
                          {inv.client} - {formatCurrency(inv.amount)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Affichage de la facture sélectionnée */}
          {selectedInvoice && (
            <Alert className="bg-muted/50 border-border">
              <FileText className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span className="font-medium">{selectedInvoice.number}</span>
                <span className="text-sm text-muted-foreground">
                  Client: {selectedInvoice.client}
                </span>
                <span className="text-sm text-muted-foreground">
                  Montant facturé: {formatCurrency(selectedInvoice.amount)}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Montant de l'avoir */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant de l'avoir *</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
                min={0}
                max={maxAmount}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                FCFA
              </span>
            </div>
            {maxAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                Maximum: {formatCurrency(maxAmount)}
              </p>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motif de l'avoir *</Label>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Sélectionner un motif" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motif personnalisé */}
          {reasonType === "Autre" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Précisez le motif *</Label>
              <Textarea
                id="customReason"
                placeholder="Décrivez le motif de l'avoir..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Avertissement */}
          <Alert className="border-warning/30 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-sm">
              Une fois créé, l'avoir sera disponible pour compenser de futurs paiements du client.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedInvoice}
          >
            {isSubmitting ? "Création..." : "Créer l'avoir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
