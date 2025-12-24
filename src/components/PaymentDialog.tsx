import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Building2,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Landmark,
  Wallet,
  ReceiptText,
  ArrowLeftRight,
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
import { avoirStore } from "@/lib/avoirStore";

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
  avoirIds?: string[];
  avoirAmount?: number;
}

// Avoir (Credit Note) interface
export interface CreditNote {
  id: string;
  number: string;
  clientId: string;
  client: string;
  date: string;
  amount: number;
  appliedAmount: number;
  status: "disponible" | "partiellement_utilise" | "utilise";
  linkedInvoice?: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: PayableDocument[];
  onPaymentComplete: (payment: Payment, updatedDocuments: PayableDocument[]) => void;
  mode?: "single" | "group" | "advance";
  availableCredits?: CreditNote[];
  onCreditsApplied?: (appliedCredits: { id: string; amount: number }[]) => void;
}

// Moyens de paiement Gabon uniquement
const paymentMethods = [
  { id: "especes", label: "Espèces", icon: Banknote, color: "text-green-500" },
  { id: "virement", label: "Virement", icon: Building2, color: "text-blue-500" },
  { id: "cheque", label: "Chèque", icon: FileText, color: "text-purple-500" },
];

// Banques du Gabon avec soldes
export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  solde: number;
}

const mockBanques: BankAccount[] = [
  { id: "1", bankName: "BGFI Bank Gabon", accountNumber: "0001 0000 1234 5678", solde: 15000000 },
  { id: "2", bankName: "UGB - Union Gabonaise de Banque", accountNumber: "0002 0000 9876 5432", solde: 8500000 },
  { id: "3", bankName: "Ecobank Gabon", accountNumber: "0003 0000 5555 6666", solde: 12000000 },
  { id: "4", bankName: "Orabank Gabon", accountNumber: "0004 0000 7777 8888", solde: 5000000 },
  { id: "5", bankName: "BICIG", accountNumber: "0005 0000 1111 2222", solde: 9500000 },
];

// Caisse globale mock
let caisseGlobale = {
  solde: 4500000,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
};

