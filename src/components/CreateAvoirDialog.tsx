import { useState, useEffect } from "react";
import { FileText, AlertCircle, User } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Types pour les clients
export interface ClientForAvoir {
  id: string;
  name: string;
}

interface CreateAvoirDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceForAvoir; // Si fourni, pré-remplit le formulaire
  invoices?: InvoiceForAvoir[]; // Liste des factures disponibles si pas de facture spécifique
  clients?: ClientForAvoir[]; // Liste des clients pour les avoirs libres
  onAvoirCreated?: (avoir: ReturnType<typeof avoirStore.create>) => void;
}

const reasonOptions = [
  "Erreur de facturation",
  "Annulation de prestation",
  "Retour de matériel",
  "Réduction commerciale",
  "Double facturation",
  "Trop-perçu (double paiement)",
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
  clients = [],
  onAvoirCreated,
}: CreateAvoirDialogProps) {
  const [mode, setMode] = useState<"invoice" | "free">("invoice");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>(undefined);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [reasonType, setReasonType] = useState<string | undefined>(undefined);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      if (invoice) {
        setMode("invoice");
        setSelectedInvoiceId(invoice.id);
      } else {
        setSelectedInvoiceId(undefined);
      }
      setSelectedClientId(undefined);
      setAmount("");
      setReasonType(undefined);
      setCustomReason("");
    }
  }, [open, invoice]);

  // Récupérer la facture sélectionnée
  const selectedInvoice = invoice || invoices.find((inv) => inv.id === selectedInvoiceId);

  // Récupérer le client sélectionné (pour mode libre)
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Calculer le montant maximum (seulement en mode facture)
  const maxAmount = mode === "invoice" && selectedInvoice ? selectedInvoice.amount : undefined;

  // Validation du formulaire
  const validateForm = (): string | null => {
    if (mode === "invoice") {
      if (!selectedInvoice) {
        return "Veuillez sélectionner une facture";
      }
    } else {
      if (!selectedClientId) {
        return "Veuillez sélectionner un client";
      }
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "Veuillez entrer un montant valide supérieur à 0";
    }

    if (mode === "invoice" && maxAmount && amountValue > maxAmount) {
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

      // Déterminer le client et la facture liée
      let clientId: string;
      let clientName: string;
      let linkedInvoice: string | undefined;

      if (mode === "invoice" && selectedInvoice) {
        clientId = selectedInvoice.clientId;
        clientName = selectedInvoice.client;
        linkedInvoice = selectedInvoice.number;
      } else if (selectedClient) {
        clientId = selectedClient.id;
        clientName = selectedClient.name;
        linkedInvoice = undefined; // Avoir libre
      } else {
        throw new Error("Client non trouvé");
      }

      // Créer l'avoir dans le store
      const newAvoir = avoirStore.create({
        number: avoirNumber,
        clientId,
        clientName,
        linkedInvoice,
        date: new Date().toISOString().split("T")[0],
        originalAmount: amountValue,
        reason,
        createdBy: "Utilisateur", // À remplacer par l'utilisateur connecté
      });

      const description = linkedInvoice
        ? `L'avoir ${avoirNumber} de ${formatCurrency(amountValue)} a été créé pour la facture ${linkedInvoice}`
        : `L'avoir libre ${avoirNumber} de ${formatCurrency(amountValue)} a été créé pour ${clientName}`;

      toast({
        title: "Avoir créé avec succès",
        description,
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

  const canSubmit =
    (mode === "invoice" && selectedInvoice) ||
    (mode === "free" && selectedClientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Créer un avoir
          </DialogTitle>
          <DialogDescription>
            Créez un avoir (note de crédit) pour un client
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "invoice" | "free")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoice">Lié à une facture</TabsTrigger>
            <TabsTrigger value="free">Avoir libre</TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="space-y-4 mt-4">
            {/* Sélection de la facture */}
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
                        {inv.number} - {inv.client} ({formatCurrency(inv.amount)})
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
          </TabsContent>

          <TabsContent value="free" className="space-y-4 mt-4">
            {/* Sélection du client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info avoir libre */}
            <Alert className="bg-primary/10 border-primary/30">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Un avoir libre n'est pas lié à une facture spécifique. Idéal pour les trop-perçus découverts lors du rapprochement bancaire.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-2">
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
            {maxAmount && (
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
              Une fois créé, l'avoir sera disponible pour compenser de futurs paiements ou être remboursé.
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
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Création..." : "Créer l'avoir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}