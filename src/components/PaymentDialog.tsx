import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  X,
  Plus,
  Minus,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Types
export interface PayableDocument {
  id: string;
  number: string;
  client: string;
  clientId: string;
  date: string;
  amount: number;
  paid: number;
  type: "facture" | "ordre";
  documentType?: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: "especes" | "virement" | "cheque" | "carte" | "mobile";
  reference: string;
  banque?: string;
  notes?: string;
  isAdvance: boolean;
  documentIds: string[];
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: PayableDocument[];
  onPaymentComplete: (payment: Payment, updatedDocuments: PayableDocument[]) => void;
  mode?: "single" | "group" | "advance";
}

const paymentMethods = [
  { id: "especes", label: "Espèces", icon: Banknote, color: "text-green-500" },
  { id: "virement", label: "Virement", icon: Building2, color: "text-blue-500" },
  { id: "cheque", label: "Chèque", icon: FileText, color: "text-purple-500" },
  { id: "carte", label: "Carte bancaire", icon: CreditCard, color: "text-amber-500" },
  { id: "mobile", label: "Mobile Money", icon: Wallet, color: "text-cyan-500" },
];

const banques = [
  "BGFI Bank",
  "UGB",
  "Orabank",
  "BICIG",
  "Ecobank",
  "Autre",
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

export function PaymentDialog({
  open,
  onOpenChange,
  documents,
  onPaymentComplete,
  mode = "single",
}: PaymentDialogProps) {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [paymentType, setPaymentType] = useState<"full" | "partial" | "advance">(
    mode === "advance" ? "advance" : "full"
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState("");
  const [banque, setBanque] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize selected documents
  useEffect(() => {
    if (open) {
      if (mode === "single" && documents.length === 1) {
        setSelectedDocIds([documents[0].id]);
        const remaining = documents[0].amount - documents[0].paid;
        setAmount(remaining.toString());
      } else if (mode === "group") {
        setSelectedDocIds(documents.map((d) => d.id));
        const totalRemaining = documents.reduce(
          (sum, d) => sum + (d.amount - d.paid),
          0
        );
        setAmount(totalRemaining.toString());
      } else if (mode === "advance") {
        setSelectedDocIds(documents.map((d) => d.id));
        setPaymentType("advance");
        setAmount("");
      }
    }
  }, [open, documents, mode]);

  const selectedDocs = documents.filter((d) => selectedDocIds.includes(d.id));
  const totalAmount = selectedDocs.reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = selectedDocs.reduce((sum, d) => sum + d.paid, 0);
  const totalRemaining = totalAmount - totalPaid;
  const enteredAmount = parseFloat(amount) || 0;

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map((d) => d.id));
    }
  };

  const handlePaymentTypeChange = (type: "full" | "partial" | "advance") => {
    setPaymentType(type);
    if (type === "full") {
      setAmount(totalRemaining.toString());
    } else if (type === "advance") {
      setAmount("");
    }
  };

  const handleSubmit = () => {
    if (selectedDocIds.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un document",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mode de paiement",
        variant: "destructive",
      });
      return;
    }

    if (!enteredAmount || enteredAmount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod !== "especes" && !reference) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une référence de paiement",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      const payment: Payment = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: enteredAmount,
        method: paymentMethod as Payment["method"],
        reference: reference || `ESP-${Date.now()}`,
        banque: banque || undefined,
        notes: notes || undefined,
        isAdvance: paymentType === "advance",
        documentIds: selectedDocIds,
      };

      // Update documents with payment
      let remainingPayment = enteredAmount;
      const updatedDocuments = documents.map((doc) => {
        if (!selectedDocIds.includes(doc.id)) return doc;

        const docRemaining = doc.amount - doc.paid;
        const paymentForDoc = Math.min(remainingPayment, docRemaining);
        remainingPayment -= paymentForDoc;

        return {
          ...doc,
          paid: doc.paid + paymentForDoc,
        };
      });

      onPaymentComplete(payment, updatedDocuments);

      toast({
        title: "Paiement enregistré",
        description: `${formatCurrency(enteredAmount)} enregistré avec succès`,
      });

      // Reset form
      setPaymentMethod("");
      setAmount("");
      setReference("");
      setBanque("");
      setNotes("");
      setIsLoading(false);
      onOpenChange(false);
    }, 800);
  };

  const getTitle = () => {
    if (mode === "advance") return "Paiement par avance";
    if (mode === "group") return "Paiement groupé";
    return "Enregistrer un paiement";
  };

  const getDescription = () => {
    if (mode === "advance")
      return "Enregistrez un acompte avant la réalisation de la prestation";
    if (mode === "group")
      return "Payez plusieurs factures en une seule transaction";
    return "Enregistrez un paiement pour ce document";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Document Selection (for group payments) */}
          {(mode === "group" || documents.length > 1) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Documents à payer ({selectedDocIds.length}/{documents.length})
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedDocIds.length === documents.length
                    ? "Désélectionner tout"
                    : "Sélectionner tout"}
                </Button>
              </div>

              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {documents.map((doc) => {
                  const remaining = doc.amount - doc.paid;
                  const isSelected = selectedDocIds.includes(doc.id);
                  const isPaid = remaining <= 0;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => !isPaid && handleDocumentToggle(doc.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                        isSelected && "bg-primary/5",
                        isPaid && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isPaid}
                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{doc.number}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.type === "facture" ? "Facture" : "Ordre"}
                          </Badge>
                          {isPaid && (
                            <Badge className="bg-success/20 text-success text-xs">
                              Payé
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {doc.client}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(doc.amount)}
                        </p>
                        {doc.paid > 0 && !isPaid && (
                          <p className="text-xs text-muted-foreground">
                            Reste: {formatCurrency(remaining)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single Document Summary */}
          {mode === "single" && documents.length === 1 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{documents[0].number}</span>
                <Badge variant="outline">
                  {documents[0].type === "facture" ? "Facture" : "Ordre"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {documents[0].client}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold">{formatCurrency(documents[0].amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payé</p>
                  <p className="font-bold text-success">
                    {formatCurrency(documents[0].paid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reste</p>
                  <p className="font-bold text-primary">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de paiement</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={paymentType === "full" ? "default" : "outline"}
                className="h-auto py-3 flex-col gap-1"
                onClick={() => handlePaymentTypeChange("full")}
                disabled={totalRemaining <= 0}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">Paiement complet</span>
              </Button>
              <Button
                type="button"
                variant={paymentType === "partial" ? "default" : "outline"}
                className="h-auto py-3 flex-col gap-1"
                onClick={() => handlePaymentTypeChange("partial")}
              >
                <Calculator className="h-4 w-4" />
                <span className="text-xs">Paiement partiel</span>
              </Button>
              <Button
                type="button"
                variant={paymentType === "advance" ? "default" : "outline"}
                className="h-auto py-3 flex-col gap-1"
                onClick={() => handlePaymentTypeChange("advance")}
              >
                <Clock className="h-4 w-4" />
                <span className="text-xs">Avance</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Mode de paiement *</Label>
            <div className="grid grid-cols-5 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 flex-col gap-1",
                    paymentMethod === method.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <method.icon className={cn("h-5 w-5", method.color)} />
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Montant *</Label>
              {paymentType !== "advance" && totalRemaining > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => setAmount(totalRemaining.toString())}
                >
                  Solde restant: {formatCurrency(totalRemaining)}
                </Button>
              )}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-bold pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                FCFA
              </span>
            </div>
            {paymentType === "advance" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                L'avance sera déduite du montant total lors de la facturation
              </p>
            )}
          </div>

          {/* Reference (not for cash) */}
          {paymentMethod && paymentMethod !== "especes" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Référence *</Label>
                <Input
                  placeholder="N° de transaction"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              {(paymentMethod === "virement" || paymentMethod === "cheque") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Banque</Label>
                  <Select value={banque} onValueChange={setBanque}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {banques.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes (optionnel)</Label>
            <Textarea
              placeholder="Remarques sur ce paiement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Summary */}
          {selectedDocIds.length > 0 && enteredAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-lg p-4"
            >
              <p className="font-medium text-sm mb-2">Récapitulatif</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Documents:</span>
                <span className="font-medium text-right">
                  {selectedDocIds.length}
                </span>
                <span className="text-muted-foreground">Montant total:</span>
                <span className="font-medium text-right">
                  {formatCurrency(totalAmount)}
                </span>
                <span className="text-muted-foreground">Déjà payé:</span>
                <span className="font-medium text-right text-success">
                  {formatCurrency(totalPaid)}
                </span>
                <span className="text-muted-foreground">Ce paiement:</span>
                <span className="font-bold text-right text-primary">
                  {formatCurrency(enteredAmount)}
                </span>
                <Separator className="col-span-2 my-1" />
                <span className="text-muted-foreground">Reste après:</span>
                <span className="font-bold text-right">
                  {formatCurrency(Math.max(0, totalRemaining - enteredAmount))}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={isLoading || selectedDocIds.length === 0 || !enteredAmount}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⏳
                </motion.span>
                Traitement...
              </span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Enregistrer le paiement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