export function PaymentDialog({
  open,
  onOpenChange,
  documents,
  onPaymentComplete,
  mode = "single",
  availableCredits = [],
  onCreditsApplied,
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
  
  // État pour les avoirs sélectionnés
  const [selectedAvoirIds, setSelectedAvoirIds] = useState<string[]>([]);
  const [avoirAmounts, setAvoirAmounts] = useState<Record<string, number>>({});

  // Filtrer les avoirs disponibles pour le client du document
  const clientId = documents.length > 0 ? documents[0].clientId : "";
  const clientAvoirs = availableCredits.filter(
    (credit) => credit.clientId === clientId && credit.status !== "utilise"
  );

  // Calculer le montant total des avoirs sélectionnés
  const totalAvoirAmount = selectedAvoirIds.reduce(
    (sum, id) => sum + (avoirAmounts[id] || 0),
    0
  );

  // Initialize selected documents
  useEffect(() => {
    if (open) {
      // Reset avoirs selection
      setSelectedAvoirIds([]);
      setAvoirAmounts({});
      
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
  
  // Montant restant après application des avoirs
  const remainingAfterAvoirs = Math.max(0, totalRemaining - totalAvoirAmount);
  
  // Montant effectif à payer (en espèces/virement/chèque)
  const effectivePaymentAmount = Math.max(0, enteredAmount - totalAvoirAmount);

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

  // Gestion de la sélection d'un avoir
  const handleAvoirToggle = (avoirId: string) => {
    setSelectedAvoirIds((prev) => {
      if (prev.includes(avoirId)) {
        // Désélectionner et supprimer le montant
        const newAmounts = { ...avoirAmounts };
        delete newAmounts[avoirId];
        setAvoirAmounts(newAmounts);
        return prev.filter((id) => id !== avoirId);
      } else {
        // Sélectionner avec le montant disponible par défaut
        const avoir = clientAvoirs.find((a) => a.id === avoirId);
        if (avoir) {
          const availableAmount = avoir.amount - avoir.appliedAmount;
          setAvoirAmounts((prev) => ({ ...prev, [avoirId]: availableAmount }));
        }
        return [...prev, avoirId];
      }
    });
  };

  // Modifier le montant d'un avoir sélectionné
  const handleAvoirAmountChange = (avoirId: string, value: string) => {
    const avoir = clientAvoirs.find((a) => a.id === avoirId);
    if (!avoir) return;
    
    const maxAmount = avoir.amount - avoir.appliedAmount;
    const newAmount = Math.min(Math.max(0, parseFloat(value) || 0), maxAmount);
    setAvoirAmounts((prev) => ({ ...prev, [avoirId]: newAmount }));
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

    // Vérifier si un paiement est nécessaire (soit avoir, soit mode de paiement)
    const hasAvoirPayment = totalAvoirAmount > 0;
    const hasCashPayment = effectivePaymentAmount > 0;
    
    if (!hasAvoirPayment && !paymentMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mode de paiement ou un avoir",
        variant: "destructive",
      });
      return;
    }

    if (hasCashPayment && !paymentMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un mode de paiement pour le montant restant",
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

    // Validation pour Chèque et Virement: référence et banque obligatoires
    if (hasCashPayment && (paymentMethod === "cheque" || paymentMethod === "virement")) {
      if (!reference) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer une référence de paiement",
          variant: "destructive",
        });
        return;
      }
      if (!banque) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une banque",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      const selectedBank = mockBanques.find(b => b.id === banque);
      
      // Créer la liste des avoirs appliqués
      const appliedCredits = selectedAvoirIds.map((id) => ({
        id,
        amount: avoirAmounts[id] || 0,
      }));
      
      const paymentId = Date.now().toString();
      
      const payment: Payment = {
        id: paymentId,
        date: new Date().toISOString(),
        amount: enteredAmount,
        method: paymentMethod as Payment["method"],
        reference: reference || `ESP-${Date.now()}`,
        banque: selectedBank?.bankName || undefined,
        notes: notes || undefined,
        isAdvance: paymentType === "advance",
        documentIds: selectedDocIds,
        avoirIds: selectedAvoirIds.length > 0 ? selectedAvoirIds : undefined,
        avoirAmount: totalAvoirAmount > 0 ? totalAvoirAmount : undefined,
      };

      // Appliquer les compensations d'avoirs via le store
      if (appliedCredits.length > 0 && selectedDocs.length > 0) {
        const firstDoc = selectedDocs[0];
        const paymentMethodLabel = totalAvoirAmount === enteredAmount 
          ? "Avoir uniquement" 
          : `Mixte (Avoir + ${paymentMethod === "especes" ? "Espèces" : paymentMethod === "virement" ? "Virement" : "Chèque"})`;
        
        // Transformer appliedCredits pour correspondre au format attendu
        const compensationsToApply = appliedCredits.map((c) => ({
          avoirId: c.id,
          amount: c.amount,
        }));
        
        const result = avoirStore.applyMultipleCompensations(
          compensationsToApply,
          firstDoc.id,
          firstDoc.number,
          firstDoc.type,
          paymentId,
          paymentMethodLabel,
          "Utilisateur", // TODO: récupérer le nom de l'utilisateur connecté
          notes
        );

        if (!result.success && result.errors.length > 0) {
          console.warn("Erreurs lors de l'application des avoirs:", result.errors);
        }
      }

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

      // Notifier les avoirs appliqués
      if (onCreditsApplied && appliedCredits.length > 0) {
        onCreditsApplied(appliedCredits);
      }

      onPaymentComplete(payment, updatedDocuments);

      // Message de confirmation selon le mode de paiement
      let confirmMessage = "";
      
      // Montant effectif encaissé (hors avoirs)
      const cashAmount = effectivePaymentAmount;
      
      if (totalAvoirAmount > 0) {
        confirmMessage += `${formatCurrency(totalAvoirAmount)} compensé par avoir. `;
      }
      
      if (cashAmount > 0) {
        if (paymentMethod === "especes") {
          caisseGlobale.solde += cashAmount;
          confirmMessage += `${formatCurrency(cashAmount)} encaissé en espèces. Caisse mise à jour.`;
        } else if (paymentMethod === "virement" || paymentMethod === "cheque") {
          if (selectedBank) {
            selectedBank.solde += cashAmount;
            confirmMessage += `${formatCurrency(cashAmount)} par ${paymentMethod === "virement" ? "virement" : "chèque"} sur ${selectedBank.bankName}. Banque mise à jour.`;
          }
        }
      }

      toast({
        title: "Paiement enregistré",
        description: confirmMessage,
      });

      // Reset form
      setPaymentMethod("");
      setAmount("");
      setReference("");
      setBanque("");
      setNotes("");
      setSelectedAvoirIds([]);
      setAvoirAmounts({});
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
            <Banknote className="h-5 w-5 text-primary" />
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

          {/* Sélection des avoirs disponibles */}
          {clientAvoirs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-orange-500" />
                <Label className="text-sm font-medium">Compenser avec un avoir</Label>
                {totalAvoirAmount > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-600 text-xs">
                    -{formatCurrency(totalAvoirAmount)}
                  </Badge>
                )}
              </div>
              
              <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                {clientAvoirs.map((avoir) => {
                  const availableAmount = avoir.amount - avoir.appliedAmount;
                  const isSelected = selectedAvoirIds.includes(avoir.id);

                  return (
                    <div
                      key={avoir.id}
                      className={cn(
                        "flex items-center gap-3 p-3 transition-colors",
                        isSelected && "bg-orange-500/5"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleAvoirToggle(avoir.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{avoir.number}</span>
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                            Avoir
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Disponible: {formatCurrency(availableAmount)}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={avoirAmounts[avoir.id] || 0}
                            onChange={(e) => handleAvoirAmountChange(avoir.id, e.target.value)}
                            className="w-28 h-8 text-sm text-right"
                            max={availableAmount}
                          />
                          <span className="text-xs text-muted-foreground">FCFA</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {totalAvoirAmount > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-xs text-orange-700">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>
                    <strong>{formatCurrency(totalAvoirAmount)}</strong> sera compensé par avoir. 
                    Reste à payer: <strong>{formatCurrency(remainingAfterAvoirs)}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Mode de paiement *</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 flex-col gap-1",
                    paymentMethod === method.id && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    setPaymentMethod(method.id);
                    // Reset banque si on change de méthode
                    if (method.id === "especes") {
                      setBanque("");
                    }
                  }}
                >
                  <method.icon className={cn("h-5 w-5", method.color)} />
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
            
            {/* Info sur la destination du paiement */}
            {paymentMethod && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                {paymentMethod === "especes" ? (
                  <>
                    <Wallet className="h-4 w-4 text-amber-500" />
                    <span>Ce paiement sera ajouté à la <strong>Caisse</strong> (Solde actuel: {formatCurrency(caisseGlobale.solde)})</span>
                  </>
                ) : (
                  <>
                    <Landmark className="h-4 w-4 text-blue-500" />
                    <span>Ce paiement sera ajouté au compte <strong>Banque</strong> sélectionné</span>
                  </>
                )}
              </div>
            )}
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
                  <Label className="text-sm font-medium">Banque *</Label>
                  <Select value={banque} onValueChange={setBanque}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la banque" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBanques.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{b.bankName}</span>
                            <span className="text-xs text-muted-foreground">
                              Solde: {formatCurrency(b.solde)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {banque && (
                    <p className="text-xs text-muted-foreground">
                      N° Compte: {mockBanques.find(b => b.id === banque)?.accountNumber}
                    </p>
                  )}
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
                
                {totalAvoirAmount > 0 && (
                  <>
                    <span className="text-muted-foreground">Avoir appliqué:</span>
                    <span className="font-medium text-right text-orange-600">
                      -{formatCurrency(totalAvoirAmount)}
                    </span>
                  </>
                )}
                
                <span className="text-muted-foreground">Ce paiement:</span>
                <span className="font-bold text-right text-primary">
                  {formatCurrency(enteredAmount)}
                </span>
                
                {totalAvoirAmount > 0 && (
                  <>
                    <span className="text-muted-foreground text-xs">(dont avoir: {formatCurrency(totalAvoirAmount)})</span>
                    <span className="text-xs text-right text-muted-foreground">
                      (espèces/banque: {formatCurrency(effectivePaymentAmount)})
                    </span>
                  </>
                )}
                
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
